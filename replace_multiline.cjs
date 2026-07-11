const fs = require('fs');

const file = 'src/components/SettingsPanel.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
    /lang === "fa"\s*\?\s*`📣 پیام همگانی با موفقیت برای تمامی کاربران فعال ارسال شد \(\$\{data.count \|\| 0\} پیام ارسالی\)\.`\s*:\s*`📣 Broadcast message dispatched successfully to all \$\{data\.count \|\| 0\} registered users!`/,
    'translateText("📣 Broadcast message dispatched successfully to all ", "📣 پیام همگانی با موفقیت برای تمامی کاربران فعال ارسال شد (", lang) + (data.count || 0) + translateText(" registered users!", " پیام ارسالی).", lang)'
);

content = content.replace(
    /lang === "fa"\s*\?\s*simulatorMode\s*\?\s*"حالت شبیه‌ساز: روشن"\s*:\s*"حالت شبیه‌ساز: خاموش"\s*:\s*`Simulator: \$\{simulatorMode \? "ON" : "OFF"\}`/,
    'simulatorMode ? translateText("Simulator: ON", "حالت شبیه‌ساز: روشن", lang) : translateText("Simulator: OFF", "حالت شبیه‌ساز: خاموش", lang)'
);

fs.writeFileSync(file, content, 'utf-8');
