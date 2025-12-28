const bg = {
  draw: function () {
    const w = canvas.width;
    const h = canvas.height;
    const groundY = h - ground.h * scale;

    let grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#4fc3f7");
    grad.addColorStop(1, "#2980b9");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    let scrollSpeed = 0.5 * scale;
    let totalScroll = state.current == state.game ? frames * scrollSpeed : 0;

    ctx.fillStyle = "#8bc34a";
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let i = 0; i <= w; i += 5 * scale) {
      let worldX = i + totalScroll * 0.5;
      let hillY = groundY - 150 * scale - Math.sin(worldX * 0.005) * 30 * scale;
      ctx.lineTo(i, hillY);
    }
    ctx.lineTo(w, groundY);
    ctx.lineTo(0, groundY);
    ctx.fill();

    let bStep = 40 * scale;
    let bOffset = totalScroll % bStep;
    ctx.fillStyle = "#aed581";
    for (let i = -bOffset - bStep; i < w; i += bStep) {
      let worldX = i + totalScroll;
      let bIndex = Math.floor(worldX / bStep);
      let bh = 50 * scale + Math.abs(Math.sin(bIndex * 123.45)) * 70 * scale;
      if (bh < 30 * scale) bh = 30 * scale;
      let by = groundY - bh;
      ctx.fillRect(i, by, bStep - 5 * scale, bh);
      ctx.fillStyle = "#dcedc8";
      let winRow = 0;
      for (
        let wy = by + 8 * scale;
        wy < groundY - 8 * scale;
        wy += 12 * scale
      ) {
        winRow++;
        if ((bIndex * 13 + winRow * 7) % 4 === 0) {
          ctx.fillRect(i + 5 * scale, wy, 6 * scale, 6 * scale);
          ctx.fillRect(i + 18 * scale, wy, 6 * scale, 6 * scale);
        }
      }
      ctx.fillStyle = "#aed581";
    }
  },
};

const clouds = {
  items: [],
  update: function () {
    this.items.forEach((c) => (c.x -= 0.5 * scale));
    this.items = this.items.filter((c) => c.x + c.w > -50);
    if (frames % 150 === 0) {
      this.items.push({
        x: canvas.width,
        y: Math.random() * (canvas.height / 2),
        w: 60 * scale + Math.random() * 40 * scale,
      });
    }
  },
  draw: function () {
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.items.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.w / 3, 0, Math.PI * 2);
      ctx.arc(c.x + c.w / 4, c.y - c.w / 4, c.w / 2.5, 0, Math.PI * 2);
      ctx.arc(c.x + c.w / 2, c.y, c.w / 3, 0, Math.PI * 2);
      ctx.fill();
    });
  },
  reset: function () {
    this.items = [];
  },
};

const ground = {
  h: 90,
  draw: function () {
    const h = this.h * scale;
    const y = canvas.height - h;
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, y, canvas.width, h);
    ctx.fillStyle = "#d0c874";
    for (let i = 0; i < canvas.width; i += 10 * scale) {
      if (i % 3 == 0) ctx.fillRect(i, y + 10 * scale, 4 * scale, 4 * scale);
      if (i % 7 == 0) ctx.fillRect(i, y + 30 * scale, 4 * scale, 4 * scale);
    }
    const stripeW = 20 * scale;
    let offset =
      state.current == state.game || state.current == state.getReady
        ? (frames * (2.0 * scale)) % stripeW
        : 0;
    ctx.fillStyle = "#73bf2e";
    ctx.fillRect(0, y, canvas.width, 15 * scale);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.lineWidth = 3 * scale;
    ctx.strokeStyle = "#558c22";
    ctx.stroke();
    ctx.fillStyle = "#558c22";
    for (let i = -1; i < canvas.width / stripeW + 1; i++) {
      let gx = i * stripeW - offset;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + 12 * scale, y);
      ctx.lineTo(gx + 4 * scale, y + 15 * scale);
      ctx.lineTo(gx - 8 * scale, y + 15 * scale);
      ctx.fill();
    }
  },
};

const bird = {
  animation: [0, 1, 2, 1],
  x: 50,
  y: 150,
  speed: 0,
  gravity: 0.18,
  jump: 3.6,
  rotation: 0,
  radius: 12,
  frame: 0,
  powers: { invincible: 0, shrink: 0 },

  draw: function () {
    let birdX = this.x * scale;
    let birdY = this.y;
    let scaleMult = this.powers.shrink > 0 ? 0.6 : 1.0;
    let size = this.radius * 2.4 * scale * scaleMult;

    ctx.save();
    ctx.translate(birdX, birdY);
    if (this.powers.invincible > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, size / 1.5 + 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${
        Math.abs(Math.sin(frames / 5)) + 0.3
      })`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 255, 200, 0.2)`;
      ctx.fill();
    }
    ctx.rotate(this.rotation);
    let grad = ctx.createRadialGradient(
      -size / 6,
      -size / 6,
      size / 10,
      0,
      0,
      size / 2
    );
    grad.addColorStop(0, "#ffd54f");
    grad.addColorStop(1, "#f57f17");
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 4, -size / 4, size / 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 3, -size / 4, size / 10, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.beginPath();
    const wingY =
      this.animation[this.frame] === 1
        ? 0
        : this.animation[this.frame] === 0
        ? -4
        : 4;
    ctx.ellipse(
      -size / 8,
      size / 8 + wingY,
      size / 2.2,
      size / 3.5,
      -0.2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2.5, size / 6, size / 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff5722";
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    this.updateUI();
  },

  updateUI: function () {
    if (this.powers.invincible > 0) {
      barInvincible.style.display = "block";
      barInvincible.querySelector("div").style.width =
        (this.powers.invincible / 300) * 100 + "%";
    } else {
      barInvincible.style.display = "none";
    }

    if (this.powers.shrink > 0) {
      barShrink.style.display = "block";
      barShrink.querySelector("div").style.width =
        (this.powers.shrink / 480) * 100 + "%";
    } else {
      barShrink.style.display = "none";
    }
  },

  flap: function () {
    let jumpForce = this.jump;
    if (this.powers.shrink > 0) jumpForce *= 0.85;
    this.speed = -jumpForce * scale;
    this.rotation = -25 * DEGREE;
  },

  update: function () {
    if (this.powers.invincible > 0) this.powers.invincible--;
    if (this.powers.shrink > 0) this.powers.shrink--;
    const period = state.current == state.getReady ? 10 : 5;
    this.frame += frames % period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (state.current == state.getReady) {
      this.y = canvas.height / 2 - 50 * scale;
      this.y += Math.cos(frames / 15) * 4 * scale;
      this.x = canvas.width / 2 - 15 * scale;
      this.rotation = 0;
    } else {
      this.x = canvas.width / 3;
      this.speed += this.gravity * scale;
      this.y += this.speed;
      if (this.speed < (this.jump / 2) * scale) this.rotation = -25 * DEGREE;
      else {
        this.rotation += 2 * DEGREE;
        this.rotation = Math.min(this.rotation, 90 * DEGREE);
      }
      if (this.y + this.radius * scale >= canvas.height - ground.h * scale)
        this.die();
      if (this.y < 0) {
        this.y = 0;
        this.speed = 0;
      }
    }
  },

  die: function () {
    if (state.current == state.game) {
      state.current = state.over;
      sounds.hit();
      setTimeout(sounds.die, 300);
      flashScreen();
      showGameOver();
    }
  },

  reset: function () {
    this.speed = 0;
    this.rotation = 0;
    this.y = 150;
    this.powers.invincible = 0;
    this.powers.shrink = 0;
  },
};

const pipes = {
  position: [],
  w: 52,
  dx: 2.0,
  gap: 125,
  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topY = p.y;
      let bottomY = p.y + this.gap * scale;
      let pX = p.x;
      let pW = this.w * scale;
      let pipeGrad = ctx.createLinearGradient(pX, 0, pX + pW, 0);
      pipeGrad.addColorStop(0, "#2e7d32");
      pipeGrad.addColorStop(0.2, "#43a047");
      pipeGrad.addColorStop(0.5, "#81c784");
      pipeGrad.addColorStop(1, "#1b5e20");
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";

      let capH = 24 * scale;
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(pX, 0, pW, topY - capH);
      ctx.strokeRect(pX, -2, pW, topY - capH + 2);
      ctx.fillRect(pX - 2 * scale, topY - capH, pW + 4 * scale, capH);
      ctx.strokeRect(pX - 2 * scale, topY - capH, pW + 4 * scale, capH);

      ctx.fillRect(pX - 2 * scale, bottomY, pW + 4 * scale, capH);
      ctx.strokeRect(pX - 2 * scale, bottomY, pW + 4 * scale, capH);
      let bodyH = canvas.height - (bottomY + capH) - ground.h * scale;
      ctx.fillRect(pX, bottomY + capH, pW, bodyH);
      ctx.strokeRect(pX, bottomY + capH, pW, bodyH + 2);
    }
  },
  update: function () {
    if (state.current !== state.game) return;
    if (frames % 110 == 0) {
      const groundY = canvas.height - ground.h * scale;
      const posY =
        Math.random() * (groundY - this.gap * scale - 80 * scale) + 40 * scale;
      this.position.push({ x: canvas.width, y: posY, passed: false });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx * scale;
      let birdRad =
        (bird.powers.shrink > 0 ? bird.radius * 0.6 : bird.radius - 4) * scale;
      if (bird.powers.invincible === 0) {
        if (bird.x + birdRad > p.x && bird.x - birdRad < p.x + this.w * scale) {
          if (
            bird.y - birdRad < p.y ||
            bird.y + birdRad > p.y + this.gap * scale
          )
            bird.die();
        }
      }
      if (p.x + this.w * scale < bird.x && !p.passed) {
        score.value += 1;
        scoreHud.innerText = score.value;
        p.passed = true;
        sounds.score();
        score.high = Math.max(score.value, score.high);
        localStorage.setItem("flappy_highscore", score.high);
      }
      if (p.x + this.w * scale <= 0) {
        this.position.shift();
        i--;
      }
    }
  },
  reset: function () {
    this.position = [];
  },
};

const powerUps = {
  items: [],
  draw: function () {
    for (let p of this.items) {
      let sz = 20 * scale;
      ctx.save();
      ctx.translate(p.x + sz / 2, p.y + sz / 2 + Math.sin(frames / 10) * 5);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      if (p.type === 0) {
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(
            Math.cos((18 + j * 72) * DEGREE) * sz,
            -Math.sin((18 + j * 72) * DEGREE) * sz
          );
          ctx.lineTo(
            (Math.cos((54 + j * 72) * DEGREE) * sz) / 2,
            (-Math.sin((54 + j * 72) * DEGREE) * sz) / 2
          );
        }
        ctx.closePath();
        ctx.fillStyle = "#ffd700";
        ctx.fill();
      } else {
        ctx.fillStyle = "#0066cc";
        ctx.beginPath();
        ctx.arc(0, 0, sz / 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  update: function () {
    if (state.current !== state.game) return;
    if (frames % 300 === 150 && Math.random() > 0.3) {
      this.items.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 300) + 100,
        type: Math.random() > 0.5 ? 0 : 1,
      });
    }
    for (let i = 0; i < this.items.length; i++) {
      let p = this.items[i];
      p.x -= pipes.dx * scale;
      if (
        Math.abs(bird.x - p.x) < 30 * scale &&
        Math.abs(bird.y - p.y) < 30 * scale
      ) {
        sounds.powerup();
        if (p.type === 0) bird.powers.invincible = 300;
        else bird.powers.shrink = 480;
        this.items.splice(i, 1);
        i--;
        continue;
      }
      if (p.x < -50) {
        this.items.splice(i, 1);
        i--;
      }
    }
  },
  reset: function () {
    this.items = [];
  },
};

const score = {
  high: parseInt(localStorage.getItem("flappy_highscore")) || 0,
  value: 0,
};
