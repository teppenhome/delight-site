const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const root = path.join(__dirname, "..");

function loadPng(file) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(new PNG())
      .on("parsed", function () {
        resolve(this);
      })
      .on("error", reject);
  });
}

(async () => {
  const img = await loadPng(path.join(root, "images", "hero-image_color04.png"));
  const scale = 0.35;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    const sy = Math.min(img.height - 1, Math.floor(y / scale));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor(x / scale));
      const si = (img.width * sy + sx) << 2;
      const di = (w * y + x) << 2;
      out.data[di] = img.data[si];
      out.data[di + 1] = img.data[si + 1];
      out.data[di + 2] = img.data[si + 2];
      out.data[di + 3] = img.data[si + 3];
    }
  }
  const dest = path.join(root, "scripts", "hero-preview.png");
  await new Promise((res, rej) => {
    out.pack().pipe(fs.createWriteStream(dest)).on("finish", res).on("error", rej);
  });
  console.log("wrote", dest, w, h);

  const files = fs.readdirSync(path.join(root, "images", "illust"));
  for (const f of files) {
    const buf = Buffer.from(f, "utf8");
    console.log("NAME", f);
    console.log(" HEX", [...Buffer.from(f)].map((b) => b.toString(16).padStart(2, "0")).join(" "));
  }
})();
