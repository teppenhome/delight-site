const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(
  (f) => f.endsWith('.html') && f !== 'index.html' && f !== '_index.html'
);

const wrapper = `  <div class="c-float-actions">
    <a href="index.html#contact" class="c-float-contact" aria-label="お問い合わせ">
      <img class="c-float-contact__img" src="images/float-contact.svg" alt="">
    </a>
    <a href="#top" id="pageTop" class="page-top" aria-label="ページ上部へ戻る">
      <img class="page-top__img" src="images/float-page-top.svg" alt="">
    </a>
  </div>`;

const re = /\s*<a[^>]*class="c-float-contact"[\s\S]*?<\/a>\s*<a[^>]*id="pageTop"[\s\S]*?<\/a>/;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('c-float-contact') || content.includes('c-float-actions')) {
    continue;
  }

  if (!re.test(content)) {
    console.log('skip', file);
    continue;
  }

  content = content.replace(re, `\n${wrapper}`);
  fs.writeFileSync(filePath, content);
  console.log('updated', file);
}
