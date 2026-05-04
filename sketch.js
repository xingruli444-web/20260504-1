let capture;
let facemesh;
let predictions = [];

// 右眼特徵點編號 (FaceMesh 標準定義)
const rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); // 隱藏預設在畫布下方的 DOM 元件

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
  background('#e7c6ff');

  // 確保攝影機已啟動
  if (!capture.elt.readyState) return;

  let vWidth = width * 0.5;
  let vHeight = height * 0.5;

  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  scale(-1, 1);
  
  // 繪製左右顛倒的影像
  image(capture, 0, 0, vWidth, vHeight);

  // 繪製臉部辨識連線
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;
    
    stroke(255, 0, 0); // 紅色
    strokeWeight(1);   // 粗細改為 1
    noFill();
    
    // 繪製右眼外圈
    drawEyeCircle(rightEyeOuter, keypoints, vWidth, vHeight);
    // 繪製右眼內圈
    drawEyeCircle(rightEyeInner, keypoints, vWidth, vHeight);
  }
  pop();
}

// 輔助函式：根據編號陣列繪製封閉的線條圈
function drawEyeCircle(indices, points, vW, vH) {
  for (let i = 0; i < indices.length; i++) {
    let p1 = points[indices[i]];
    // 取得下一個點，若為最後一個點則連回第一個點
    let p2 = points[indices[(i + 1) % indices.length]];

    let x1 = map(p1[0], 0, capture.width, -vW / 2, vW / 2);
    let y1 = map(p1[1], 0, capture.height, -vH / 2, vH / 2);
    let x2 = map(p2[0], 0, capture.width, -vW / 2, vW / 2);
    let y2 = map(p2[1], 0, capture.height, -vH / 2, vH / 2);

    line(x1, y1, x2, y2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
