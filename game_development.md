# 🎮 JavaScript 게임 개발 완벽 가이드

> **대상**: 프로그래밍 기초를 알고 자바스크립트로 웹 및 단독 실행형 게임을 만들고자 하는 초보자  
> **목표**: 순수 자바스크립트 기초부터 상용급 2D/3D 프레임워크 활용, 그리고 데스크톱 단독 실행 파일(`.exe`, `.app`) 패키징까지의 로드맵 완벽 마스터

---

## 📌 목차
1. [자바스크립트 게임 개발이란?](#1-자바스크립트-게임-개발이란)
2. [단계별 게임 엔진 & 라이브러리 지도](#2-단계별-게임-엔진--라이브러리-지도)
3. [단독 실행 파일(데스크톱 앱) 제작 기술](#3-단독-실행-파일데스크톱-앱-제작-기술)
4. [초보자부터 중급자까지 실전 단계별 제작 가이드](#4-초보자부터-중급자까지-실전-단계별-제작-가이드)
5. [유용한 무료 게임 에셋 및 툴 추천](#5-유용한-무료-게임-에셋-및-툴-추천)

---

## 1. 자바스크립트 게임 개발이란?

자바스크립트는 웹 브라우저만 있으면 별도의 복잡한 설치 없이 즉시 실행해볼 수 있는 강력한 접근성을 가지고 있습니다.
- **브라우저 게임**: HTML5 `<canvas>`와 WebGL을 기반으로 브라우저 상에서 바로 구동됩니다.
- **단독 실행 파일 게임**: 웹 기술로 만든 게임을 **Electron** 또는 **Tauri**와 같은 데스크톱 래퍼(Wrapper)로 감싸면 스팀(Steam), itch.io 등에 배포 가능한 독립형 PC 게임(`.exe`, `.dmg`, `.app`)으로 변환할 수 있습니다.

---

## 2. 단계별 게임 엔진 & 라이브러리 지도

### 🟢 1단계: 입문 & 기초 (Vanilla JS / 가벼운 라이브러리)

외부 도구의 도움 없이 게임의 핵심 원리를 이해하고, 몇 줄의 코드로 빠른 성취감을 얻는 단계입니다.

| 도구 / 라이브러리 | 특징 및 설명 | 적합한 게임 장르 |
| :--- | :--- | :--- |
| **Vanilla Canvas API** | 라이브러리 없이 순수 HTML5 `<canvas>`와 JS만 사용. 게임 루프(`requestAnimationFrame`), 좌표계, 충돌 연산의 원리를 배우기에 최적. | 틱택토, 뱀게임(Snake), 벽돌깨기, 핑퐁 |
| **Kaboom.js** | 초보자를 위해 직관적이고 친절한 문법을 제공하는 모던 2D 게임 라이브러리. 텍스트 몇 줄로 캐릭터 생성, 중력, 충돌 구현 가능. | 마리오 스타일 플랫포머, 슈팅 게임 |
| **LittleJS** | 극도로 가볍고 빠른 초경량 2D 게임 엔진. 사운드 생성기 및 파티클 시스템이 내장되어 있어 작은 용량의 게임 제작에 유리. | 레트로 아케이드, 탑다운 슈터 |
| **Kontra.js** | 마이크로 게임 잼(JS13kGames)에서 널리 쓰이는 초소형(몇 KB 수준) 2D 라이브러리. | 가벼운 퍼즐, 2D 미니게임 |

---

### 🟡 2단계: 중급 (본격적인 2D 프레임워크)

복잡한 씬(Scene) 관리, 애니메이션, 물리 엔진, 타일맵(Tilemap), 사운드 믹싱 등을 안정적으로 지원하는 단계입니다.

| 도구 / 라이브러리 | 특징 및 설명 | 적합한 게임 장르 |
| :--- | :--- | :--- |
| **Phaser 3** ⭐ *(가장 추천)* | **자바스크립트 2D 게임의 사실상 표준(De-facto Standard)**. 거대한 커뮤니티, 방대한 튜토리얼, 아케이드 물리 엔진, 파티클, 타일맵 툴(Tiled) 연동 등 게임 제작에 필요한 모든 기능 내장. | RPG, 탄막 슈팅, 횡스크롤 액션, 디펜스 게임 |
| **PixiJS** | 게임 엔진이라기보다는 **초고속 2D 렌더링 엔진**. 렌더링 성능이 매우 뛰어나며, 물리/사운드는 직접 조합하여 자유도 높은 커스텀 엔진을 만들 때 주로 사용. | 화려한 비주얼 이펙트가 필요한 2D 게임, 슬롯/카지노 게임, 인터랙티브 웹 |
| **Excalibur.js** | TypeScript 친화적이며 최신 웹 표준을 따르는 깔끔하고 구조화된 2D 엔진. OOP(객체지향) 설계가 잘 되어 있음. | 턴제 전략, 스토리 기반 2D 게임 |

---

### 🔴 3단계: 고급 (3D 웹 게임 & 특수 엔진)

웹상에서 풀 3D 그래픽을 구현하거나 고사양 셰이더, 고급 물리 시뮬레이션을 다루는 단계입니다.

| 도구 / 라이브러리 | 특징 및 설명 | 적합한 게임 장르 |
| :--- | :--- | :--- |
| **Three.js** | WebGL을 쉽게 다룰 수 있게 해주는 가장 대중적인 3D 라이브러리. 3D 모델(GLTF/FBX) 로딩, 조명, 카메라, 셰이더 제어에 뛰어남. | 3D 탐험, 3D 캐주얼 게임, 시뮬레이터 |
| **Babylon.js** | 마이크로소프트가 주도하는 강력한 전문 3D 게임 엔진. Three.js보다 게임 개발에 특화된 물리, 오디오, 충돌, GUI 기능이 풍부하게 기본 탑재됨. | FPS, 3D 레이싱, MMORPG |
| **PlayCanvas** | 브라우저 기반의 시각적 웹 에디터를 제공하는 엔진. 유니티(Unity)와 유사한 개발 환경을 웹에서 제공. | 협업 중심 3D 프로젝트 |
| **물리 엔진 (Physics)** | **Matter.js** (2D 정밀 물리), **Rapier.js** (초고속 2D/3D WASM 물리), **Cannon-es** (3D 물리) | 사실적인 물리 퍼즐, 당구, 레이싱 |

---

## 3. 단독 실행 파일(데스크톱 앱) 제작 기술

웹 브라우저에서 개발한 HTML/JS/CSS 게임을 데스크톱 단독 실행 프로그램(`.exe`, `.dmg`, `.app`)으로 패키징하는 도구입니다.

```
[ HTML5 + JS 게임 코드 ]
         ↓
 [ 데스크톱 래퍼 프레임워크 ]
 ┌─────────────────────────┐
 │  Electron / Tauri / NW.js│
 └─────────────────────────┘
         ↓
[ Windows (.exe) / macOS (.app) / Linux ]
```

1. **Electron**
   - **특징**: 크로미움(Chromium) 브라우저와 Node.js를 하나로 묶어 데스크톱 앱을 생성.
   - **장점**: 레퍼런스가 가장 많고 설치 및 패키징(`electron-builder`, `electron-forge`)이 매우 쉬움.
   - **단점**: 결과물 파일 용량이 기본 80MB~150MB 이상으로 다소 큼.

2. **Tauri** ⭐ *(최신 트렌드 추천)*
   - **특징**: OS 기본 웹뷰를 활용하며 백엔드는 Rust로 작성된 초경량 패키징 툴.
   - **장점**: 빌드 파일 크기가 매우 작고(수 MB~10MB 내외), 메모리 점유율이 낮고 실행 속도가 빠름.
   - **단점**: 빌드 시 Rust 환경 설정이 필요함.

3. **NW.js**
   - **특징**: 과거부터 많이 쓰인 툴로, 소스 코드 난독화 및 바이너리 컴파일 기능이 뛰어나 소스 코드 보호가 필요할 때 고려.

---

## 4. 초보자부터 중급자까지 실전 단계별 제작 가이드

```
[Step 1: 캔버스 기초]  →  [Step 2: Kaboom.js]  →  [Step 3: Phaser 3 정복]  →  [Step 4: 단독 파일 빌드]
 (게임 루프 & 충돌)         (라이브러리 맛보기)         (본격 2D 상용 게임)           (Electron / Tauri)
```

---

### 🔹 Step 1: 순수 자바스크립트와 Canvas로 게임 루프 이해하기

프레임워크를 사용하기 전, 게임이 내부적으로 어떻게 작동하는지(업데이트 $\rightarrow$ 렌더링 $\rightarrow$ 반복) 체득합니다.

#### 1. 핵심 개념
- **게임 루프(Game Loop)**: 1초에 60번(`requestAnimationFrame`) 상태를 계산하고 화면을 다시 그림.
- **좌표계**: 캔버스의 좌측 상단이 `(0, 0)`이며, 오른쪽으로 갈수록 `X+`, 아래로 갈수록 `Y+`.
- **AABB 충돌 판정**: 사각형 간의 겹침 여부를 단순 수식으로 계산.

#### 2. 미니 예제 (움직이는 사각형)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    canvas { background: #1a1a1a; display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="480" height="320"></canvas>
  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const player = { x: 50, y: 50, size: 30, speed: 4 };
    const keys = {};

    window.addEventListener("keydown", (e) => (keys[e.key] = true));
    window.addEventListener("keyup", (e) => (keys[e.key] = false));

    // 1. 상태 업데이트
    function update() {
      if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
      if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
      if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
      if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    }

    // 2. 화면 렌더링
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 이전 프레임 지우기
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(player.x, player.y, player.size, player.size); // 플레이어 그리기
    }

    // 3. 게임 루프 실행
    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();
  </script>
</body>
</html>
```

---

### 🔹 Step 2: Kaboom.js로 1시간 만에 첫 게임 완성하기

순수 캔버스로 만들기 번거로운 중력, 점프, 발판 충돌, 애니메이션을 단순한 컴포넌트 기반 코드로 구현해봅니다.

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/kaboom@3000.0.1/dist/kaboom.js"></script>
</head>
<body>
  <script>
    // 1. Kaboom 초기화
    kaboom({ background: [30, 30, 40] });

    // 2. 바닥 생성 (고정 물체)
    add([
      rect(width(), 48),
      pos(0, height() - 48),
      outline(4),
      area(),
      body({ isStatic: true }),
      color(100, 100, 100),
    ]);

    // 3. 플레이어 생성 (중력 적용)
    setGravity(1600);
    const player = add([
      rect(32, 32),
      pos(80, 40),
      area(),
      body(),
      color(255, 100, 100),
    ]);

    // 4. 조작 이벤트
    onKeyDown("left", () => player.move(-300, 0));
    onKeyDown("right", () => player.move(300, 0));
    onKeyPress("space", () => {
      if (player.isGrounded()) player.jump(600);
    });
  </script>
</body>
</html>
```

---

### 🔹 Step 3: Phaser 3로 본격적인 2D 게임 아키텍처 다지기

상용 수준의 2D 게임을 만들 때는 **Phaser 3**를 채택하는 것이 가장 안전하고 효율적입니다.

#### Phaser 3의 3대 핵심 라이프사이클
1. `preload()`: 이미지, 스프라이트시트, 사운드 등 에셋을 사전 로드.
2. `create()`: 게임 오브젝트(플레이어, 타일맵, 물리 그룹) 생성 및 이벤트 바인딩.
3. `update()`: 매 프레임 실행되며 키 입력 및 물리적 상호작용 계산.

#### 기본 프로젝트 구조
```
my-phaser-game/
├── index.html
├── src/
│   ├── main.js             # 게임 설정(Phaser.Game) 및 진입점
│   ├── scenes/
│   │   ├── BootScene.js    # 로딩 화면
│   │   ├── MenuScene.js    # 타이틀 메뉴
│   │   └── GameScene.js    # 실제 게임 플레이 씬
│   └── objects/
│       └── Player.js       # 플레이어 클래스
└── assets/
    ├── images/
    └── sounds/
```

---

### 🔹 Step 4: 웹 게임을 데스크톱 단독 실행 파일(`.exe` / `.app`)로 패키징하기

브라우저에서 작동하는 게임 폴더를 **Electron**을 통해 독립 실행형 앱으로 변환하는 실전 방법입니다.

#### 1. 프로젝트 폴더 초기화 및 Electron 설치
```bash
mkdir desktop-game
cd desktop-game
npm init -y
npm install --save-dev electron electron-builder
```

#### 2. `main.js` (데스크톱 윈도우 생성 스크립트) 작성
```javascript
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false, // 게임 창 크기 고정
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false); // 상단 메뉴바 숨기기
  win.loadFile("index.html");       // 게임 HTML 로드
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
```

#### 3. `package.json` 설정
```json
{
  "name": "my-awesome-game",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "build": {
    "appId": "com.myname.mygame",
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    }
  }
}
```

#### 4. 로컬 테스트 및 빌드
```bash
# 로컬에서 단독 창으로 게임 실행해보기
npm start

# Windows용 .exe 또는 macOS용 .dmg 단독 설치/실행 파일 빌드
npm run build
```
빌드가 완료되면 `dist/` 폴더에 배포 가능한 설치 파일 및 실행 파일이 생성됩니다.

---

## 5. 유용한 무료 게임 에셋 및 툴 추천

게임 개발 시 아트와 사운드를 손쉽게 구할 수 있는 필수 사이트들입니다.

### 🎨 2D/3D 무료 그래픽 에셋
- **Kenney.nl**: "게임 에셋계의 무료 급식소". 상업적 이용이 가능한 수천 개의 고품질 2D/3D/UI 에셋(CC0).
- **itch.io (Game Assets)**: 인디 개발자들을 위한 스프라이트 시트 및 타일셋 다수 제공.
- **OpenGameArt.org**: 오픈소스 2D/3D 그래픽 및 텍스처 공유 커뮤니티.

### 🎵 사운드 & 음악 툴
- **sfxr / bfxr / jsfxr**: 브라우저에서 1초 만에 8비트 점프음, 폭발음, 레이저 사운드를 생성하는 툴.
- **Freesound.org**: 다양한 환경음 및 효과음 검색 사이트.
- **Chiptone**: 직관적인 UI의 레트로 사운드 이펙트 생성기.

### 🛠️ 레벨 디자인 & 그래픽 툴
- **Tiled (Map Editor)**: 2D 타일맵을 시각적으로 배치하고 JSON으로 내보내어 Phaser 등에서 로드할 수 있는 표준 툴.
- **Aseprite / Piskel**: 픽셀 아트 및 스프라이트 애니메이션 제작 툴.

---

## 💡 초보자를 위한 핵심 조언

1. **첫 프로젝트는 3일 안에 완성할 수 있을 만큼 작게 시작하세요.** (예: 퐁, 플래피버드, 스네이크)
2. **처음부터 모든 그래픽을 직접 그리려 하지 말고 무료 에셋(Kenney 등)을 적극 활용하세요.**
3. **Vanilla JS $\rightarrow$ Kaboom.js $\rightarrow$ Phaser 3 $\rightarrow$ Electron 패키징** 순서로 단계별 성공 경험을 쌓는 것이 가장 빠른 지름길입니다.
