const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = './src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

async function translateBatch(texts, targetLang) {
    const joined = texts.join('\n--SPLIT--\n');
    return new Promise((resolve) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t`;
        const postData = `q=${encodeURIComponent(joined)}`;
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const translated = parsed[0].map(x => x[0]).join('');
                    resolve(translated.split('\n--SPLIT--\n').map(s => s.trim()));
                } catch (e) {
                    resolve(texts);
                }
            });
        });
        req.on('error', () => resolve(texts));
        req.write(postData);
        req.end();
    });
}

(async () => {
    let uniqueStrings = new Map();
    
    // Find backtick patterns: lang === "fa" ? `...` : `...`
    // We'll use a manual parser since regex for balanced backticks is tricky if they contain nested backticks, 
    // but here they probably don't.
    const regex = /lang\s*===\s*["']fa["']\s*\?\s*`([^`]+)`\s*:\s*`([^`]+)`/g;

    for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        let match;
        while ((match = regex.exec(content)) !== null) {
            uniqueStrings.set(match[2], match[1]);
        }
    }

    const enTexts = Array.from(uniqueStrings.keys());
    if (enTexts.length === 0) {
        console.log("No backtick strings found.");
        return;
    }

    console.log(`Found ${enTexts.length} backtick strings`);

    const langs = ['ar', 'ru', 'tr', 'es'];
    const dictionary = {};
    for (const en of enTexts) {
        dictionary[en] = { fa: uniqueStrings.get(en) };
    }

    for (const lang of langs) {
        console.log(`Translating to ${lang}...`);
        for (let i = 0; i < enTexts.length; i += 10) {
            const batch = enTexts.slice(i, i + 10);
            const translatedBatch = await translateBatch(batch, lang);
            
            for (let j = 0; j < batch.length; j++) {
                if (translatedBatch[j]) {
                    dictionary[batch[j]][lang] = translatedBatch[j];
                } else {
                    dictionary[batch[j]][lang] = batch[j];
                }
            }
        }
    }

    // Append to dynamic_dict.ts
    let dictContent = fs.readFileSync('./src/dynamic_dict.ts', 'utf-8');
    // Remove the trailing '};'
    dictContent = dictContent.replace(/\};\s*$/, '');
    
    let toAppend = '';
    for (const [en, trans] of Object.entries(dictionary)) {
        toAppend += `,\n  ${JSON.stringify(en)}: ${JSON.stringify(trans)}`;
    }
    toAppend += '\n};\n';
    
    fs.writeFileSync('./src/dynamic_dict.ts', dictContent + toAppend, 'utf-8');

    // Replace in files
    for (const file of files) {
        let content = fs.readFileSync(path.join(dir, file), 'utf-8');
        let modified = false;

        content = content.replace(regex, (match, fa, en) => {
            modified = true;
            return `translateText(\`${en}\`, \`${fa}\`, lang)`;
        });

        if (modified) {
            fs.writeFileSync(path.join(dir, file), content, 'utf-8');
        }
    }
})();
