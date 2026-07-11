const fs = require('fs');
let code = fs.readFileSync('src/components/MultiServerConfig.tsx', 'utf8');

code = code.replace(/\{translateText\(\s*\? \(isColleague \? "🔌 مدیریت سرورهای همکاران" : "🔌 مدیریت سرورهای X-UI"\)\s*: \(isColleague \? "🔌 Colleague Servers Management" : "🔌 X-UI Servers Management"\)\}/g, 
  '{isColleague ? translateText("🔌 Colleague Servers Management", "🔌 مدیریت سرورهای همکاران", lang) : translateText("🔌 X-UI Servers Management", "🔌 مدیریت سرورهای X-UI", lang)}');

code = code.replace(/\{translateText\(\s*\? \(isColleague \? "پنل‌های مخصوص همکاران را برای ساخت خودکار اشتراک‌های همکار اضافه کنید." : "پنل‌های خود را برای ساخت خودکار اشتراک‌ها اضافه کنید."\)\s*: \(isColleague \? "Manage X-UI panels designated for colleague accounts subscription delivery." : "Manage your X-UI panels for automated subscription delivery."\)\}/g, 
  '{isColleague ? translateText("Manage X-UI panels designated for colleague accounts subscription delivery.", "پنل‌های مخصوص همکاران را برای ساخت خودکار اشتراک‌های همکار اضافه کنید.", lang) : translateText("Manage your X-UI panels for automated subscription delivery.", "پنل‌های خود را برای ساخت خودکار اشتراک‌ها اضافه کنید.", lang)}');

code = code.replace(/\{translateText\(\s*\? \(`مجموعات مثل VIP و Standard وما إلى ذلك.`\)\s*: \(`Groups like VIP, Standard, etc.`\)\}/g,
  '{translateText("Groups like VIP, Standard, etc.", "مجموعات مثل VIP و Standard وما إلى ذلك.", lang)}');

fs.writeFileSync('src/components/MultiServerConfig.tsx', code);
