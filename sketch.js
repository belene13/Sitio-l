let handPose;
let video;
let hands = [];

// Tiempo y color
let t = 0;
let speed = 0.4;

// 0 = caos | 1 = detenido
let calmLevel = 0;
let finished = false;

// Botones falsos
let fakeButtons = [];
let messages = ["no", "no funciona", "no ahora", "no sirve", "no es así"];
let currentMessage = "";
let messageTimer = 0;

// Color final
let finalColor;

// ----------------------------

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);

  createFakeButtons();

  finalColor = color(
    random(90, 160),
    random(90, 160),
    random(90, 160)
  );
}

// ----------------------------

function draw() {
  drawBackground();
  drawTopInstruction();
  drawFakeButtons();
  drawCenterMessage();
  detectPalms();
  drawCameraPreview();
}

// ----------------------------
// Fondo
// ----------------------------

function drawBackground() {
  if (!finished) {
    t += speed;

    let r = lerp(noise(t * 2) * 255, red(finalColor), calmLevel);
    let g = lerp(noise(t * 3 + 100) * 255, green(finalColor), calmLevel);
    let b = lerp(noise(t * 4 + 200) * 255, blue(finalColor), calmLevel);

    background(r, g, b);

    speed = lerp(speed, 0.005, calmLevel);

    if (calmLevel >= 0.99) {
      finished = true;
    }
  } else {
    background(finalColor);
  }
}

// ----------------------------
// Texto superior
// ----------------------------

function drawTopInstruction() {
  if (finished) return;

  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  text(
    "tómate 10 segundos para calmar la página",
    width / 2,
    20
  );
}

// ----------------------------
// Botones falsos
// ----------------------------

function createFakeButtons() {
  let texts = ["cálmate", "relájate", "tranquila", "respira", "controla esto"];

  for (let txt of texts) {
    fakeButtons.push({
      x: random(80, width - 160),
      y: random(120, height - 80),
      w: 150,
      h: 40,
      label: txt
    });
  }
}

function drawFakeButtons() {
  if (finished) return;

  textAlign(CENTER, CENTER);
  textSize(14);

  for (let b of fakeButtons) {
    stroke(255);
    noFill();
    rect(b.x, b.y, b.w, b.h, 6);

    noStroke();
    fill(255);
    text(b.label, b.x + b.w / 2, b.y + b.h / 2);
  }
}

// ----------------------------
// Click inútil
// ----------------------------

function mousePressed() {
  if (finished) return;

  for (let b of fakeButtons) {
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    ) {
      currentMessage = random(messages);
      messageTimer = 100;
      calmLevel = max(0, calmLevel - 0.1);
    }
  }
}

// ----------------------------
// Mensajes
// ----------------------------

function drawCenterMessage() {
  if (messageTimer > 0 && !finished) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text(currentMessage, width / 2, height / 2);
    messageTimer--;
  }

  if (finished) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(34);
    text(
      "Gracias, ahora puedo descansar <3",
      width / 2,
      height / 2
    );
  }
}

// ----------------------------
// Detección de palmas (~10 s)
// ----------------------------

function detectPalms() {
  if (finished) return;

  if (hands.length >= 2) {
    let h1 = hands[0];
    let h2 = hands[1];

    if (h1.keypoints.length > 15 && h2.keypoints.length > 15) {
      calmLevel = constrain(calmLevel + 0.002, 0, 1);
      return;
    }
  }

  calmLevel = max(0, calmLevel - 0.001);
}

// ----------------------------
// Cámara espejada
// ----------------------------

function drawCameraPreview() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 20, 20, 160, 120);
  pop();
}

// ----------------------------

function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  fakeButtons = [];
  createFakeButtons();
}
