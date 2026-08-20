const fs = require('fs');

// 理想の上部形状分析:
// - y=0 で外側最大幅（半円の頂点）から始まる
// - そこから半円を描いて内側へ入る
// = cos(θ) が理想: y=0でx=最大, y=period/2でx=最小
// 
// でも以前の cos では「上端からすぐ内側へ引き込まれる」と言われた。
// → 問題は「cos(0)=1 (外側最大)から始まるが、すぐ下降する」こと
// 
// 理想画像を再度よく見ると:
// 左上端: y=0付近で外側に膨らんだ状態（帯が外側最大）で始まり
//   さらに「半円状の丸み」を見せてから内側へ
// これはちょうど余弦波の山の部分に一致する
// 
// 現在の sin では: y=0でx=midX(中央) → y=T/4でx=外側最大 → y=T/2でx=中央 → y=3T/4でx=内側
// これだと上端は「中央」スタートなので問題あり
//
// 前の cos では: y=0でx=外側最大 → y=T/4でx=中央 → y=T/2でx=内側最大 → y=3T/4でx=中央
// = 理想に一致しているが「上端からすぐ内側へ」に見えた?
//
// → 振幅やmidXのバランスの問題かもしれない
// 理想画像では:
//   左側: 外側膨らみが大きく見える（bandwidthに対してampが大きい）
//   右側も同様
//
// 現在のパラメータ: amp=18, midX_right=33.5 (全幅138の24%)
//   外側最大: 33.5+18=51.5 → 全幅の37%が境界線
//   内側最大: 33.5-18=15.5 → 全幅の11%が境界線
//
// 理想画像で左側の膨らみを見ると、帯幅の半分以上が黄色に見える
// → midXをもっと外側（大きく）にして、ampも大きくすべきかも
//
// ただし全幅(138px)と波の境界が大きく変わるとデザインが崩れる
// 今回は「位相のみ」を修正する方針に固執
//
// 最終判断:
// cos(θ) で y=0が外側最大 → 上端から「下（内側）へ向かう最初の部分」が丸い半円になる
// = 正解。前回の実装で見た目が「すぐ内側へ」に見えたのは、
//   おそらく sin(2πy/period) の最後の変換で誤った位相になっていたため。
//
// → cos(θ) に戻す。ただし前回 cos で問題が出た原因を確認:
//   前回 cos: xR(y) = midX + amp * cos(2π*y/period) 
//             y=0: x = 33.5 + 18*1 = 51.5 (外側最大) ✓
//             上端から内側へ向かう = 正しい
//   → これを再度試す

const period = 205;
const amp = 18;
const H = 3000;
// 中央側へ帯をわずかに広げた幅（波 amp / period / midX_right は維持）
const W_right = 141, W_left = 115;

// cos で y=0が外側最大（帯の内側境界が外に最も張り出した状態）
// midX_right = 中央側端からの波の中心位置（据え置き → 幅増分がそのまま黄色の増分）
const midX_right = 33.5;
function xR(y) { return midX_right + amp * Math.cos(2*Math.PI*y/period); }
function dxR(y){ return -amp * Math.sin(2*Math.PI*y/period)*(2*Math.PI/period); }

// 左側: 鏡像（外側=左端からの距離は midX_right 相当を維持しつつ、幅増分で中央へ伸びる）
const midX_left = W_left - midX_right;
function xL(y) { return midX_left - amp * Math.cos(2*Math.PI*y/period); }
function dxL(y){ return  amp * Math.sin(2*Math.PI*y/period)*(2*Math.PI/period); }

function bezier(y1, y2, xFn, dxFn, n=8) {
  const dy = (y2-y1)/n;
  let d = '';
  for(let i=0; i<n; i++){
    const ya = y1+i*dy, yb = y1+(i+1)*dy;
    const xa = xFn(ya), xb = xFn(yb);
    const sa = dxFn(ya), sb = dxFn(yb);
    const h = dy;
    d += ` C ${(xa+h/3*sa).toFixed(2)} ${(ya+h/3).toFixed(2)},`;
    d += ` ${(xb-h/3*sb).toFixed(2)} ${(yb-h/3).toFixed(2)},`;
    d += ` ${xb.toFixed(2)} ${yb.toFixed(2)}`;
  }
  return d;
}

// 右側パス: 上端(0,0)から始まり、波の境界点(xR(0), 0)へ
// M W_right 0  → L W_right H → L xR(H) H → bezier H→0 → L 0 0 Z
// 注意: y=0での開始点は (xR(0), 0) = (51.5, 0)
// パスは「51.5, 0」から上端左(0,0)へ、そして右上(138,0)→右辺下→下端→波→上端
function buildRight() {
  const x0 = xR(0);
  const x_bottom = xR(H % period);
  // 右側: 右辺(138)は直線、左辺が波
  // パス: (x0, 0)から始まり、左上端(0,0)、右上端(138,0)、右辺を下へ、下端、波を上へ、(x0,0)へ戻る
  let d = `M ${x0.toFixed(2)} 0 L 0 0 L ${W_right} 0 L ${W_right} ${H} L ${x_bottom.toFixed(2)} ${H}`;
  let y = H;
  while(y > 0) {
    const y_next = Math.max(0, y - period);
    d += bezier(y, y_next, xR, dxR);
    y = y_next;
  }
  d += ' Z';
  return d;
}

function buildLeft() {
  const x0 = xL(0);
  const x_bottom = xL(H % period);
  let d = `M ${x0.toFixed(2)} 0 L ${W_left} 0 L 0 0 L 0 ${H} L ${x_bottom.toFixed(2)} ${H}`;
  let y = H;
  while(y > 0) {
    const y_next = Math.max(0, y - period);
    d += bezier(y, y_next, xL, dxL);
    y = y_next;
  }
  d += ' Z';
  return d;
}

const rightPath = buildRight();
const leftPath  = buildLeft();

console.log(`右 y=0: xR=${xR(0).toFixed(2)}, y=T/4: xR=${xR(period/4).toFixed(2)}, y=T/2: xR=${xR(period/2).toFixed(2)}`);
console.log(`左 y=0: xL=${xL(0).toFixed(2)}, y=T/4: xL=${xL(period/4).toFixed(2)}, y=T/2: xL=${xL(period/2).toFixed(2)}`);

function enc(s) {
  return s.replace(/"/g,"'").replace(/%/g,'%25').replace(/#/g,'%23').replace(/</g,'%3C').replace(/>/g,'%3E');
}

const rightSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${W_right}" height="${H}"><path d="${rightPath}" fill="black"/></svg>`;
const leftSVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="${W_left}"  height="${H}"><path d="${leftPath}"  fill="black"/></svg>`;

const rightURL = `url("data:image/svg+xml,${enc(rightSVG)}")`;
const leftURL  = `url("data:image/svg+xml,${enc(leftSVG)}")`;

fs.writeFileSync('d:/projects/株式会社ディライト/delight-site/images/news/deco-mask-right.svg', rightSVG);
fs.writeFileSync('d:/projects/株式会社ディライト/delight-site/images/news/deco-mask-left.svg',  leftSVG);
fs.writeFileSync('d:/projects/株式会社ディライト/delight-site/deco-urls.txt',
  'RIGHT:\n' + rightURL + '\n\nLEFT:\n' + leftURL);

console.log('right URL length:', rightURL.length);
console.log('left  URL length:', leftURL.length);
console.log('完了');
