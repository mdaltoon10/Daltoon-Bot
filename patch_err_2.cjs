const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target2 = `    let errMsg = err.message || "بررسی کلید API با خطا مواجه شد.";
    // Parse GoogleGenAI JSON error messages to be user-friendly
    if (errMsg.startsWith("{")) {`;

const repl2 = `    let errMsg = err.message || "بررسی کلید API با خطا مواجه شد.";
    
    // Sanitize HTML errors
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "خطای ارتباط با سرور هوش مصنوعی (Forbidden/Proxy Error). لطفاً آدرس Base URL یا وضعیت شبکه را بررسی کنید.";
    }

    // Parse GoogleGenAI JSON error messages to be user-friendly
    if (errMsg.startsWith("{")) {`;

code = code.replace(target2, repl2);

fs.writeFileSync('server.ts', code);
