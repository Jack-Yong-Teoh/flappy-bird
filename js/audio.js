const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let audioInitialized = false;

function initAudio() {
  if (!audioInitialized && audioCtx.state === "suspended") {
    audioCtx.resume().then(() => {
      audioInitialized = true;
    });
  }
}

const sounds = {
  jump: () => playTone(350, "square", 0.1, -12, 0),
  score: () => playTone(1200, "sine", 0.1, -18, 0),
  hit: () => playTone(150, "sawtooth", 0.05, -5, 0),
  die: () => playTone(100, "sawtooth", 0.2, -5, 0.1),
  swoosh: () => playTone(600, "triangle", 0.1, -15, 0),
  powerup: () => playTone(600, "sine", 0.3, -10, 0, "slide"),
};

function playTone(freq, type, duration, vol, delay, effect) {
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);

  if (effect === "slide") {
    osc.frequency.exponentialRampToValueAtTime(freq + 600, t + 0.3);
  } else if (type === "square") {
    osc.frequency.exponentialRampToValueAtTime(freq + 200, t + 0.1);
  }

  gain.gain.setValueAtTime(Math.pow(10, vol / 20), t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(t);
  osc.stop(t + duration);
}
