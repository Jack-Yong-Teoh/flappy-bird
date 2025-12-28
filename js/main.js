// --- Global Game State & Config ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const container = document.getElementById("game-container");

// UI Elements
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const scoreHud = document.getElementById("score-hud");
const finalScoreEl = document.getElementById("final-score");
const highScoreEl = document.getElementById("high-score");
const medalDisplay = document.getElementById("medal-display");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const flashOverlay = document.getElementById("flash-overlay");
const barInvincible = document.getElementById("bar-invincible");
const barShrink = document.getElementById("bar-shrink");

let frames = 0;
const DEGREE = Math.PI / 180;
const state = { current: 0, getReady: 0, game: 1, over: 2 };
let scale = 1;

// --- Window Scaling ---
function resize() {
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  scale = canvas.width / 320;
  if (scale > 1.5) scale = 1.5;
}
window.addEventListener("resize", resize);
resize();

// --- Game Logic Controllers ---
function resetGameEngine() {
  state.current = state.getReady;
  pipes.reset();
  bird.reset();
  powerUps.reset();
  clouds.reset();

  score.value = 0;
  scoreHud.innerText = "0";
  frames = 0;
  flashOverlay.style.opacity = 0;

  gameOverScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  scoreHud.classList.add("hidden");

  sounds.swoosh();
}

function startGameAction() {
  initAudio();
  state.current = state.game;
  scoreHud.classList.remove("hidden");
  startScreen.classList.add("hidden");
  bird.flap();
  sounds.jump();
}

function flashScreen() {
  flashOverlay.style.opacity = 0.8;
  setTimeout(() => {
    flashOverlay.style.opacity = 0;
  }, 100);
}

function showGameOver() {
  finalScoreEl.innerText = score.value;
  highScoreEl.innerText = score.high;

  medalDisplay.innerHTML = "";
  if (score.value >= 10) {
    let medal = "🥉";
    let color = "#cd7f32";
    if (score.value >= 20) {
      medal = "🥈";
      color = "#c0c0c0";
    }
    if (score.value >= 30) {
      medal = "🥇";
      color = "#ffd700";
    }
    if (score.value >= 40) {
      medal = "💎";
      color = "#b9f2ff";
    }

    medalDisplay.innerHTML = medal;
    medalDisplay.style.borderColor = color;
    medalDisplay.style.background = "rgba(255,255,255,0.3)";
  }

  scoreHud.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

// --- Input Handling ---
function inputAction(e) {
  if (e.type === "keydown" && e.code !== "Space") return;
  if (e.type === "keydown") e.preventDefault();
  initAudio();

  if (state.current === state.getReady) startGameAction();
  else if (state.current === state.game) {
    bird.flap();
    sounds.jump();
  }
}

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startGameAction();
});
restartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  resetGameEngine();
});
window.addEventListener("keydown", inputAction);
canvas.addEventListener("mousedown", (e) => {
  if (state.current === state.game) inputAction(e);
});
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    if (state.current === state.game) inputAction(e);
  },
  { passive: false }
);

// --- Main Loop ---
function draw() {
  bg.draw();
  clouds.draw();
  pipes.draw();
  powerUps.draw();
  ground.draw();
  bird.draw();
}

function update() {
  bird.update();
  pipes.update();
  powerUps.update();
  clouds.update();
}

function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}

// Init Best Score UI & Start Loop
highScoreEl.innerText = score.high;
loop();
