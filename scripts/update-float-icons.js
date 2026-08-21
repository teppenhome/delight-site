const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(
  (f) => f.endsWith('.html') && f !== 'index.html' && f !== '_index.html'
);

const block = `  <div class="c-float-actions">
    <a href="index.html#contact" class="c-float-contact" aria-label="お問い合わせ">
      <svg class="c-float-icon c-float-contact__icon" viewBox="0 0 52 52" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <circle class="c-float-icon__circle" cx="26" cy="26" r="24"/>
        <path class="c-float-icon__envelope" d="M15.5 19 H36.5 Q38 19 38 20.5 V32.5 Q38 34 36.5 34 H15.5 Q14 34 14 32.5 V20.5 Q14 19 15.5 19 Z"/>
        <path class="c-float-icon__symbol" d="M15 19.5 L26 27.5 L37 19.5"/>
      </svg>
    </a>
    <a href="#top" id="pageTop" class="page-top" aria-label="ページ上部へ戻る">
      <svg class="c-float-icon page-top__icon" viewBox="0 0 52 52" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <circle class="c-float-icon__circle" cx="26" cy="26" r="24"/>
        <path class="c-float-icon__symbol" d="M16 30 L26 18 L36 30"/>
      </svg>
    </a>
  </div>`;

const re = /\s*<div class="c-float-actions">[\s\S]*?<\/div>/;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('c-float-actions')) {
    continue;
  }

  content = content.replace(re, `\n${block}`);
  fs.writeFileSync(filePath, content);
  console.log('updated', file);
}
