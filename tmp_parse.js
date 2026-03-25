const fs = require('fs');
const filepath = 'c:/Users/sam/Dropbox/goget/Deployment/Prompt Testing/Queenstown - Hiking - Kid Friendly.json';
const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
console.log("Keys:", Object.keys(data));
if (data.outputs) console.log("Outputs:", JSON.stringify(data.outputs, null, 2));
if (data.output) console.log("Output:", JSON.stringify(data.output, null, 2));
if (data.generations) console.log("Generations:", JSON.stringify(data.generations, null, 2));
