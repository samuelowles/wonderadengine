const fs = require('fs');
const d = fs.readFileSync('Prompt Testing/Queenstown - Hiking - Kid Friendly v2.json', 'utf8');
const data = JSON.parse(d);
const inputs = data?.inputs?.user_context || data?.user_context || data?.[0]?.inputs?.user_context || data;
const allStrings = JSON.stringify(data);
console.log('Contains "kid friendly":', allStrings.toLowerCase().includes('kid friendly'));
console.log('Contains "next weekend":', allStrings.toLowerCase().includes('next weekend'));
console.log('Contains "Weather: {"search_id":":', allStrings.includes('Weather: {"search_id"'));

// Let's check the google-search-research trace inputs if they exist.
if (data.children) {
  const gsr = data.children.find(c => c.name === 'google-search-research');
  if (gsr && gsr.inputs) {
    console.log('GSR inputs:', JSON.stringify(gsr.inputs));
  }
}
