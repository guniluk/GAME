const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 700;

const explosions = [];
let canvasPosition = canvas.getBoundingClientRect();

class Explosion {
  constructor(x, y) {
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.width = this.spriteWidth * 0.7;
    this.height = this.spriteHeight * 0.7;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = "./images/boom.png";
    this.frame = 0;
    this.timer = 0;
    this.angle = Math.random() * 6.2;
    this.sound = new Audio();
    this.sound.src = "./images/boom.wav";
  }

  update() {
    if (this.frame === 0) {
      this.sound.play();
    }
    this.timer++;
    if (this.timer % 10 === 0) {
      this.frame++;
    }
  }

  draw() {
    ctx.save(); //save the current state of canvas
    ctx.translate(this.x, this.y); //move the origin point of canvas to (x,y)
    ctx.rotate(this.angle); //rotate the canvas by angle
    ctx.drawImage(
      this.image,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      0 - this.width / 2,
      0 - this.height / 2,
      this.width,
      this.height,
    );
    ctx.restore(); //restore the saved state of canvas
  }
}

function createAnimation(e) {
  const positionX = (e.clientX || e.x) - canvasPosition.left;
  const positionY = (e.clientY || e.y) - canvasPosition.top;
  // 캔버스 영역 내 클릭 시에만 생성
  if (
    positionX >= 0 &&
    positionX <= canvas.width &&
    positionY >= 0 &&
    positionY <= canvas.height
  ) {
    explosions.push(new Explosion(positionX, positionY));
  }
}

window.addEventListener("click", function (e) {
  canvasPosition = canvas.getBoundingClientRect();
  createAnimation(e);
});

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});

window.addEventListener("scroll", function () {
  canvasPosition = canvas.getBoundingClientRect();
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 폭발 효과가 없을 때 안내 텍스트 표시
  if (explosions.length === 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Click to trigger explosion!",
      canvas.width / 2,
      canvas.height / 2,
    );
  }

  for (let i = 0; i < explosions.length; i++) {
    explosions[i].update();
    explosions[i].draw();
    if (explosions[i].frame > 5) {
      explosions.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(animate);
}

animate();
