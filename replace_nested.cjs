const fs = require('fs');

const file = 'src/components/SettingsPanel.tsx';
let content = fs.readFileSync(file, 'utf-8');

const regex1 = /\{lang === "fa"\s*\?\s*activeAttachment\.fileType === "image"\s*\?\s*"تصوير"\s*:\s*activeAttachment\.fileType === "video"\s*\?\s*"فیلم\/ویدئو"\s*:\s*activeAttachment\.fileType === "voice"\s*\?\s*"ویس"\s*:\s*"فایل"\s*:\s*activeAttachment\.fileType\}/;

content = content.replace(regex1, '{translateText(activeAttachment.fileType, activeAttachment.fileType === "image" ? "تصوير" : activeAttachment.fileType === "video" ? "فیلم/ویدئو" : activeAttachment.fileType === "voice" ? "ویس" : "فایل", lang)}');

const regex2 = /\{lang === "fa"\s*\?\s*`\$\{Math\.floor\(autoRefreshInterval \/ 60\) > 0 \? `\$\{Math\.floor\(autoRefreshInterval \/ 60\)\} دقیقه ` : ""\}\$\{autoRefreshInterval % 60 > 0 \? `\$\{autoRefreshInterval % 60\} ثانیه` : ""`\s*:\s*`\$\{Math\.floor\(autoRefreshInterval \/ 60\) > 0 \? `\$\{Math\.floor\(autoRefreshInterval \/ 60\)\} min ` : ""\}\$\{autoRefreshInterval % 60 > 0 \? `\$\{autoRefreshInterval % 60\} sec` : ""`\}/;

content = content.replace(regex2, '{Math.floor(autoRefreshInterval / 60) > 0 ? Math.floor(autoRefreshInterval / 60) + " " + translateText("min ", "دقیقه ", lang) : ""}{autoRefreshInterval % 60 > 0 ? autoRefreshInterval % 60 + " " + translateText("sec", "ثانیه", lang) : ""}');

fs.writeFileSync(file, content, 'utf-8');
