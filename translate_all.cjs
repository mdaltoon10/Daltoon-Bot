const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = './src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
let uniqueStrings = new Map(); // en -> fa

for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const regex = /lang\s*===\s*["']fa["']\s*\?\s*"([^"]+)"\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        uniqueStrings.set(match[2], match[1]);
    }
}

async function translateBatch(texts, targetLang) {
    // Join with \n
    const joined = texts.join('\n');
    return new Promise((resolve, reject) => {
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
                    resolve(translated.split('\n').map(s => s.trim()));
                } catch (e) {
                    resolve(texts);
                }
            });
        });
        req.on('error', (e) => resolve(texts));
        req.write(postData);
        req.end();
    });
}

(async () => {
    const enTexts = Array.from(uniqueStrings.keys());
    const langs = ['ar', 'ru', 'tr', 'es'];
    const dictionary = {};
    for (const en of enTexts) {
        dictionary[en] = { fa: uniqueStrings.get(en) };
    }

    // Process in batches of 50
    for (const lang of langs) {
        console.log(`Translating to ${lang}...`);
        for (let i = 0; i < enTexts.length; i += 50) {
            const batch = enTexts.slice(i, i + 50);
            const translatedBatch = await translateBatch(batch, lang);
            
            for (let j = 0; j < batch.length; j++) {
                // sometimes split might mismatch if newlines get lost, but mostly it works
                if (translatedBatch[j]) {
                    dictionary[batch[j]][lang] = translatedBatch[j];
                } else {
                    dictionary[batch[j]][lang] = batch[j];
                }
            }
        }
    }

    fs.writeFileSync('./src/dynamic_dict.ts', `import { Language } from './locales';\n\nexport const dynamicDictionary: Record<string, Partial<Record<Language, string>>> = ${JSON.stringify(dictionary, null, 2)};\n`);
    console.log("Dictionary generated.");

    // Now replace in files
    for (const file of files) {
        let content = fs.readFileSync(path.join(dir, file), 'utf-8');
        let modified = false;
        
        // Add import
        if (!content.includes('translateText')) {
            content = `import { translateText } from "../locales";\n` + content;
        }

        const regex = /lang\s*===\s*["']fa["']\s*\?\s*"([^"]+)"\s*:\s*"([^"]+)"/g;
        content = content.replace(regex, (match, fa, en) => {
            modified = true;
            return `translateText("${en}", "${fa}", lang)`;
        });

        if (modified) {
            fs.writeFileSync(path.join(dir, file), content, 'utf-8');
        }
    }
    console.log("Files updated.");
})();
