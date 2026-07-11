const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const ai = new GoogleGenAI({ apiKey: apiKeyToUse, ...(finalBaseUrl ? { baseUrl: finalBaseUrl } : {}) });',
  'const ai = new GoogleGenAI({ apiKey: apiKeyToUse, ...(finalBaseUrl ? { httpOptions: { baseUrl: finalBaseUrl } } : {}) });'
);

const target2 = `      const ai = new GoogleGenAI({
        apiKey: trimmedKey,
        ...(finalBaseUrl ? { baseUrl: finalBaseUrl } : {})
      });`;

const repl2 = `      const ai = new GoogleGenAI({
        apiKey: trimmedKey,
        ...(finalBaseUrl ? { httpOptions: { baseUrl: finalBaseUrl } } : {})
      });`;

code = code.replace(target2, repl2);

fs.writeFileSync('server.ts', code);
