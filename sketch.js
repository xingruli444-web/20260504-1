let capture;
let facemesh;
let predictions = [];
let stars = []; // 用於存儲星星位置

// 特徵點編號定義
const mouthIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const leftEyeIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
const leftEyeOuter = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11];
const leftEyeInner = [72, 73, 74, 184];

// 右眼特徵點編號 (包含 247 外圈與 246 內圈)
const rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

// 臉部最外層輪廓編號
const faceSilhouetteIndices = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(windowWidth, windowHeight);
  capture.hide(); // 隱藏預設在畫布下方的 DOM 元件

  // 初始化星星 (隨機產生 200 顆)
  for (let i = 0; i < 200; i++) {
    stars.push({ x: random(-windowWidth, windowWidth), y: random(-windowHeight, windowHeight), size: random(1, 3) });
  }

  // 檢查 ml5 是否正確載入
  if (typeof ml5 !== 'undefined') {
    facemesh = ml5.facemesh(capture, () => console.log("FaceMesh 模型準備就緒！"));
    facemesh.on("predict", results => {
      predictions = results;
    });
  } else {
    console.error("錯誤：找不到 ml5 函式庫，請檢查 HTML 中的 script 標籤。");
  }
}

function draw() {
  background(0); // 將背景設為黑色

  // 確保攝影機已啟動
  if (!capture.elt.readyState) return;

  let vWidth = width;
  let vHeight = height;

  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  scale(-1, 1);
  
  // 繪製背景星星
  noStroke();
  fill(255, 255, 255, random(150, 255)); // 帶有一點閃爍感
  for (let star of stars) {
    ellipse(star.x, star.y, star.size);
  }

  // 繪製臉部辨識連線
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;
    
    // 使用臉部最外層輪廓建立剪裁遮罩，讓影像只在臉部內顯示
    push();
    drawingContext.save();
    drawingContext.beginPath();
    for (let i = 0; i < faceSilhouetteIndices.length; i++) {
      let index = faceSilhouetteIndices[i];
      let x = map(keypoints[index][0], 0, capture.width, -vWidth / 2, vWidth / 2);
      let y = map(keypoints[index][1], 0, capture.height, -vHeight / 2, vHeight / 2);
      if (i === 0) {
        drawingContext.moveTo(x, y);
      } else {
        drawingContext.lineTo(x, y);
      }
    }
    drawingContext.closePath();
    drawingContext.clip();

    // 只在臉部輪廓內繪製攝影機影像
    image(capture, 0, 0, vWidth, vHeight);
    drawingContext.restore();
    pop();
    
    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(1);   // 粗細為 1
    noFill();
    
    // 繪製嘴巴輪廓
    drawContour(mouthIndices, keypoints, vWidth, vHeight);
    
    // 繪製左眼輪廓
    drawContour(leftEyeIndices, keypoints, vWidth, vHeight);

    // 若需要可繼續繪製左眼外圈/內圈
    drawContour(leftEyeOuter, keypoints, vWidth, vHeight);
    drawContour(leftEyeInner, keypoints, vWidth, vHeight);

    // 繪製右眼輪廓 (外圈與內圈)
    drawContour(rightEyeOuter, keypoints, vWidth, vHeight);
    drawContour(rightEyeInner, keypoints, vWidth, vHeight);

    // 繪製臉部最外層輪廓 (加上霓虹發光效果)
    push();
    drawingContext.shadowBlur = 20; // 暈開的程度
    drawingContext.shadowColor = 'rgba(255, 0, 0, 0.9)'; // 光暈顏色
    strokeWeight(2);
    drawContour(faceSilhouetteIndices, keypoints, vWidth, vHeight);
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0)';
    pop();
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (capture) {
    capture.size(windowWidth, windowHeight);
  }
}

// 輔助函式：根據編號陣列繪製閉合輪廓
function drawContour(indices, keypoints, vWidth, vHeight) {
  for (let i = 0; i < indices.length; i++) {
    let p1 = keypoints[indices[i]];
    let p2 = keypoints[indices[(i + 1) % indices.length]];

    let x1 = map(p1[0], 0, capture.width, -vWidth / 2, vWidth / 2);
    let y1 = map(p1[1], 0, capture.height, -vHeight / 2, vHeight / 2);
    let x2 = map(p2[0], 0, capture.width, -vWidth / 2, vWidth / 2);
    let y2 = map(p2[1], 0, capture.height, -vHeight / 2, vHeight / 2);

    line(x1, y1, x2, y2);
  }
}
