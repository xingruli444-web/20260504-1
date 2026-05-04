let capture;
let facemesh;
let predictions = [];

// 指定的臉部特徵點編號 (嘴唇外圈路徑)
const mouthIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

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
    
    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(1);   // 粗細為 1
    noFill();
    
    // 利用 line 指令將指定編號的點串接在一起，形成閉合的嘴巴輪廓
    for (let i = 0; i < mouthIndices.length; i++) {
      let p1 = keypoints[mouthIndices[i]];
      // 取得下一個點，若為最後一個點則自動連回第一個點
      let p2 = keypoints[mouthIndices[(i + 1) % mouthIndices.length]];

      let x1 = map(p1[0], 0, capture.width, -vWidth / 2, vWidth / 2);
      let y1 = map(p1[1], 0, capture.height, -vHeight / 2, vHeight / 2);
      let x2 = map(p2[0], 0, capture.width, -vWidth / 2, vWidth / 2);
      let y2 = map(p2[1], 0, capture.height, -vHeight / 2, vHeight / 2);

      line(x1, y1, x2, y2);
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
