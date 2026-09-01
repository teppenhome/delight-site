const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const root = path.join(__dirname, "..");
const illustDir = path.join(root, "images", "illust");
const heroPath = path.join(root, "images", "hero-image_color04.png");

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

function getPixel(img, x, y) {
  const i = (img.width * y + x) << 2;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
}

function downsample(img, scale) {
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(img.height - 1, Math.floor(y / scale));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor(x / scale));
      const si = (img.width * sy + sx) << 2;
      const di = (w * y + x) << 2;
      data[di] = img.data[si];
      data[di + 1] = img.data[si + 1];
      data[di + 2] = img.data[si + 2];
      data[di + 3] = img.data[si + 3];
    }
  }
  return { width: w, height: h, data };
}

function opaqueBBox(img, alphaMin = 40) {
  let minX = img.width,
    minY = img.height,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const a = img.data[((img.width * y + x) << 2) + 3];
      if (a >= alphaMin) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function crop(img, box) {
  const data = new Uint8Array(box.w * box.h * 4);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const si = (img.width * (box.minY + y) + (box.minX + x)) << 2;
      const di = (box.w * y + x) << 2;
      data[di] = img.data[si];
      data[di + 1] = img.data[si + 1];
      data[di + 2] = img.data[si + 2];
      data[di + 3] = img.data[si + 3];
    }
  }
  return { width: box.w, height: box.h, data };
}

function pickSamples(img, n = 80) {
  const samples = [];
  const stepX = Math.max(1, Math.floor(img.width / 12));
  const stepY = Math.max(1, Math.floor(img.height / 12));
  for (let y = 2; y < img.height - 2; y += stepY) {
    for (let x = 2; x < img.width - 2; x += stepX) {
      const i = (img.width * y + x) << 2;
      if (img.data[i + 3] > 180) {
        samples.push({
          x,
          y,
          r: img.data[i],
          g: img.data[i + 1],
          b: img.data[i + 2],
        });
      }
    }
  }
  if (samples.length > n) {
    const out = [];
    const stride = samples.length / n;
    for (let i = 0; i < n; i++) out.push(samples[Math.floor(i * stride)]);
    return out;
  }
  return samples;
}

function search(hero, piece, step = 2) {
  const samples = pickSamples(piece);
  if (samples.length < 8) return null;
  let best = { score: Infinity, x: 0, y: 0 };
  const maxX = hero.width - piece.width;
  const maxY = hero.height - piece.height;
  if (maxX < 0 || maxY < 0) return null;

  for (let y = 0; y <= maxY; y += step) {
    for (let x = 0; x <= maxX; x += step) {
      let err = 0;
      let used = 0;
      for (const s of samples) {
        const hx = x + s.x;
        const hy = y + s.y;
        const i = (hero.width * hy + hx) << 2;
        const ha = hero.data[i + 3];
        if (ha < 20) {
          err += 80;
          used++;
          continue;
        }
        err +=
          Math.abs(hero.data[i] - s.r) +
          Math.abs(hero.data[i + 1] - s.g) +
          Math.abs(hero.data[i + 2] - s.b);
        used++;
        if (err > best.score) break;
      }
      const score = err / used;
      if (score < best.score) best = { score, x, y };
    }
  }
  return best;
}

(async () => {
  const heroFull = await loadPng(heroPath);
  const heroBox = opaqueBBox(heroFull, 8);
  console.log("hero", heroFull.width, heroFull.height, "bbox", heroBox);

  const heroSmall = downsample(heroFull, 0.25);
  const files = fs.readdirSync(illustDir).filter((f) => f.toLowerCase().endsWith(".png"));

  const results = [];
  for (const file of files) {
    const img = await loadPng(path.join(illustDir, file));
    const box = opaqueBBox(img, 30);
    if (!box) {
      console.log(file, "empty");
      continue;
    }
    const cropped = crop(img, box);
    const scales = [0.25, 0.2, 0.16, 0.12, 0.1, 0.08];
    let bestAll = null;
    for (const sc of scales) {
      const p = downsample(cropped, sc);
      if (p.width < 8 || p.height < 8) continue;
      if (p.width > heroSmall.width || p.height > heroSmall.height) continue;
      const found = search(heroSmall, p, p.width > 80 ? 3 : 2);
      if (!found) continue;
      const rec = {
        file,
        scale: sc,
        score: found.score,
        x: found.x / 0.25,
        y: found.y / 0.25,
        w: p.width / 0.25,
        h: p.height / 0.25,
        srcW: img.width,
        srcH: img.height,
        crop: box,
      };
      if (!bestAll || rec.score < bestAll.score) bestAll = rec;
    }
    if (bestAll) {
      results.push(bestAll);
      console.log(
        `${file}\tscore=${bestAll.score.toFixed(1)}\tscale=${bestAll.scale}\tpos=${Math.round(bestAll.x)},${Math.round(bestAll.y)}\tsize=${Math.round(bestAll.w)}x${Math.round(bestAll.h)}\tsrc=${img.width}x${img.height}\tcrop=${box.w}x${box.h}`
      );
    } else {
      console.log(file, "no match", img.width, img.height, "crop", box);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "hero-match.json"),
    JSON.stringify(results, null, 2)
  );
})();
