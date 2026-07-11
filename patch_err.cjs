const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `    let errMsg = error.message || "Failed to generate AI response.";

    if (errMsg.startsWith("{")) {`;

const repl1 = `    let errMsg = error.message || "Failed to generate AI response.";
    
    // Sanitize HTML errors
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "خطای ارتباط با سرور هوش مصنوعی (Forbidden/Proxy Error). لطفاً آدرس Base URL یا وضعیت شبکه را بررسی کنید.";
    }

    if (errMsg.startsWith("{")) {`;

code = code.replace(target1, repl1);


const target2 = `    let errMsg = error.message || "Failed to test AI key.";

    if (errMsg.startsWith("{")) {`;

const repl2 = `    let errMsg = error.message || "Failed to test AI key.";
    
    // Sanitize HTML errors
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "خطای ارتباط با سرور هوش مصنوعی (Forbidden/Proxy Error). لطفاً آدرس Base URL یا وضعیت شبکه را بررسی کنید.";
    }

    if (errMsg.startsWith("{")) {`;

code = code.replace(target2, repl2);

fs.writeFileSync('server.ts', code);
