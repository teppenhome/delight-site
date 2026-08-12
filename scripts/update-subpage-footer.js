const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  'about.html',
  'access.html',
  'message.html',
  'philosophy.html',
  'privacy.html',
  'recruit.html',
  'news.html',
  'news-detail.html',
  'work.html',
  'work-detail.html',
];

const newFooter = `  <footer class="footer footer--sub">
    <div class="footer__inner container">

      <div class="footer__head">
        <p class="footer__index">INDEX</p>
      </div>

      <div class="footer__line"></div>

      <div class="footer__content">
        <div class="footer__nav">

          <div class="footer__col">
            <div class="footer__group">
              <a href="about.html" class="footer__title">ABOUT</a>
              <ul>
                <li><a href="about.html">会社について</a></li>
                <li><a href="service.html#flow">仕事の流れ</a></li>
              </ul>
            </div>
            <div class="footer__group">
              <a href="news.html" class="footer__title">NEWS</a>
              <ul>
                <li><a href="news.html">お知らせ一覧</a></li>
              </ul>
            </div>
          </div>

          <div class="footer__col">
            <div class="footer__group">
              <a href="about.html" class="footer__title">COMPANY</a>
              <ul>
                <li><a href="about.html">会社概要</a></li>
                <li><a href="philosophy.html">企業理念</a></li>
                <li><a href="message.html">代表挨拶</a></li>
                <li><a href="access.html">アクセス</a></li>
              </ul>
            </div>
            <div class="footer__group">
              <a href="service.html" class="footer__title">SERVICE</a>
            </div>
          </div>

          <div class="footer__col">
            <div class="footer__group">
              <a href="work.html" class="footer__title">WORK</a>
              <ul>
                <li><a href="work.html">業務実績一覧</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div class="footer__contact">
          <a href="index.html#contact" class="footer__contact-link">
            <span class="footer__contact-icon" aria-hidden="true">
              <svg class="footer__contact-icon-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="24" fill="#fff"/>
                <path d="M15.5 19 H36.5 Q38 19 38 20.5 V32.5 Q38 34 36.5 34 H15.5 Q14 34 14 32.5 V20.5 Q14 19 15.5 19 Z" fill="none" stroke="#0F65A3" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M15 19.5 L26 27.5 L37 19.5" fill="none" stroke="#0F65A3" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="footer__contact-body">
              <span class="footer__contact-title">CONTACT</span>
              <span class="footer__contact-text">
                相談してみる
              </span>
            </span>
          </a>
        </div>
      </div>

      <div class="footer__copyright">
        <p>&copy; 2022 DELIGHT All rights reserved</p>
      </div>

    </div>
  </footer>`;

const footerPattern = /  <footer class="footer">[\s\S]*?<\/footer>/;

for (const file of files) {
  const filePath = path.join(root, file);
  const html = fs.readFileSync(filePath, 'utf8');

  if (!footerPattern.test(html)) {
    console.error(`Footer not found in ${file}`);
    process.exitCode = 1;
    continue;
  }

  fs.writeFileSync(filePath, html.replace(footerPattern, newFooter), 'utf8');
  console.log(`Updated ${file}`);
}
