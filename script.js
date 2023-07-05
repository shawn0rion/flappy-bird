const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// increase levelWIdth in chunks of canvas.width
let gamePaused = true;
let levelWidth = canvas.width;
let pipes = [];
let score = 0;

// START OBJECTS
const bird = {
  x: 0,
  y: canvas.height / 2,
  w: 50,
  h: 50,
  radius: 25,
  dx: 5,
  dy: 0,
  gravity: 1,
  jumpForce: 12,
};

const camera = {
  x: 0,
  y: 0,
  w: canvas.width,
  h: canvas.height,
};

const ground = {
  x: 0,
  y: canvas.height - 100,
  w: levelWidth,
  h: 100,
  // IMMEDIETLY INVOKED FUNCTION
  img: (() => {
    // images doesnt support css property
    let img = new Image();
    img.src = "./images/ground.png";

    // img.height = 100;
    return img;
  })(),
};

const button = {
  x: canvas.width / 2 - 100,
  y: canvas.height / 2 - 50,
  w: 150,
  h: 50,
  text: "Press any key",
};

// constants for pipe generation
const gap = 175;
const minimumHeight = 25;
const totalHeight = canvas.height - gap - ground.h;
const totalChunks = totalHeight / minimumHeight;

// START DRAWING FUNCTIONS
function drawScore() {
  if (gamePaused) return;
  ctx.fillStyle = "white";
  ctx.font = "50px Helvetica";
  ctx.textAlign = "center";
  ctx.fillText(`${score}`, canvas.width / 2, 50);
}
function drawButton() {
  // draw the button
  ctx.fillStyle = "orange";
  ctx.fillRect(button.x, button.y, button.w, button.h);

  //draw the text on button
  ctx.fillStyle = "white";
  ctx.font = "20px Helvetica";
  ctx.textShadow = "2px 2px 2px black";
  ctx.textTransform = "uppercase";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(button.text, button.x + button.w / 2, button.y + button.h / 2);
}
function drawBird() {
  ctx.beginPath();
  ctx.fillStyle = "yellow";
  ctx.arc(bird.x - camera.x, bird.y, bird.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
}

function drawGround() {
  const patternWidth = ground.img.width;
  const iterations = Math.ceil(canvas.width / patternWidth);
  for (let i = 0; i < iterations; i++) {
    ctx.drawImage(ground.img, i * patternWidth, canvas.height - ground.h);
  }
}

function drawPipes() {
  // if a pipe is outside the camera view, do not draw it
  pipes.forEach((pipe) => {
    ctx.fillStyle = "green";
    ctx.fillRect(pipe.x - camera.x, pipe.y, pipe.w, pipe.h);
  });
}

// START MAIN FUNCTIONS
function updateBird() {
  bird.x += bird.dx;
  bird.dy += bird.gravity;
  bird.y += bird.dy;

  // update camera
  camera.x = Math.floor(bird.x - canvas.width / 3 + bird.w / 2);
  ground.x = camera.x;

  pipes.forEach((pipe) => {
    // if the bird is in the bounds of a pipe, reset game
    if (circleRectCollision(bird, pipe)) {
      resetGame();
    }
  });

  if (circleRectCollision(bird, ground)) {
    resetGame();
  }
}

function updateMap() {
  let pipe = "";
  if (pipes.length > 0) {
    pipe = pipes.at(-1);
  }

  if (bird.x % canvas.width === 0) {
    levelWidth += canvas.width;
    ground.w = levelWidth;
    // create first pipe
    if (bird.x === 0) createPipe();
  }
  // create pipe if bird is past the center of recent pipe
  if (pipe !== "" && bird.x + bird.w / 2 >= pipe.x + pipe.w / 2) {
    score += 1;
    createPipe();
  }
}

function createPipe() {
  // put pipe right off the screen
  const pipeHeights = randomHeights();
  const bottomPipe = {
    x: camera.x + canvas.width,
    y: ground.y - pipeHeights[0],
    w: 100,
    h: pipeHeights[0],
  };
  const topPipe = {
    x: camera.x + canvas.width,
    y: 0,
    w: 100,
    h: pipeHeights[1],
  };
  pipes.push(bottomPipe, topPipe);
}

// this function will return two numbers whose sum is consistent
function randomHeights() {
  let sum = 0;
  let pipeHeights = [];
  while (sum !== totalHeight) {
    pipeHeights = [];
    const rng1 = Math.floor(Math.random() * totalChunks);
    const rng2 = Math.floor(Math.random() * totalChunks);
    sum = rng1 * minimumHeight + rng2 * minimumHeight;
    pipeHeights.push(rng1 * minimumHeight, rng2 * minimumHeight);
  }
  return pipeHeights;
}

function circleRectCollision(circle, rect) {
  const dx = Math.abs(circle.x - rect.x - rect.w / 2);
  const dy = Math.abs(circle.y - rect.y - rect.h / 2);

  if (dx > rect.w / 2 + circle.radius || dy > rect.h / 2 + circle.radius) {
    return false;
  }

  if (dx <= rect.w / 2 || dy <= rect.h / 2) {
    return true;
  }

  const cornerDistance_sq =
    Math.pow(dx - rect.w / 2, 2) + Math.pow(dy - rect.h / 2, 2);

  return cornerDistance_sq <= Math.pow(circle.radius, 2);
}

// START EVENT LISTENERS

document.addEventListener("keydown", (e) => {
  if (gamePaused) {
    gamePaused = false;
    gameLoop();
    console.log("booting up");
  }
  if (e.key === "Space" || "W" || "ArrowUp") {
    bird.dy = -bird.jumpForce;
  }
});

// END EVENT LISTENERS

function resetGame() {
  // reset all variables
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gamePaused = true;

  score = 0;
  bird.x = 0 - canvas.width / 4;
  bird.y = canvas.height / 2;
  bird.dx = 5;
  bird.dy = 0;
  levelWidth = canvas.width;
  pipes = [];
  camera.x = bird.x - canvas.width / 3 + bird.w / 2;
  ground.x = camera.x;
  drawBird();
  drawGround();
  drawButton();
  drawScore();
}

function gameLoop() {
  if (gamePaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBird();
  updateMap();
  drawBird();
  drawPipes();
  drawGround();
  drawScore();
  requestAnimationFrame(gameLoop);
}

ground.img.onload = () => resetGame();
