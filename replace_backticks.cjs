const fs = require('fs');
const path = require('path');

const replacements = [
    {
        file: 'src/components/ColleaguesManagement.tsx',
        find: 'lang === "fa" ? `✅ ${label} کپی شد!` : `✅ ${label} copied!`',
        replace: 'translateText("✅ ", "✅ ", lang) + label + translateText(" copied!", " کپی شد!", lang)'
    },
    {
        file: 'src/components/ServerManagement.tsx',
        find: 'lang === "fa" ? `کادر شماره ${idx + 1}` : `Rule #${idx + 1}`',
        replace: 'translateText("Rule #", "کادر شماره ", lang) + (idx + 1)'
    },
    {
        file: 'src/components/ServerManagement.tsx',
        find: 'lang === "fa" ? `✍️ ویرایش تنظیمات کادر شماره ${idx + 1}` : `✍️ Editing Rule #${idx + 1}`',
        replace: 'translateText("✍️ Editing Rule #", "✍️ ویرایش تنظیمات کادر شماره ", lang) + (idx + 1)'
    },
    {
        file: 'src/components/ServerManagement.tsx',
        find: 'lang === "fa" ? `قیمت به ازای هر گیگابایت (${currency})` : `Price per GB (${currency})`',
        replace: 'translateText("Price per GB ", "قیمت به ازای هر گیگابایت ", lang) + `(${currency})`'
    },
    {
        file: 'src/components/ServerManagement.tsx',
        find: 'lang === "fa" ? `قیمت به ازای هر روز (${currency})` : `Price per Day (${currency})`',
        replace: 'translateText("Price per Day ", "قیمت به ازای هر روز ", lang) + `(${currency})`'
    },
    {
        file: 'src/components/ServerManagement.tsx',
        find: 'lang === "fa" ? `جایگاه: ${index + 1}` : `Rank: ${index + 1}`',
        replace: 'translateText("Rank: ", "جایگاه: ", lang) + (index + 1)'
    },
    {
        file: 'src/components/ServerManagement.tsx',
        find: 'lang === "fa" ? `قیمت مصرف کننده (${currency})` : `Selling Price (${currency})`',
        replace: 'translateText("Selling Price ", "قیمت مصرف کننده ", lang) + `(${currency})`'
    },
    {
        file: 'src/components/SettingsPanel.tsx',
        find: 'lang === "fa" ? `کارت شماره ${index + 1}` : `Card #${index + 1}`',
        replace: 'translateText("Card #", "کارت شماره ", lang) + (index + 1)'
    },
    {
        file: 'src/components/UserManagement.tsx',
        find: 'lang === "fa" ? `ارسال پیام خصوصی به @${sendingMsgUser.username || sendingMsgUser.userId}` : `Send Direct PV Message to @${sendingMsgUser.username || sendingMsgUser.userId}`',
        replace: 'translateText("Send Direct PV Message to @", "ارسال پیام خصوصی به @", lang) + (sendingMsgUser.username || sendingMsgUser.userId)'
    }
];

for (const req of replacements) {
    let content = fs.readFileSync(req.file, 'utf-8');
    content = content.replace(req.find, req.replace);
    // some might have index instead of idx or something, fallback to regex if plain string replace fails
    if (!content.includes(req.replace)) {
        console.log(`Failed to replace in ${req.file}: ${req.find}`);
    }
    fs.writeFileSync(req.file, content, 'utf-8');
}
