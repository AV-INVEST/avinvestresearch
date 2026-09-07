import fs from 'fs';
const s = fs.readFileSync('.next/server/app/admin/corsi/[slug]/lezioni/[lessonId]/page.js', 'utf8');

const idx = s.indexOf('55581:');
console.log('Module 55581 at index:', idx);
if (idx > 0) {
  console.log('--- Module 55581 region (1500 chars) ---');
  console.log(s.slice(idx, idx + 1500));
}

console.log('\n\n--- Searching for .get( patterns ---');
let i = 0;
let count = 0;
while (i < s.length && count < 20) {
  const pos = s.indexOf('.get(', i);
  if (pos === -1) break;
  const start = Math.max(0, pos - 80);
  const end = Math.min(s.length, pos + 80);
  console.log(`\n#${count + 1} at char ${pos}:`);
  console.log(s.slice(start, end));
  i = pos + 5;
  count++;
}
