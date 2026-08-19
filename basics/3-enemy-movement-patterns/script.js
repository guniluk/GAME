/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = (canvas.width = 500);
const CANVAS_HEIGHT = (canvas.height = 700);

const numberOfEnemies = 3;
let enemies = [];
let gameFrame = 0;

/* ==========================================================================
   Enemy 1: 무작위 떨림 / 제자리 비행 패턴 (Random Wiggle / Flapping)
   - enemy1.png (6 프레임, 293x155)
   - Math.random()을 이용해 미세하게 위치를 진동
   ========================================================================== */
class Enemy1 {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/enemy1.png";
    this.spriteWidth = 293;
    this.spriteHeight = 155;
    this.width = this.spriteWidth / 2.5;
    this.height = this.spriteHeight / 2.5;
    this.x = Math.random() * (CANVAS_WIDTH - this.width);
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.frame = 0;
    this.flapSpeed = Math.floor(Math.random() * 3 + 1);
  }

  update() {
    this.x += Math.random() * 5 - 2.5;
    this.y += Math.random() * 5 - 2.5;

    // 스프라이트 애니메이션 프레임 순환 (총 6프레임: 0~5)
    if (gameFrame % this.flapSpeed === 0) {
      this.frame > 4 ? (this.frame = 0) : this.frame++;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

/* ==========================================================================
   Enemy 2: 수평 이동 + 사인파(Sine Wave) 위아래 진동 패턴
   - enemy2.png (6 프레임, 266x188)
   - x축은 일정 속도로 왼쪽으로 이동, y축은 Math.sin()을 통해 부드러운 물결 이동
   ========================================================================== */
class Enemy2 {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/enemy2.png";
    this.speed = Math.random() * 4 + 1;
    this.spriteWidth = 266;
    this.spriteHeight = 188;
    this.width = this.spriteWidth / 2.5;
    this.height = this.spriteHeight / 2.5;
    this.x = Math.random() * (CANVAS_WIDTH - this.width);
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.frame = 0;
    this.flapSpeed = Math.floor(Math.random() * 3 + 1);
    this.angle = 0;
    this.angleSpeed = Math.random() * 0.2;
    this.curve = Math.random() * 7;
  }

  update() {
    this.x -= this.speed;
    this.y += this.curve * Math.sin(this.angle);
    this.angle += this.angleSpeed;

    if (this.x + this.width < 0) {
      this.x = CANVAS_WIDTH;
    }

    // 스프라이트 애니메이션 프레임 순환 (총 6프레임: 0~5)
    if (gameFrame % this.flapSpeed === 0) {
      this.frame > 4 ? (this.frame = 0) : this.frame++;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

/* ==========================================================================
   Enemy 3: 삼각함수(Sine / Cosine)를 결합한 복합 곡선 / 궤도 순환 패턴
   - enemy3.png (6 프레임, 218x177)
   - x축(Math.sin), y축(Math.cos) 주기를 다르게 하여 부드러운 8자/타원 궤도 회전
   ========================================================================== */
class Enemy3 {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/enemy3.png";
    this.spriteWidth = 218;
    this.spriteHeight = 177;
    this.width = this.spriteWidth / 2.5;
    this.height = this.spriteHeight / 2.5;
    this.x = Math.random() * (CANVAS_WIDTH - this.width);
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.frame = 0;
    this.flapSpeed = Math.floor(Math.random() * 3 + 1);
    this.angle = 0;
    this.angleSpeed = Math.random() * 1.5 + 0.5;
  }

  update() {
    this.x =
      (CANVAS_WIDTH / 2 - this.width / 2) *
        Math.sin((this.angle * Math.PI) / 90) +
      (CANVAS_WIDTH / 2 - this.width / 2);
    this.y =
      (CANVAS_HEIGHT / 2 - this.height / 2) *
        Math.cos((this.angle * Math.PI) / 270) +
      (CANVAS_HEIGHT / 2 - this.height / 2);
    this.angle += this.angleSpeed;

    if (this.x + this.width < 0) {
      this.x = CANVAS_WIDTH;
    }

    // 스프라이트 애니메이션 프레임 순환 (총 6프레임: 0~5)
    if (gameFrame % this.flapSpeed === 0) {
      this.frame > 4 ? (this.frame = 0) : this.frame++;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

/* ==========================================================================
   Enemy 4: 일정 주기마다 새로운 무작위 목표 좌표를 향해 부드럽게 추적 이동하는 패턴
   - enemy4.png (9 프레임, 213x212)
   - 거리 차이(dx, dy)를 일정 비율로 나누어 부드러운 감속 이동(Ease / LERP 효과)
   ========================================================================== */
class Enemy4 {
  constructor() {
    this.image = new Image();
    this.image.src = "./images/enemy4.png";
    this.spriteWidth = 213;
    this.spriteHeight = 212;
    this.width = this.spriteWidth / 2.5;
    this.height = this.spriteHeight / 2.5;
    this.x = Math.random() * (CANVAS_WIDTH - this.width);
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.newX = Math.random() * (CANVAS_WIDTH - this.width);
    this.newY = Math.random() * (CANVAS_HEIGHT - this.height);
    this.frame = 0;
    this.flapSpeed = Math.floor(Math.random() * 3 + 1);
    this.interval = Math.floor(Math.random() * 200 + 50);
  }

  update() {
    if (gameFrame % this.interval === 0) {
      this.newX = Math.random() * (CANVAS_WIDTH - this.width);
      this.newY = Math.random() * (CANVAS_HEIGHT - this.height);
    }
    let dx = this.x - this.newX;
    let dy = this.y - this.newY;
    this.x -= dx / 70;
    this.y -= dy / 70;

    if (this.x + this.width < 0) {
      this.x = CANVAS_WIDTH;
    }

    // 스프라이트 애니메이션 프레임 순환 (총 9프레임: 0~8)
    if (gameFrame % this.flapSpeed === 0) {
      this.frame > 7 ? (this.frame = 0) : this.frame++;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

// 선택된 패턴에 따라 적 객체들을 생성하는 함수
function setEnemyPattern(pattern) {
  enemies = [];
  const enemyClasses = [Enemy1, Enemy2, Enemy3, Enemy4];

  if (pattern === "enemy1") {
    for (let i = 0; i < numberOfEnemies; i++) {
      enemies.push(new Enemy1());
    }
  } else if (pattern === "enemy2") {
    for (let i = 0; i < numberOfEnemies; i++) {
      enemies.push(new Enemy2());
    }
  } else if (pattern === "enemy3") {
    for (let i = 0; i < numberOfEnemies; i++) {
      enemies.push(new Enemy3());
    }
  } else if (pattern === "enemy4") {
    for (let i = 0; i < numberOfEnemies; i++) {
      enemies.push(new Enemy4());
    }
  } else {
    // "all" - 4가지 패턴을 골고루 생성
    for (let i = 0; i < numberOfEnemies; i++) {
      const SelectedClass = enemyClasses[i % enemyClasses.length];
      enemies.push(new SelectedClass());
    }
  }
}

// 컨트롤 드롭다운 이벤트 리스너 연결
const patternSelect = document.getElementById("movementPattern");
if (patternSelect) {
  patternSelect.addEventListener("change", (e) => {
    setEnemyPattern(e.target.value);
  });
}

// 초기 실행 시 기본 선택값("all")으로 적 생성
setEnemyPattern(patternSelect ? patternSelect.value : "all");

function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  enemies.forEach((enemy) => {
    enemy.draw();
    enemy.update();
  });

  gameFrame++;
  requestAnimationFrame(animate);
}

animate();
