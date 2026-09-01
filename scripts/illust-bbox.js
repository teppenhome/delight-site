const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

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

function bbox(img, aMin = 20) {
  let minX = img.width, minY = img.height, maxX = -1, maxY = -1, count = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const a = img.data[((img.width * y + x) << 2) + 3];
      if (a >= aMin) {
        count++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1, count };
}

(async () => {
  const dir = path.join(__dirname, "..", "images", "illust");
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".png")) continue;
    const img = await loadPng(path.join(dir, f));
    const b = bbox(img);
    const l = ((b.minX / img.width) * 100).toFixed(1);
    const t = ((b.minY / img.height) * 100).toFixed(1);
    const wp = ((b.w / img.width) * 100).toFixed(1);
    const hp = ((b.h / img.height) * 100).toFixed(1);
    console.log(
      `${f}\t${img.width}x${img.height}\tcrop ${b.w}x${b.h} @${b.minX},${b.minY}\tcontent ${wp}% x ${hp}% inset L${l} T${t}`
    );
  }
})();
