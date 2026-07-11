const { dynamicDictionary } = require('./dist_temp/dynamic_dict.js') || {};
const fs = require('fs');
let content = fs.readFileSync('src/dynamic_dict.ts', 'utf8');
let match = content.match(/"• Stepped:.*"/);
console.log("Found key string literal:", match[0]);
