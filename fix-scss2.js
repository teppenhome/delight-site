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

// 現在の行39,41を確認
console.log('Before L39:', lines[39].substring(0,50));
console.log('Before L41:', lines[41].substring(0,50));

// 直接上書き（$ を含む変数名を正しく設定）
const dollarSign = '\x24'; // '$' のコードポイント
lines[39] = dollarSign + 'deco-mask-right: ' + rightURL + ';';
lines[41] = dollarSign + 'deco-mask-left:  ' + leftURL  + ';';

console.log('After L39:', lines[39].substring(0,50));
console.log('After L41:', lines[41].substring(0,50));

const out = lines.join('\n');
console.log('right new?', out.includes('33.50 0.00'));
console.log('left  new?', out.includes('64.50 0.00'));
fs.writeFileSync('scss/page/_news-archive.scss', out);
console.log('done');
