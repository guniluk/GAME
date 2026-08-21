/**
 * 🍒 CHERRY MASTER '96 SPECIAL (8-Liner Slot Machine)
 * Complete Layout: Left Bonus Board & Maximized 3x3 Reels
 * Pure Single-Image Per Cell Architecture
 * 5-Stage Poker Card Double Chance (High-Low) System
 */

// ==========================================
// 1. 심볼 상수 및 가중치 정의
// ==========================================
const SYMBOLS = {
  ORANGE: 'ORANGE',
  MELON: 'MELON',
  BELL: 'BELL',
  WATERMELON: 'WATERMELON',
  BAR1: 'BAR1',
  BAR2: 'BAR2',
  BAR3: 'BAR3',
  CHERRY: 'CHERRY',
  SEVEN: 'SEVEN',
  SEVEN_TRIPLE: 'SEVEN_TRIPLE'
};

const SYMBOL_LIST = Object.values(SYMBOLS);

// 8개 당첨 라인 정의 (3x3 Grid: 0~8)
const PAYLINES = [
  { id: 1, type: 'HORIZONTAL', indices: [3, 4, 5], name: 'Center Row', color: '#ff3366' },
  { id: 2, type: 'HORIZONTAL', indices: [0, 1, 2], name: 'Top Row',    color: '#00f0ff' },
  { id: 3, type: 'HORIZONTAL', indices: [6, 7, 8], name: 'Bottom Row', color: '#ffde59' },
  { id: 4, type: 'VERTICAL',   indices: [0, 3, 6], name: 'Left Col',   color: '#00ff88' },
  { id: 5, type: 'VERTICAL',   indices: [1, 4, 7], name: 'Center Col', color: '#ff00ff' },
  { id: 6, type: 'VERTICAL',   indices: [2, 5, 8], name: 'Right Col',  color: '#ff9900' },
  { id: 7, type: 'DIAGONAL',   indices: [0, 4, 8], name: 'Diag TL-BR', color: '#ffffff' },
  { id: 8, type: 'DIAGONAL',   indices: [6, 4, 2], name: 'Diag BL-TR', color: '#b388ff' }
];

// 보너스 발생 빈도 순서에 맞춘 기준 가중치:
// 1. 체리 2개 (최고 빈도 ~10%)
// 2. 체리 3개 (~7.5%)
// 3. 1-BAR (~5.5%)
// 4. 종 (Bell) (~4.0%)
// 5. ALL Fruits (~2.0%)
// 6. 3개 7 (~1.0%)
// 7. 3개 777 (최저 빈도 ~0.5%)
const REEL_WEIGHTS = {
  [SYMBOLS.CHERRY]: 20,
  [SYMBOLS.BAR1]: 17,
  [SYMBOLS.BELL]: 15,
  [SYMBOLS.ORANGE]: 16,
  [SYMBOLS.MELON]: 15,
  [SYMBOLS.WATERMELON]: 12,
  [SYMBOLS.BAR2]: 6,
  [SYMBOLS.BAR3]: 4,
  [SYMBOLS.SEVEN]: 3.5,
  [SYMBOLS.SEVEN_TRIPLE]: 1.5
};

const GAME_STATE = {
  IDLE: 'IDLE',
  SPINNING: 'SPINNING',
  STOPPING: 'STOPPING',
  EVALUATING: 'EVALUATING',
  PAYOUT: 'PAYOUT',
  DOUBLE_CHANCE: 'DOUBLE_CHANCE'
};

// 52장 포커 카드 데이터 정의
const CARD_SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const CARD_RANKS = [
  { name: 'ace', val: 1, label: 'A' },
  { name: '2', val: 2, label: '2' },
  { name: '3', val: 3, label: '3' },
  { name: '4', val: 4, label: '4' },
  { name: '5', val: 5, label: '5' },
  { name: '6', val: 6, label: '6' },
  { name: '7', val: 7, label: '7' },
  { name: '8', val: 8, label: '8' },
  { name: '9', val: 9, label: '9' },
  { name: '10', val: 10, label: '10' },
  { name: 'jack', val: 11, label: 'J' },
  { name: 'queen', val: 12, label: 'Q' },
  { name: 'king', val: 13, label: 'K' }
];

class CherryMasterGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.width = 960;
    this.height = 640;

    this.state = GAME_STATE.IDLE;
    this.loadSaveData();

    this.activeLines = 8;
    this.betPerLine = 1;
    this.lastWinAmount = 0;
    this.pendingWinForDouble = 0;
    this.autoRun = false;
    this.isPaytableOpen = false;

    this.bonusQueue = [];
    this.currentBonus = null;

    this.images = {};
    this.pokerImages = {};
    this.loadedImagesCount = 0;
    this.totalImagesCount = 0;

    // 좌측 보드 치수
    this.leftBoardX = 16;
    this.leftBoardY = 25;
    this.leftBoardW = 158;
    this.leftBoardH = 580;

    // 3x3 릴 그리드 치수
    this.gridX = 195;
    this.gridY = 25;
    this.reelW = 245;
    this.cellH = 190;
    this.gridW = this.reelW * 3 + 12;
    this.gridH = this.cellH * 3;

    this.reels = [
      { id: 0, strip: [], position: 0, speed: 0, isSpinning: false, stopping: false, stopped: true, stopStartTime: 0, stopStartPos: 0, targetPos: 0, stopDuration: 820 },
      { id: 1, strip: [], position: 0, speed: 0, isSpinning: false, stopping: false, stopped: true, stopStartTime: 0, stopStartPos: 0, targetPos: 0, stopDuration: 820 },
      { id: 2, strip: [], position: 0, speed: 0, isSpinning: false, stopping: false, stopped: true, stopStartTime: 0, stopStartPos: 0, targetPos: 0, stopDuration: 820 }
    ];

    this.currentGrid = [
      SYMBOLS.ORANGE, SYMBOLS.MELON, SYMBOLS.CHERRY,
      SYMBOLS.BAR1,   SYMBOLS.SEVEN, SYMBOLS.WATERMELON,
      SYMBOLS.BELL,   SYMBOLS.BAR2,  SYMBOLS.ORANGE
    ];

    // 더블찬스 (High-Low) 상태 객체
    this.doubleChance = {
      stage: 1,             // 1 ~ 5 단계
      currentScore: 0,      // 현재 누적 더블업 점수
      targetScore: 0,       // 성공 시 획득할 점수 (currentScore * 2)
      baseCard: null,       // 현재 오픈된 기준 카드 { suit, rank, val, label, key }
      hiddenCard: null,     // 다음 숨겨진 카드
      isFlipped: false,     // 결과 오픈 여부
      isResolving: false,   // 딜레이 진행 중 여부
      message: 'HIGH OR LOW?',
      messageColor: '#ffde59'
    };

    this.winningLines = [];
    this.winParticles = [];
    this.statusMessage = 'INSERT COIN / PRESS START';
    this.statusColor = '#00f0ff';

    this.spinStartTime = 0;
    this.lastFrameTime = performance.now();
    this.animFrameId = null;

    this.init();
  }

  loadSaveData() {
    try {
      this.credits = parseInt(localStorage.getItem('cm_credits')) || 200;
      this.cherryBonusCount = parseInt(localStorage.getItem('cm_cherry_count')) || 0;
      this.totalWon = parseInt(localStorage.getItem('cm_total_won')) || 0;
      this.totalSpins = parseInt(localStorage.getItem('cm_total_spins')) || 0;
    } catch (e) {
      this.credits = 200;
      this.cherryBonusCount = 0;
      this.totalWon = 0;
      this.totalSpins = 0;
    }
  }

  saveData() {
    try {
      localStorage.setItem('cm_credits', this.credits);
      localStorage.setItem('cm_cherry_count', this.cherryBonusCount);
      localStorage.setItem('cm_total_won', this.totalWon);
      localStorage.setItem('cm_total_spins', this.totalSpins);
    } catch (e) {}
  }

  init() {
    this.loadAssets(() => {
      this.bindEvents();
      this.initReelStrips();
      this.updateDashboardUI();
      this.startLoop();
    });
  }

  loadAssets(callback) {
    const symbolSources = {
      [SYMBOLS.CHERRY]: 'images/symbol_cherry.png',
      [SYMBOLS.ORANGE]: 'images/symbol_orange.png',
      [SYMBOLS.MELON]: 'images/symbol_melon.png',
      [SYMBOLS.WATERMELON]: 'images/symbol_watermelon.png',
      [SYMBOLS.BELL]: 'images/symbol_bell.png',
      [SYMBOLS.BAR1]: 'images/symbol_bar1.png',
      [SYMBOLS.BAR2]: 'images/symbol_bar2.png',
      [SYMBOLS.BAR3]: 'images/symbol_bar3.png',
      [SYMBOLS.SEVEN]: 'images/symbol_seven.png',
      [SYMBOLS.SEVEN_TRIPLE]: 'images/symbol_seven_triple.png'
    };

    // 52장 포커 카드 목록 구성
    const pokerSources = {};
    CARD_SUITS.forEach(suit => {
      CARD_RANKS.forEach(rank => {
        const key = `${suit}_${rank.name}`;
        pokerSources[key] = `images/pokers/card_${suit}_${rank.name}.png`;
      });
    });

    const allKeys = [...Object.keys(symbolSources), ...Object.keys(pokerSources)];
    this.totalImagesCount = allKeys.length;

    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= this.totalImagesCount) callback();
    };

    // 슬롯 심볼 로드
    Object.keys(symbolSources).forEach(key => {
      const img = new Image();
      img.src = symbolSources[key];
      img.onload = () => { this.images[key] = img; checkDone(); };
      img.onerror = () => { checkDone(); };
    });

    // 포커 카드 로드
    Object.keys(pokerSources).forEach(key => {
      const img = new Image();
      img.src = pokerSources[key];
      img.onload = () => { this.pokerImages[key] = img; checkDone(); };
      img.onerror = () => { checkDone(); };
    });
  }

  // 가중치 기반 심볼 추첨 (±5% 동적 지터 변동성 적용)
  getRandomSymbol(bonusMode = null) {
    let baseWeights = { ...REEL_WEIGHTS };

    if (bonusMode === 'CHERRY') {
      baseWeights = {
        [SYMBOLS.CHERRY]: 21,
        [SYMBOLS.ORANGE]: 22,
        [SYMBOLS.MELON]: 20,
        [SYMBOLS.WATERMELON]: 14,
        [SYMBOLS.BELL]: 10,
        [SYMBOLS.BAR1]: 6,
        [SYMBOLS.BAR2]: 4,
        [SYMBOLS.BAR3]: 2,
        [SYMBOLS.SEVEN]: 1,
        [SYMBOLS.SEVEN_TRIPLE]: 0
      };
    } else if (bonusMode === 'BELL') {
      baseWeights = {
        [SYMBOLS.BELL]: 22,
        [SYMBOLS.ORANGE]: 21,
        [SYMBOLS.MELON]: 19,
        [SYMBOLS.CHERRY]: 14,
        [SYMBOLS.WATERMELON]: 11,
        [SYMBOLS.BAR1]: 6,
        [SYMBOLS.BAR2]: 4,
        [SYMBOLS.BAR3]: 2,
        [SYMBOLS.SEVEN]: 1,
        [SYMBOLS.SEVEN_TRIPLE]: 0
      };
    } else if (bonusMode === 'BAR') {
      baseWeights = {
        [SYMBOLS.BAR1]: 16,
        [SYMBOLS.BAR2]: 11,
        [SYMBOLS.BAR3]: 8,
        [SYMBOLS.ORANGE]: 21,
        [SYMBOLS.MELON]: 19,
        [SYMBOLS.BELL]: 10,
        [SYMBOLS.WATERMELON]: 10,
        [SYMBOLS.CHERRY]: 4,
        [SYMBOLS.SEVEN]: 1,
        [SYMBOLS.SEVEN_TRIPLE]: 0
      };
    } else if (bonusMode === 'SEVEN_TRIPLE') {
      baseWeights = {
        [SYMBOLS.SEVEN_TRIPLE]: 12,
        [SYMBOLS.SEVEN]: 15,
        [SYMBOLS.BAR3]: 8,
        [SYMBOLS.BAR2]: 8,
        [SYMBOLS.BAR1]: 8,
        [SYMBOLS.BELL]: 10,
        [SYMBOLS.WATERMELON]: 10,
        [SYMBOLS.MELON]: 14,
        [SYMBOLS.ORANGE]: 14,
        [SYMBOLS.CHERRY]: 1
      };
    } else if (bonusMode === 'ALL_FRUITS') {
      baseWeights = {
        [SYMBOLS.CHERRY]: 25,
        [SYMBOLS.ORANGE]: 25,
        [SYMBOLS.MELON]: 25,
        [SYMBOLS.WATERMELON]: 25,
        [SYMBOLS.BELL]: 0,
        [SYMBOLS.BAR1]: 0,
        [SYMBOLS.BAR2]: 0,
        [SYMBOLS.BAR3]: 0,
        [SYMBOLS.SEVEN]: 0,
        [SYMBOLS.SEVEN_TRIPLE]: 0
      };
    }

    const weights = {};
    let totalWeight = 0;
    for (const sym in baseWeights) {
      const jitter = 1 + (Math.random() - 0.5) * 0.10; // ±5% 지터
      weights[sym] = Math.max(0, baseWeights[sym] * jitter);
      totalWeight += weights[sym];
    }

    let rand = Math.random() * totalWeight;

    for (const sym in weights) {
      if (rand < weights[sym]) return sym;
      rand -= weights[sym];
    }
    return SYMBOLS.ORANGE;
  }

  // 랜덤 포커 카드 1장 뽑기
  getRandomCard() {
    const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
    const rank = CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)];
    return {
      suit,
      rank: rank.name,
      val: rank.val,
      label: rank.label,
      key: `${suit}_${rank.name}`
    };
  }

  initReelStrips() {
    this.reels.forEach((reel, col) => {
      reel.strip = [];
      for (let i = 0; i < 40; i++) {
        reel.strip.push(this.getRandomSymbol());
      }
      for (let r = 0; r < 3; r++) {
        reel.strip[r] = this.currentGrid[r * 3 + col];
      }
      reel.position = 0;
    });
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();

      if (this.state === GAME_STATE.DOUBLE_CHANCE) {
        if (key === 'H' || e.code === 'ArrowUp') {
          e.preventDefault();
          this.makeDoubleChoice('HIGH');
        } else if (key === 'L' || e.code === 'ArrowDown') {
          e.preventDefault();
          this.makeDoubleChoice('LOW');
        } else if (key === 'T' || e.code === 'Space' || key === 'ENTER' || e.code === 'Escape') {
          e.preventDefault();
          this.exitDoubleChance(); // 점수 수령 후 복귀
        }
        return;
      }

      if (e.code === 'Space' || key === 'ENTER') {
        e.preventDefault();
        this.handleSpinOrStopAll();
      } else if (key === 'D') {
        if (this.pendingWinForDouble > 0 && this.state === GAME_STATE.IDLE) {
          this.startDoubleChance();
        }
      } else if (key === 'P') {
        this.togglePaytableModal();
      } else if (key === 'C') {
        this.insertCoin();
      } else if (key === 'B' || e.code === 'ArrowUp') {
        this.cycleBet();
      } else if (key === 'M' || e.code === 'ArrowDown') {
        this.maxBet();
      } else if (key === '1') {
        this.stopReel(0);
      } else if (key === '2') {
        this.stopReel(1);
      } else if (key === '3') {
        this.stopReel(2);
      } else if (key === 'A') {
        this.toggleAuto();
      }
    });

    // 슬롯 컨트롤 버튼 바인딩
    document.getElementById('btnCoin').onclick = () => this.insertCoin();
    document.getElementById('btnBet1').onclick = () => this.cycleBet();
    document.getElementById('btnMaxBet').onclick = () => this.maxBet();
    document.getElementById('btnSpin').onclick = () => this.handleSpinOrStopAll();
    document.getElementById('btnStop1').onclick = () => this.stopReel(0);
    document.getElementById('btnStop2').onclick = () => this.stopReel(1);
    document.getElementById('btnStop3').onclick = () => this.stopReel(2);
    document.getElementById('btnAuto').onclick = () => this.toggleAuto();
    document.getElementById('btnDoubleUp').onclick = () => this.startDoubleChance();

    // 더블찬스 컨트롤 버튼 바인딩
    document.getElementById('btnChoiceHigh').onclick = () => this.makeDoubleChoice('HIGH');
    document.getElementById('btnChoiceLow').onclick = () => this.makeDoubleChoice('LOW');
    document.getElementById('btnExitDouble').onclick = () => this.exitDoubleChance();

    document.getElementById('btnTogglePaytable').onclick = () => this.togglePaytableModal();
    document.getElementById('btnClosePaytable').onclick = () => this.togglePaytableModal(false);
  }

  togglePaytableModal(forceState = null) {
    const modal = document.getElementById('paytableModal');
    if (forceState !== null) {
      this.isPaytableOpen = forceState;
    } else {
      this.isPaytableOpen = !this.isPaytableOpen;
    }
    if (this.isPaytableOpen) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }

  insertCoin() {
    this.credits += 100;
    this.saveData();
    this.updateDashboardUI();
    window.soundEngine.playCoin();
    this.showStatus('COIN INSERTED! +$100', '#ffe600');
  }

  cycleBet() {
    if (this.state !== GAME_STATE.IDLE) return;
    this.activeLines = (this.activeLines % 8) + 1;
    window.soundEngine.playReelStop();
    this.updateDashboardUI();
  }

  maxBet() {
    if (this.state !== GAME_STATE.IDLE) return;
    this.activeLines = 8;
    window.soundEngine.playReelStop();
    this.updateDashboardUI();
  }

  toggleAuto() {
    this.autoRun = !this.autoRun;
    document.getElementById('autoState').innerText = this.autoRun ? 'ON' : 'OFF';
    document.getElementById('btnAuto').style.filter = this.autoRun ? 'brightness(1.4)' : 'brightness(1)';
    if (this.autoRun && this.state === GAME_STATE.IDLE) {
      this.startSpin();
    }
  }

  handleSpinOrStopAll() {
    if (this.isPaytableOpen) {
      this.togglePaytableModal(false);
      return;
    }
    if (this.state === GAME_STATE.IDLE) {
      // 새로운 스핀 시작 시 보류 중이던 더블업 버튼 숨김
      this.pendingWinForDouble = 0;
      this.updateDoubleUpButtonState();
      this.startSpin();
    } else if (this.state === GAME_STATE.SPINNING) {
      this.reels.forEach(r => this.requestStopReel(r.id));
    }
  }

  stopReel(reelId) {
    if (this.state === GAME_STATE.SPINNING) {
      this.requestStopReel(reelId);
    }
  }

  requestStopReel(reelId) {
    const reel = this.reels[reelId];
    if (reel.isSpinning && !reel.stopping) {
      reel.stopRequested = true;
    }
  }

  // ==========================================
  // 4. 릴 스핀 및 물리 이징 감속 엔진
  // ==========================================
  startSpin() {
    const totalBet = this.activeLines * this.betPerLine;
    const isBonusSpin = (this.currentBonus !== null);

    if (!isBonusSpin) {
      if (this.credits < totalBet) {
        this.showStatus('NO CREDIT! PLEASE INSERT COIN (C)', '#ff3366');
        this.autoRun = false;
        document.getElementById('autoState').innerText = 'OFF';
        return;
      }
      this.credits -= totalBet;
    }

    this.state = GAME_STATE.SPINNING;
    this.winningLines = [];
    this.lastWinAmount = 0;
    this.pendingWinForDouble = 0;
    this.updateDoubleUpButtonState();
    this.totalSpins++;
    this.spinStartTime = performance.now();
    this.saveData();
    this.updateDashboardUI();

    window.soundEngine.playSpinStart();
    document.getElementById('spinBtnText').innerText = 'STOP ALL';

    const bonusMode = this.currentBonus ? this.currentBonus.type : null;

    this.reels.forEach((reel, col) => {
      reel.isSpinning = true;
      reel.stopRequested = false;
      reel.stopped = false;
      reel.stopping = false;
      reel.speed = 34 + Math.random() * 2;

      for (let row = 0; row < 3; row++) {
        this.currentGrid[row * 3 + col] = this.getRandomSymbol(bonusMode);
      }
    });

    this.showStatus(isBonusSpin ? `🎁 BONUS SPINNING! (${this.currentBonus.count} LEFT)` : 'REELS ROLLING...', '#ffde59');
  }

  updateReels(deltaTime) {
    if (this.state !== GAME_STATE.SPINNING && this.state !== GAME_STATE.STOPPING) return;

    const now = performance.now();
    const elapsed = (now - this.spinStartTime) / 1000;

    // 약 3초 템포 순차 정지 시작 (1.8s -> 2.15s -> 2.5s)
    if (elapsed > 1.8 && !this.reels[0].stopRequested) this.requestStopReel(0);
    if (elapsed > 2.15 && !this.reels[1].stopRequested) this.requestStopReel(1);
    if (elapsed > 2.5 && !this.reels[2].stopRequested) this.requestStopReel(2);

    let allStopped = true;

    this.reels.forEach((reel, col) => {
      if (reel.isSpinning) {
        allStopped = false;

        if (reel.stopRequested) {
          if (!reel.stopping) {
            reel.stopping = true;
            reel.stopStartTime = now;
            reel.stopStartPos = reel.position;
            
            const extraSteps = 4;
            const targetIndex = Math.floor(reel.position / this.cellH) + extraSteps;
            reel.targetPos = targetIndex * this.cellH;
            reel.stopDuration = 800;

            const stripLen = reel.strip.length;
            reel.strip[((targetIndex - 0) % stripLen + stripLen) % stripLen] = this.currentGrid[0 * 3 + col];
            reel.strip[((targetIndex - 1) % stripLen + stripLen) % stripLen] = this.currentGrid[1 * 3 + col];
            reel.strip[((targetIndex - 2) % stripLen + stripLen) % stripLen] = this.currentGrid[2 * 3 + col];
            
            for (let k = 3; k <= 8; k++) {
              reel.strip[((targetIndex - k) % stripLen + stripLen) % stripLen] = this.getRandomSymbol();
            }
          }

          const stopElapsed = now - reel.stopStartTime;
          const t = Math.min(stopElapsed / reel.stopDuration, 1.0);

          const easeOut = 1 - Math.pow(1 - t, 3);
          reel.position = reel.stopStartPos + (reel.targetPos - reel.stopStartPos) * easeOut;

          if (t >= 1.0) {
            reel.position = reel.targetPos;
            reel.isSpinning = false;
            reel.stopping = false;
            reel.stopped = true;
            window.soundEngine.playReelStop();
          }
        } else {
          reel.position += reel.speed;
        }
      }
    });

    if (allStopped && (this.state === GAME_STATE.SPINNING || this.state === GAME_STATE.STOPPING)) {
      this.state = GAME_STATE.EVALUATING;
      document.getElementById('spinBtnText').innerText = 'START';
      this.evaluateGameResult();
    }
  }

  // ==========================================
  // 5. 당첨금 산정 및 체리/스캐터 판정
  // ==========================================
  evaluateGameResult() {
    let spinPayout = 0;
    const matchedLines = [];
    const bonusTriggers = [];
    const grid = this.currentGrid;

    // 1. 3개 심볼 일치 판정 (과일, BAR, 종)
    for (let i = 0; i < this.activeLines; i++) {
      const line = PAYLINES[i];
      const s0 = grid[line.indices[0]];
      const s1 = grid[line.indices[1]];
      const s2 = grid[line.indices[2]];

      if (s0 === s1 && s1 === s2 && s0 !== SYMBOLS.CHERRY && s0 !== SYMBOLS.SEVEN && s0 !== SYMBOLS.SEVEN_TRIPLE) {
        let baseWin = 0;
        switch (s0) {
          case SYMBOLS.ORANGE:     baseWin = 10; break;
          case SYMBOLS.MELON:      baseWin = 20; break;
          case SYMBOLS.BELL:       baseWin = 30; bonusTriggers.push({ type: 'BELL', count: 5 }); break;
          case SYMBOLS.WATERMELON: baseWin = 50; break;
          case SYMBOLS.BAR1:       baseWin = 50; bonusTriggers.push({ type: 'BAR', count: 5 }); break;
          case SYMBOLS.BAR2:       baseWin = 100; break;
          case SYMBOLS.BAR3:       baseWin = 200; break;
        }

        if (baseWin > 0) {
          const winVal = baseWin * this.betPerLine;
          spinPayout += winVal;
          matchedLines.push({ ...line, symbol: s0, winVal });
        }
      }

      // 7 & 777 혼합 라인 판정 (7-7-7도 1회 보너스, 777 수에 비례하여 가점)
      const isSeven0 = (s0 === SYMBOLS.SEVEN || s0 === SYMBOLS.SEVEN_TRIPLE);
      const isSeven1 = (s1 === SYMBOLS.SEVEN || s1 === SYMBOLS.SEVEN_TRIPLE);
      const isSeven2 = (s2 === SYMBOLS.SEVEN || s2 === SYMBOLS.SEVEN_TRIPLE);

      if (isSeven0 && isSeven1 && isSeven2) {
        let triple7Count = 0;
        if (s0 === SYMBOLS.SEVEN_TRIPLE) triple7Count++;
        if (s1 === SYMBOLS.SEVEN_TRIPLE) triple7Count++;
        if (s2 === SYMBOLS.SEVEN_TRIPLE) triple7Count++;

        let sevenLineWin = 500;
        if (triple7Count === 1) sevenLineWin = 580;
        else if (triple7Count === 2) sevenLineWin = 660;
        else if (triple7Count === 3) sevenLineWin = 750;

        bonusTriggers.push({ type: 'SEVEN_TRIPLE', count: 1 });

        const winVal = sevenLineWin * this.betPerLine;
        spinPayout += winVal;
        matchedLines.push({ ...line, symbol: 'ANY_SEVEN', winVal, tripleCount: triple7Count });
      }
    }

    // 2. 체리 당첨 룰
    let hasCherryTwoLine = false;

    for (let i = 0; i < this.activeLines; i++) {
      const line = PAYLINES[i];
      const idxs = line.indices;
      const startCell = idxs[0];

      if (grid[startCell] === SYMBOLS.CHERRY) {
        let consecutiveCherries = 1;
        if (grid[idxs[1]] === SYMBOLS.CHERRY) {
          consecutiveCherries = 2;
          if (grid[idxs[2]] === SYMBOLS.CHERRY) {
            consecutiveCherries = 3;
          }
        }

        let cherryLineWin = 0;
        if (consecutiveCherries === 1) {
          cherryLineWin = 1;
        } else if (consecutiveCherries === 2) {
          cherryLineWin = 3;
          hasCherryTwoLine = true;
        } else if (consecutiveCherries === 3) {
          cherryLineWin = 5;
          bonusTriggers.push({ type: 'CHERRY', count: 1 });
        }

        if (cherryLineWin > 0) {
          const winVal = cherryLineWin * this.betPerLine;
          spinPayout += winVal;
          matchedLines.push({ ...line, symbol: SYMBOLS.CHERRY, winVal, isCherry: true, count: consecutiveCherries });
        }
      }
    }

    // 3. 체리 2개 라인 완성 시에만 5회 누적 게이지 1회 적립
    if (hasCherryTwoLine) {
      this.cherryBonusCount++;
      window.soundEngine.playCherryCount();
      if (this.cherryBonusCount >= 5) {
        bonusTriggers.push({ type: 'CHERRY', count: 5 });
        this.cherryBonusCount = 0;
        this.showStatus('🍒 CHERRY BIG BONUS ACTIVATED! (5 SPINS)', '#ff0077');
      }
    }

    // 4. 7 & 777 스캐터 판정 (라인 무관 2개 이상 등장 시 당첨, 777 개수 비례 가점)
    const winningSevenCells = [];
    let count7 = 0;
    let count777 = 0;

    grid.forEach((s, idx) => {
      if (s === SYMBOLS.SEVEN) {
        winningSevenCells.push(idx);
        count7++;
      } else if (s === SYMBOLS.SEVEN_TRIPLE) {
        winningSevenCells.push(idx);
        count777++;
      }
    });

    const totalSevenCount = count7 + count777;
    const isJackpot = (totalSevenCount === 9);

    if (isJackpot) {
      spinPayout += (20000 * this.betPerLine);
      matchedLines.push({ id: 'JACKPOT', type: 'SPECIAL', indices: winningSevenCells, color: '#ffe600', name: 'Ultra Jackpot ALL-7s' });
    } else if (totalSevenCount >= 2) {
      let baseScatterWin = 0;
      let tripleBonusPerItem = 0;

      if (totalSevenCount === 2) { baseScatterWin = 50; tripleBonusPerItem = 30; }
      else if (totalSevenCount === 3) { baseScatterWin = 150; tripleBonusPerItem = 50; }
      else if (totalSevenCount === 4) { baseScatterWin = 300; tripleBonusPerItem = 80; }
      else if (totalSevenCount === 5) { baseScatterWin = 500; tripleBonusPerItem = 100; }
      else if (totalSevenCount === 6) { baseScatterWin = 800; tripleBonusPerItem = 150; }
      else if (totalSevenCount === 7) { baseScatterWin = 1200; tripleBonusPerItem = 200; }
      else if (totalSevenCount >= 8) { baseScatterWin = 2000; tripleBonusPerItem = 300; }

      const totalScatterWin = baseScatterWin + (count777 * tripleBonusPerItem);
      const winVal = totalScatterWin * this.betPerLine;
      spinPayout += winVal;

      matchedLines.push({
        id: 'SEVEN_SCATTER',
        type: 'SPECIAL',
        indices: winningSevenCells,
        color: '#ffde59',
        name: `7 Scatter (${totalSevenCount}개, 777 가점 +$${count777 * tripleBonusPerItem})`
      });
      this.showStatus(`🎰 7 SCATTER HIT! (${totalSevenCount}개) +$${winVal}`, '#ffe600');
    }

    // 5. ALL FRUITS 판정
    const fruitSymbols = [SYMBOLS.CHERRY, SYMBOLS.MELON, SYMBOLS.ORANGE, SYMBOLS.WATERMELON];
    const isAllFruits = grid.every(s => fruitSymbols.includes(s));

    if (isAllFruits) {
      const allFruitsWin = 500 * this.betPerLine;
      spinPayout += allFruitsWin;
      bonusTriggers.push({ type: 'ALL_FRUITS', count: 1 });
      
      matchedLines.push({
        id: 'ALL_FRUITS',
        type: 'SPECIAL',
        indices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        color: '#ff1744',
        name: 'ALL FRUITS +$500'
      });
      this.showStatus('🍓 ALL FRUITS SPECIAL! +$500 (1 FREE ROLL) 🍉', '#ff1744');
    }

    // 6. 정산 및 연출
    this.winningLines = matchedLines;
    this.lastWinAmount = spinPayout;
    this.credits += spinPayout;
    this.totalWon += spinPayout;

    bonusTriggers.forEach(b => this.bonusQueue.push(b));

    if (this.currentBonus) {
      this.currentBonus.count--;
      if (this.currentBonus.count <= 0) {
        this.currentBonus = null;
      }
    }

    if (!this.currentBonus && this.bonusQueue.length > 0) {
      this.currentBonus = this.bonusQueue.shift();
      window.soundEngine.playBonusFanfare();
    }

    if (isJackpot) {
      window.soundEngine.playJackpot();
      this.showStatus('💥 ULTRA JACKPOT ALL-SEVENS!! +$20,000 💥', '#ffde59');
      this.spawnParticles(120);
    } else if (spinPayout > 0) {
      window.soundEngine.playWin();
      this.showStatus(`WINNER! +$${spinPayout} (PRESS [D] FOR DOUBLE UP!)`, '#00ff88');
      this.spawnParticles(40);
      
      // 당첨금 발생 시 더블찬스 도전 활성화
      this.pendingWinForDouble = spinPayout;
    } else {
      this.pendingWinForDouble = 0;
      if (this.currentBonus) {
        this.showStatus(`BONUS PLAYING (${this.currentBonus.count} LEFT)`, '#00f0ff');
      } else {
        this.showStatus('PLAY ON / PUSH START', '#7b7296');
      }
    }

    this.saveData();
    this.updateDashboardUI();
    this.updateDoubleUpButtonState();
    this.state = GAME_STATE.IDLE;

    if (this.currentBonus || (this.autoRun && this.pendingWinForDouble === 0)) {
      setTimeout(() => {
        if (this.state === GAME_STATE.IDLE && (this.currentBonus || this.autoRun)) {
          this.startSpin();
        }
      }, 1100);
    }
  }

  updateDoubleUpButtonState() {
    const btn = document.getElementById('btnDoubleUp');
    if (!btn) return;
    if (this.pendingWinForDouble > 0 && this.state === GAME_STATE.IDLE && !this.currentBonus) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }

  // ==========================================
  // 6. 더블찬스 (High-Low) 시스템 & 로직
  // ==========================================
  startDoubleChance() {
    if (this.pendingWinForDouble <= 0) return;

    this.state = GAME_STATE.DOUBLE_CHANCE;
    this.autoRun = false;
    document.getElementById('autoState').innerText = 'OFF';

    const initialScore = this.pendingWinForDouble;
    this.doubleChance.stage = 1;
    this.doubleChance.currentScore = initialScore;
    this.doubleChance.targetScore = initialScore * 2;
    this.doubleChance.baseCard = this.getRandomCard();
    this.doubleChance.hiddenCard = this.getRandomCard();
    this.doubleChance.isFlipped = false;
    this.doubleChance.isResolving = false;
    this.doubleChance.message = 'SELECT HIGH (8-K) OR LOW (A-6)';
    this.doubleChance.messageColor = '#ffde59';

    // 이미 크레딧에 더해졌던 당첨금을 더블업 판돈으로 배팅 회수
    this.credits = Math.max(0, this.credits - initialScore);
    this.pendingWinForDouble = 0;
    this.saveData();
    this.updateDashboardUI();

    // 컨트롤 UI 전환
    document.getElementById('slotControls').style.display = 'none';
    document.getElementById('doubleControls').style.display = 'flex';
    document.getElementById('guideSlot').classList.add('hidden');
    document.getElementById('guideDouble').classList.remove('hidden');

    window.soundEngine.playCardFlip();
  }

  makeDoubleChoice(choice) {
    if (this.state !== GAME_STATE.DOUBLE_CHANCE || this.doubleChance.isResolving) return;

    this.doubleChance.isResolving = true;
    this.doubleChance.isFlipped = true;
    window.soundEngine.playCardFlip();

    const targetVal = this.doubleChance.hiddenCard.val;
    const baseVal = this.doubleChance.baseCard.val;

    let isWin = false;
    let isTie = false;

    if (targetVal === 7) {
      isTie = true;
    } else if (choice === 'HIGH' && targetVal >= 8) {
      isWin = true;
    } else if (choice === 'LOW' && targetVal <= 6) {
      isWin = true;
    }

    setTimeout(() => {
      if (isTie) {
        this.doubleChance.message = '★ TIE (7) - RETRY CHANCE! ★';
        this.doubleChance.messageColor = '#00f0ff';
        window.soundEngine.playWin();

        setTimeout(() => {
          this.doubleChance.baseCard = this.doubleChance.hiddenCard;
          this.doubleChance.hiddenCard = this.getRandomCard();
          this.doubleChance.isFlipped = false;
          this.doubleChance.isResolving = false;
          this.doubleChance.message = 'SELECT HIGH (8-K) OR LOW (A-6)';
          this.doubleChance.messageColor = '#ffde59';
        }, 1200);

      } else if (isWin) {
        this.doubleChance.currentScore *= 2;
        this.doubleChance.targetScore = this.doubleChance.currentScore * 2;
        window.soundEngine.playDoubleUpSuccess();
        this.spawnParticles(35);

        if (this.doubleChance.stage >= 5) {
          this.doubleChance.message = `👑 5-STAGE COMPLETE! WON $${this.doubleChance.currentScore}! 👑`;
          this.doubleChance.messageColor = '#ffe600';
          window.soundEngine.playJackpot();
          this.spawnParticles(80);

          setTimeout(() => {
            this.exitDoubleChance(); // 5단계 완승 시 점수 수령 후 자동 복귀
          }, 2200);
        } else {
          this.doubleChance.stage++;
          this.doubleChance.message = `★ WINNER! $${this.doubleChance.currentScore} (STAGE ${this.doubleChance.stage}/5) ★`;
          this.doubleChance.messageColor = '#00ff88';

          setTimeout(() => {
            this.doubleChance.baseCard = this.doubleChance.hiddenCard;
            this.doubleChance.hiddenCard = this.getRandomCard();
            this.doubleChance.isFlipped = false;
            this.doubleChance.isResolving = false;
            this.doubleChance.message = 'SELECT HIGH / LOW OR TAKE SCORE';
            this.doubleChance.messageColor = '#ffde59';
            this.updateDashboardUI();
          }, 1400);
        }

      } else {
        // 실패 시 판돈 0으로 몰수 후 복귀
        this.doubleChance.message = '💥 FAILED! YOU LOST THE BET! 💥';
        this.doubleChance.messageColor = '#ff3366';
        window.soundEngine.playDoubleUpFail();
        this.doubleChance.currentScore = 0; // 몰수

        setTimeout(() => {
          this.exitDoubleChance();
        }, 1800);
      }

      this.updateDashboardUI();
    }, 500);
  }

  // 더블찬스 종료 및 점수 수령 후 슬롯 모드 복귀 (EXIT 누를 시 현재 점수 전액 수령)
  exitDoubleChance() {
    if (this.state !== GAME_STATE.DOUBLE_CHANCE) return;

    // 현재 점수가 남아있으면 전액 크레딧에 합산 수령
    if (this.doubleChance.currentScore > 0) {
      this.credits += this.doubleChance.currentScore;
      this.totalWon += this.doubleChance.currentScore;
      this.lastWinAmount = this.doubleChance.currentScore;
      window.soundEngine.playCoin();
      this.showStatus(`DOUBLE UP SCORE TAKEN! +$${this.doubleChance.currentScore}`, '#ffe600');
    }

    this.state = GAME_STATE.IDLE;
    this.pendingWinForDouble = 0;
    this.doubleChance.currentScore = 0;
    this.doubleChance.isResolving = false;

    // 슬롯 컨트롤 UI로 복귀
    document.getElementById('slotControls').style.display = 'flex';
    document.getElementById('doubleControls').style.display = 'none';
    document.getElementById('guideSlot').classList.remove('hidden');
    document.getElementById('guideDouble').classList.add('hidden');

    this.saveData();
    this.updateDashboardUI();
    this.updateDoubleUpButtonState();
  }

  updateDashboardUI() {
    document.getElementById('displayCredit').innerText = this.credits;
    document.getElementById('displayBet').innerText = `${this.activeLines * this.betPerLine} (${this.activeLines}L)`;
    
    if (this.state === GAME_STATE.DOUBLE_CHANCE) {
      document.getElementById('displayWin').innerText = `$${this.doubleChance.currentScore}`;
    } else {
      document.getElementById('displayWin').innerText = this.lastWinAmount > 0 ? `+$${this.lastWinAmount}` : '000';
    }
    
    const bonusSpins = this.currentBonus ? `${this.currentBonus.type} (${this.currentBonus.count})` : '--';
    document.getElementById('displayBonus').innerText = bonusSpins;

    for (let i = 0; i < 5; i++) {
      const lamp = document.getElementById(`clamp${i}`);
      if (lamp) {
        if (i < this.cherryBonusCount) lamp.classList.add('lit');
        else lamp.classList.remove('lit');
      }
    }
    const gaugeTxt = document.getElementById('cherryGaugeText');
    if (gaugeTxt) gaugeTxt.innerText = `[${this.cherryBonusCount}/5]`;
  }

  showStatus(msg, color = '#00f0ff') {
    this.statusMessage = msg;
    this.statusColor = color;
  }

  spawnParticles(count) {
    for (let i = 0; i < count; i++) {
      this.winParticles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 500,
        y: 280,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 16 - 4,
        size: 9 + Math.random() * 12,
        color: ['#ffde59', '#ff0077', '#00f0ff', '#00ff88', '#ffffff'][Math.floor(Math.random() * 5)],
        life: 1.0
      });
    }
  }

  // ==========================================
  // 7. 60FPS Canvas 렌더링 루프
  // ==========================================
  startLoop() {
    const loop = (currentTime) => {
      const deltaTime = (currentTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = currentTime;

      this.updateReels(deltaTime);
      this.updateParticles(deltaTime);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  updateParticles(dt) {
    for (let i = this.winParticles.length - 1; i >= 0; i--) {
      const p = this.winParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 22 * dt;
      p.life -= 0.9 * dt;
      if (p.life <= 0) {
        this.winParticles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === GAME_STATE.DOUBLE_CHANCE) {
      // 🌟 더블찬스 전용 화면 렌더링
      this.renderDoubleChanceScreen(ctx);
    } else {
      // 🎰 본 게임 슬롯 화면 렌더링
      this.renderBackground(ctx);
      this.renderLeftPanel(ctx);
      this.renderPure3x3Reels(ctx);
      this.renderPaylines(ctx);
    }

    this.renderParticles(ctx);
  }

  renderBackground(ctx) {
    const grad = ctx.createRadialGradient(480, 320, 50, 480, 320, 550);
    grad.addColorStop(0, '#100c24');
    grad.addColorStop(1, '#05030a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = '#2d224d';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
  }

  // ==========================================
  // 8. 더블찬스 (High & Low) 아케이드 렌더링
  // ==========================================
  renderDoubleChanceScreen(ctx) {
    // 1. 네온 아케이드 배경
    const bgGrad = ctx.createRadialGradient(480, 320, 40, 480, 320, 520);
    bgGrad.addColorStop(0, '#1a0b2e');
    bgGrad.addColorStop(0.6, '#0f051d');
    bgGrad.addColorStop(1, '#05010a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 상단 네온 타이틀 헤더 바
    ctx.fillStyle = '#110624';
    ctx.fillRect(20, 18, 920, 55);
    ctx.strokeStyle = '#ff0077';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, 18, 920, 55);

    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('★ DOUBLE CHANCE (HIGH & LOW) ★', 480, 45);
    ctx.font = '12px Orbitron';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`STAGE [ ${this.doubleChance.stage} / 5 ]  |  CURRENT SCORE: $${this.doubleChance.currentScore}  ➔  DOUBLE WIN: $${this.doubleChance.targetScore}`, 480, 64);

    // 2. 화면 왼쪽: 5회 스테이지 그림 변경 화면 (x: 20, y: 85, w: 370, h: 535)
    this.renderDoubleStageProgress(ctx, 20, 85, 370, 535);

    // 3. 화면 오른쪽: 포커 카드 하이&로우 게임 테이블 (x: 410, y: 85, w: 530, h: 535)
    this.renderDoubleCardGame(ctx, 410, 85, 530, 535);
  }

  // 왼쪽: 5회에 걸쳐 성공할 때마다 그림이 변경되는 스테이지 화면
  renderDoubleStageProgress(ctx, x, y, w, h) {
    ctx.fillStyle = '#0c0618';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3d2b63';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // 좌측 헤더
    ctx.fillStyle = '#ff0077';
    ctx.font = 'bold 14px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 STAGE PROGRESS (5 ROUNDS)', x + w / 2, y + 28);

    const stages = [
      { num: 1, name: 'BRONZE STAGE', mult: '2x WIN', color: '#cd7f32', icon: '🥉', desc: '1단계 성공' },
      { num: 2, name: 'SILVER STAGE', mult: '4x WIN', color: '#c0c0c0', icon: '🥈', desc: '2단계 연속성공' },
      { num: 3, name: 'GOLD STAGE', mult: '8x WIN', color: '#ffd700', icon: '🥇', desc: '3단계 연속성공' },
      { num: 4, name: 'DIAMOND STAGE', mult: '16x WIN', color: '#00f0ff', icon: '💎', desc: '4단계 대박돌파' },
      { num: 5, name: 'ROYAL MASTER', mult: '32x MAX', color: '#ff0077', icon: '👑', desc: '5단계 완승 잭팟!' }
    ];

    const cardH = 88;
    stages.forEach((st, idx) => {
      const cy = y + 42 + idx * 95;
      const isCurrent = (this.doubleChance.stage === st.num);
      const isPassed = (this.doubleChance.stage > st.num);

      // 단계별 카드 배경
      if (isCurrent) {
        ctx.fillStyle = 'rgba(255, 222, 89, 0.15)';
        ctx.fillRect(x + 10, cy, w - 20, cardH);
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 10, cy, w - 20, cardH);

        // 글로우 효과
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 15;
      } else if (isPassed) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.fillRect(x + 10, cy, w - 20, cardH);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 10, cy, w - 20, cardH);
      } else {
        ctx.fillStyle = '#140c26';
        ctx.fillRect(x + 10, cy, w - 20, cardH);
        ctx.strokeStyle = '#271945';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 10, cy, w - 20, cardH);
      }

      ctx.shadowBlur = 0;

      // 단계 아이콘 & 이름
      ctx.font = '28px Pretendard';
      ctx.textAlign = 'left';
      ctx.fillText(st.icon, x + 24, cy + 54);

      ctx.font = 'bold 13px Orbitron';
      ctx.fillStyle = isCurrent ? '#ffde59' : (isPassed ? '#00ff88' : '#8c82aa');
      ctx.fillText(`STAGE ${st.num}: ${st.name}`, x + 72, cy + 34);

      ctx.font = '11px Pretendard';
      ctx.fillStyle = isCurrent ? '#fff' : (isPassed ? '#6ee7b7' : '#635882');
      ctx.fillText(st.desc, x + 72, cy + 55);

      // 배율 배지
      ctx.font = 'bold 14px Orbitron';
      ctx.textAlign = 'right';
      ctx.fillStyle = isCurrent ? st.color : (isPassed ? '#00ff88' : '#635882');
      ctx.fillText(st.mult, x + w - 24, cy + 48);

      if (isPassed) {
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 11px Orbitron';
        ctx.fillText('CLEAR ✓', x + w - 24, cy + 68);
      } else if (isCurrent) {
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 11px Orbitron';
        ctx.fillText('PLAYING ▶', x + w - 24, cy + 68);
      }
    });
  }

  // 오른쪽: 포커 카드 하이&로우 카드 대결 화면
  renderDoubleCardGame(ctx, x, y, w, h) {
    ctx.fillStyle = '#0c0618';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // 하이로우 설명 배너
    ctx.fillStyle = '#160d2e';
    ctx.fillRect(x + 15, y + 15, w - 30, 48);
    ctx.strokeStyle = '#ffde59';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 15, y + 15, w - 30, 48);

    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.doubleChance.messageColor;
    ctx.fillText(this.doubleChance.message, x + w / 2, y + 44);

    // 카드 렌더링 영역 (2장: Base Card vs Hidden Card)
    const cardW = 160;
    const cardH = 230;
    const cardY = y + 90;

    const baseCardX = x + 60;
    const hiddenCardX = x + w - cardW - 60;

    // 1. 기준 카드 (Base Card)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Orbitron';
    ctx.fillText('OPEN BASE CARD', baseCardX + cardW / 2, cardY - 12);
    this.drawPokerCard(ctx, baseCardX, cardY, cardW, cardH, this.doubleChance.baseCard, false);

    // VS 표시
    ctx.fillStyle = '#ff0077';
    ctx.font = 'bold 22px Orbitron';
    ctx.fillText('VS', x + w / 2, cardY + cardH / 2 + 8);

    // 2. 뒤집힌 도전 카드 (Hidden Card)
    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 12px Orbitron';
    ctx.fillText(this.doubleChance.isFlipped ? 'REVEALED CARD' : 'HIDDEN TARGET', hiddenCardX + cardW / 2, cardY - 12);
    this.drawPokerCard(ctx, hiddenCardX, cardY, cardW, cardH, this.doubleChance.hiddenCard, !this.doubleChance.isFlipped);

    // 하단 하이로우 가이드 카드 룰 요약 박스
    const guideY = y + cardH + 115;
    ctx.fillStyle = '#130924';
    ctx.fillRect(x + 25, guideY, w - 50, 130);
    ctx.strokeStyle = '#38265e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 25, guideY, w - 50, 130);

    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 13px Orbitron';
    ctx.fillText('★ HIGH / LOW RULES ★', x + w / 2, guideY + 28);

    ctx.font = '12px Pretendard';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('• HIGH 선택: 뒤집힌 카드가 [ 8, 9, 10, J, Q, K ] 이면 성공 (2배 획득!)', x + w / 2, guideY + 54);
    ctx.fillStyle = '#ff3366';
    ctx.fillText('• LOW 선택: 뒤집힌 카드가 [ A, 2, 3, 4, 5, 6 ] 이면 성공 (2배 획득!)', x + w / 2, guideY + 76);
    ctx.fillStyle = '#ffde59';
    ctx.fillText('• 언제든 [💰 점수 수령 후 복귀] 버튼이나 [ESC]를 눌러 현재 점수를 챙겨 복귀할 수 있습니다.', x + w / 2, guideY + 98);
    ctx.fillStyle = '#a59ac4';
    ctx.fillText('• 7은 무승부(TIE)로 재도전! | 실패 시에는 판돈을 잃고 복귀합니다.', x + w / 2, guideY + 118);
  }

  // 포커 카드 단일 렌더링 함수
  drawPokerCard(ctx, cx, cy, cw, ch, card, isFaceDown) {
    ctx.save();

    // 카드 그림자
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    if (isFaceDown) {
      // 뒤집힌 카드 (화려한 네온 레트로 아케이드 뒷면)
      ctx.fillStyle = '#1c0a38';
      ctx.beginPath();
      ctx.roundRect(cx, cy, cw, ch, 10);
      ctx.fill();

      ctx.strokeStyle = '#ff0077';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 카드 뒷면 내부 네온 격자 패턴
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let offset = -cw; offset < cw + ch; offset += 18) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.max(0, offset), cy);
        ctx.lineTo(cx + Math.min(cw, offset + ch), cy + ch);
        ctx.stroke();
      }

      // 중앙 미스터리 물음표 마크
      ctx.fillStyle = '#ffde59';
      ctx.font = 'bold 52px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('?', cx + cw / 2, cy + ch / 2 + 18);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 11px Orbitron';
      ctx.fillText('DOUBLE UP', cx + cw / 2, cy + ch - 18);

    } else if (card) {
      // 앞면 카드 이미지 렌더링
      const img = this.pokerImages[card.key];
      if (img && img.complete) {
        ctx.drawImage(img, cx, cy, cw, ch);
      } else {
        // 이미지 로드 전 백업 렌더러
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, 10);
        ctx.fill();

        ctx.strokeStyle = (card.suit === 'hearts' || card.suit === 'diamonds') ? '#ff0055' : '#000000';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = 'bold 36px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(card.label, cx + cw / 2, cy + ch / 2);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cw, ch, 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================
  // 9. 슬롯 머신 렌더링 (좌측 보드 & 3x3 릴)
  // ==========================================
  renderLeftPanel(ctx) {
    const px = this.leftBoardX;
    const py = this.leftBoardY;
    const pw = this.leftBoardW;
    const ph = this.leftBoardH;

    ctx.fillStyle = '#0a0718';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#ff0077';
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('CHERRY BONUS', px + pw / 2, py + 30);

    ctx.font = '9.5px Pretendard';
    ctx.fillStyle = '#8e86aa';
    ctx.fillText('라인 2개시 5회누적 | 3개시 1회', px + pw / 2, py + 48);

    const gaugeY = py + 62;
    for (let i = 0; i < 5; i++) {
      const lampX = px + 16 + (i % 3) * 44;
      const lampY = gaugeY + Math.floor(i / 3) * 40;
      const isLit = (i < this.cherryBonusCount);

      ctx.beginPath();
      ctx.arc(lampX + 16, lampY + 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? '#ff0055' : '#221122';
      ctx.fill();
      ctx.strokeStyle = isLit ? '#ffffff' : '#442233';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isLit) {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(lampX + 12, lampY + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.fillStyle = '#ffde59';
    ctx.font = 'bold 12px Orbitron';
    ctx.fillText(`GAUGE: [ ${this.cherryBonusCount} / 5 ]`, px + pw / 2, gaugeY + 100);

    ctx.strokeStyle = '#231d3d';
    ctx.beginPath();
    ctx.moveTo(px + 8, gaugeY + 110);
    ctx.lineTo(px + pw - 8, gaugeY + 110);
    ctx.stroke();

    const boxY = gaugeY + 120;
    this.renderMiniBonusBadge(ctx, px + 8, boxY, 'ALL FRUITS', '과일 9칸 → $500+1회', '#ff1744', this.currentBonus?.type === 'ALL_FRUITS');
    this.renderMiniBonusBadge(ctx, px + 8, boxY + 62, 'BELL BONUS', '종 3개 → 5회', '#ffde59', this.currentBonus?.type === 'BELL');
    this.renderMiniBonusBadge(ctx, px + 8, boxY + 124, '1-BAR BONUS', '1-BAR 3개 → 5회', '#00ff88', this.currentBonus?.type === 'BAR');
    this.renderMiniBonusBadge(ctx, px + 8, boxY + 186, '7 / 777 BONUS', '7라인 일치 → 1회', '#ff3366', this.currentBonus?.type === 'SEVEN_TRIPLE');

    const statusY = py + ph - 75;
    ctx.fillStyle = '#140f26';
    ctx.fillRect(px + 8, statusY, pw - 16, 62);
    ctx.strokeStyle = this.currentBonus ? '#ffde59' : '#3d2c5e';
    ctx.strokeRect(px + 8, statusY, pw - 16, 62);

    ctx.fillStyle = this.currentBonus ? '#ffde59' : '#7b7296';
    ctx.font = 'bold 11px Orbitron';
    ctx.fillText(this.currentBonus ? `★ ${this.currentBonus.type} ★` : 'NORMAL PLAY', px + pw / 2, statusY + 24);
    ctx.font = '11px Orbitron';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.currentBonus ? `SPINS: ${this.currentBonus.count} LEFT` : '8 LINES ACTIVE', px + pw / 2, statusY + 48);
  }

  renderMiniBonusBadge(ctx, x, y, title, desc, color, isActive) {
    ctx.fillStyle = isActive ? color : '#140f26';
    ctx.fillRect(x, y, 142, 54);
    ctx.strokeStyle = color;
    ctx.lineWidth = isActive ? 3 : 1;
    ctx.strokeRect(x, y, 142, 54);

    ctx.fillStyle = isActive ? '#000' : color;
    ctx.font = 'bold 10.5px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + 71, y + 22);

    ctx.fillStyle = isActive ? '#111' : '#8f88a8';
    ctx.font = '9.5px Pretendard';
    ctx.fillText(desc, x + 71, y + 41);
  }

  renderPure3x3Reels(ctx) {
    const gx = this.gridX;
    const gy = this.gridY;
    const rw = this.reelW;
    const ch = this.cellH;

    ctx.fillStyle = '#06050e';
    ctx.fillRect(gx, gy, this.gridW, this.gridH);
    ctx.strokeStyle = '#4a3d75';
    ctx.lineWidth = 4;
    ctx.strokeRect(gx, gy, this.gridW, this.gridH);

    this.reels.forEach((reel, col) => {
      const rx = gx + 4 + col * (rw + 2);
      const ry = gy;

      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, this.gridH);
      ctx.clip();

      const reelGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry);
      reelGrad.addColorStop(0, '#f9faff');
      reelGrad.addColorStop(0.08, '#ffffff');
      reelGrad.addColorStop(0.5, '#ffffff');
      reelGrad.addColorStop(0.92, '#ffffff');
      reelGrad.addColorStop(1, '#f7f8fe');
      ctx.fillStyle = reelGrad;
      ctx.fillRect(rx, ry, rw, this.gridH);

      const stripLen = reel.strip.length;
      const offsetInCell = ((reel.position % ch) + ch) % ch;
      const baseIndex = Math.floor(reel.position / ch);

      for (let row = -1; row <= 3; row++) {
        const symY = ry + (row * ch) + offsetInCell;
        const stripIndex = (((baseIndex - row) % stripLen) + stripLen) % stripLen;
        const symName = reel.strip[stripIndex] || SYMBOLS.ORANGE;

        const img = this.images[symName];
        if (img && img.complete) {
          const targetW = 205;
          const targetH = 150;
          const drawX = rx + (rw - targetW) / 2;
          const drawY = symY + (ch - targetH) / 2;

          if (reel.isSpinning && !reel.stopping) {
            ctx.globalAlpha = 0.65;
            ctx.drawImage(img, drawX, drawY - 12, targetW, targetH);
            ctx.drawImage(img, drawX, drawY + 12, targetW, targetH);
            ctx.globalAlpha = 1.0;
          }
          ctx.drawImage(img, drawX, drawY, targetW, targetH);
        }
      }

      ctx.restore();

      ctx.strokeStyle = 'rgba(70, 80, 120, 0.1)';
      ctx.lineWidth = 1.5;
      for (let row = 1; row < 3; row++) {
        ctx.beginPath();
        ctx.moveTo(rx + 6, ry + row * ch);
        ctx.lineTo(rx + rw - 6, ry + row * ch);
        ctx.stroke();
      }

      ctx.strokeStyle = '#352d52';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx, ry, rw, this.gridH);
    });
  }

  renderPaylines(ctx) {
    const gx = this.gridX;
    const gy = this.gridY;
    const rw = this.reelW;
    const ch = this.cellH;

    PAYLINES.forEach(line => {
      const isActive = (line.id <= this.activeLines);
      const isWinning = this.winningLines.some(w => w.id === line.id);

      let badgeX = gx - 16;
      let badgeY = gy + ch / 2;

      if (line.id === 1) { badgeX = gx - 16; badgeY = gy + ch * 1.5; }
      if (line.id === 2) { badgeX = gx - 16; badgeY = gy + ch * 0.5; }
      if (line.id === 3) { badgeX = gx - 16; badgeY = gy + ch * 2.5; }
      if (line.id === 4) { badgeX = gx + rw * 0.5; badgeY = gy - 14; }
      if (line.id === 5) { badgeX = gx + rw * 1.5; badgeY = gy - 14; }
      if (line.id === 6) { badgeX = gx + rw * 2.5; badgeY = gy - 14; }
      if (line.id === 7) { badgeX = gx - 16; badgeY = gy - 14; }
      if (line.id === 8) { badgeX = gx - 16; badgeY = gy + this.gridH + 14; }

      ctx.fillStyle = isWinning ? '#ff0055' : (isActive ? line.color : '#333');
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isWinning || !isActive ? '#fff' : '#000';
      ctx.font = 'bold 11px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(line.id, badgeX, badgeY + 4);
    });

    if (this.winningLines.length > 0) {
      const time = performance.now() * 0.007;
      const pulseWidth = 7 + Math.sin(time) * 3;

      this.winningLines.forEach(wLine => {
        ctx.save();
        ctx.strokeStyle = wLine.color;
        ctx.lineWidth = pulseWidth;
        ctx.shadowColor = wLine.color;
        ctx.shadowBlur = 22;

        const indices = wLine.indices || [];

        indices.forEach(cellIdx => {
          const row = Math.floor(cellIdx / 3);
          const col = cellIdx % 3;
          const bx = gx + col * (rw + 2) + 8;
          const by = gy + row * ch + 8;
          const bw = rw - 16;
          const bh = ch - 16;

          ctx.strokeStyle = wLine.color;
          ctx.lineWidth = 3.5;
          ctx.strokeRect(bx, by, bw, bh);
        });

        if (indices.length >= 2) {
          ctx.lineWidth = pulseWidth;
          ctx.beginPath();
          indices.forEach((cellIdx, idx) => {
            const row = Math.floor(cellIdx / 3);
            const col = cellIdx % 3;
            const cx = gx + col * (rw + 2) + rw / 2;
            const cy = gy + row * ch + ch / 2;

            if (idx === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
          });
          ctx.stroke();
        }

        ctx.restore();
      });
    }
  }

  renderParticles(ctx) {
    this.winParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new CherryMasterGame();
});
