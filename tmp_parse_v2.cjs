const fs = require('fs');
const filepath = 'Prompt Testing/Queenstown - Hiking - Kid Friendly v2.json';
const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
fs.writeFileSync('tmp_out_v2.json', JSON.stringify(data.outputs || data.output || data.generations || data, null, 2));
