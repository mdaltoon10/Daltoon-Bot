const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    let errMsg = error.message || "Failed to generate AI response.";
    
    // Sanitize HTML errors
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "خطای ارتباط با سرور هوش مصنوعی (Forbidden/Proxy Error). لطفاً آدرس Base URL یا وضعیت شبکه را بررسی کنید.";
    }

    if (errMsg.startsWith("{")) {`;

code = code.replace(
  '    let errMsg = error.message || "Failed to generate AI response.";\n    if (errMsg.startsWith("{")) {',
  replacement
);

const testReplacement = `
    let errMsg = error.message || "Failed to test AI key.";
    
    // Sanitize HTML errors
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "خطای 403 (Forbidden) - لطفاً آدرس Base URL یا وضعیت پروکسی خود را بررسی کنید.";
    }

    if (errMsg.startsWith("{")) {`;

code = code.replace(
  '    let errMsg = error.message || "Failed to test AI key.";\n    if (errMsg.startsWith("{")) {',
  testReplacement
);

fs.writeFileSync('server.ts', code);
