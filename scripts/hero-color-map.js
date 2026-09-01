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

function dist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

(async () => {
  const img = await loadPng(
    path.join(__dirname, "..", "images", "hero-image_color04.png")
  );
  const targets = {
    orange: [230, 140, 70],
    yellow: [245, 230, 160],
    mint: [160, 210, 170],
    teal: [70, 140, 130],
    pink: [240, 170, 170],
    blonde: [240, 200, 90],
    bluehair: [140, 170, 200],
    red: [210, 50, 50],
    lightblue: [160, 200, 220],
    white: [250, 250, 250],
  };
  const W = 40,
    H = 28;
  const cellW = img.width / W;
  const cellH = img.height / H;

  for (const [name, rgb] of Object.entries(targets)) {
    const grid = Array.from({ length: H }, () => Array(W).fill(0));
    for (let y = 0; y < img.height; y += 3) {
      for (let x = 0; x < img.width; x += 3) {
        const i = (img.width * y + x) << 2;
        if (img.data[i + 3] < 80) continue;
        if (dist([img.data[i], img.data[i + 1], img.data[i + 2]], rgb) < 70) {
          const cx = Math.min(W - 1, Math.floor(x / cellW));
          const cy = Math.min(H - 1, Math.floor(y / cellH));
          grid[cy][cx]++;
        }
      }
    }
    console.log("\n== " + name + " ==");
    for (let y = 0; y < H; y++) {
      let row = String(y).padStart(2, "0") + " ";
      for (let x = 0; x < W; x++) {
        const n = grid[y][x];
        row += n > 18 ? "#" : n > 8 ? "o" : n > 2 ? "." : " ";
      }
      console.log(row);
    }
  }
})();
