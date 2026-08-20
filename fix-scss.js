const fs = require('fs');
const urlsRaw = fs.readFileSync('deco-urls.txt', 'utf8');
const urlLines = urlsRaw.split('\n');
let rightURL = '', leftURL = '';
let mode = '';
for (const line of urlLines) {
  if (line === 'RIGHT:') { mode = 'right'; continue; }
  if (line === 'LEFT:')  { mode = 'left';  continue; }
  if (line.startsWith('url(') && mode === 'right') rightURL = line;
  if (line.startsWith('url(') && mode === 'left')  leftURL  = line;
}

let scss = fs.readFileSync('scss/page/_news-archive.scss', 'utf8');
const lines = scss.split('\n');

// 変数行を探して置換（$で始まる行のみ対象）
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('$deco-mask-right') && lines[i].includes('url(')) {
    lines[i] = '$deco-mask-right: ' + rightURL + ';';
    console.log('right replaced at line', i);
  }
  if (lines[i].startsWith('$deco-mask-left') && lines[i].includes('url(')) {
    lines[i] = '$deco-mask-left:  ' + leftURL  + ';';
    console.log('left replaced at line', i);
  }
}

const out = lines.join('\n');
console.log('right new?', out.includes('33.50 0.00'));
console.log('left  new?', out.includes('64.50 0.00'));
console.log('line39:', lines[39].substring(0,30));
fs.writeFileSync('scss/page/_news-archive.scss', out);
console.log('done');
