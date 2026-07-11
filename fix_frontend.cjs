const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsPanel.tsx', 'utf8');

code = code.replace(
  'setGeminiTestResult({ success: false, message: err.message || "خطا در ارتباط با سرور" });',
  'setGeminiTestResult({ success: false, message: err.message === "Failed to fetch" ? "ارتباط با سرور قطع شد (Failed to fetch). سرور متوقف شده یا اینترنت/VPN شما مشکل دارد." : err.message || "خطا در ارتباط با سرور" });'
);

code = code.replace(
  'setCustomTestResult({ success: false, message: err.message || "خطا در ارتباط با سرور" });',
  'setCustomTestResult({ success: false, message: err.message === "Failed to fetch" ? "ارتباط با سرور قطع شد (Failed to fetch). سرور متوقف شده یا اینترنت/VPN شما مشکل دارد." : err.message || "خطا در ارتباط با سرور" });'
);

fs.writeFileSync('src/components/SettingsPanel.tsx', code);
