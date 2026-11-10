
import { getPuzzle } from './puzzles.js';
import { saveGameScore } from './api.js';

export const canvas = document.getElementById('cv');
const ctx = canvas.getContext('2d');

export const WIDTH = canvas.width;
export const HEIGHT = canvas.height;

export const keys = Object.create(null);

export const mouse = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  down: false
};

export let currentPlayer = null;

export function setCurrentPlayer(player) {
  currentPlayer = player;
}

const $ = (id) => document.getElementById(id);

const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

const distance = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const START_LIVES = 3;
const MAX_LIVES = 5;

const overlays = [
  'menuOv',
  'pauseOv',
  'puzzleOv',
  'overOv'
];

export const gameState = {
  mode: 'menu',
  player: null,
  bullets: [],
  zombies: [],
  particles: [],
  score: 0,
  kills: 0,
  wave: 1,
  lives: START_LIVES,
  invulnerability: 0,
  cooldown: 0,
  spawnTimer: 1,
  shake: 0,
  banner: 0,
  elapsed: 0,
  puzzle: null,
  saving: false
};

function showOverlay(id) {
  overlays.forEach((overlay) => {
    $(overlay).classList.toggle('hidden', overlay !== id);
  });
}

function hideOverlays() {
  overlays.forEach((id) => {
    $(id).classList.add('hidden');
  });
}

export function clearInput() {
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });

  mouse.down = false;
}

function updateHud() {
  $('hScore').textContent = gameState.score;
  $('pScore').textContent = gameState.score;
  $('hWave').textContent = gameState.wave;
  $('hKills').textContent = gameState.kills;

  $('hLives').textContent =
    '♥'.repeat(Math.max(0, gameState.lives)) +
    '♡'.repeat(Math.max(0, START_LIVES - gameState.lives));
}

export function updateMousePosition(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = (clientX - rect.left) * WIDTH / rect.width;
  mouse.y = (clientY - rect.top) * HEIGHT / rect.height;
}

export function showMenu() {
  gameState.mode = 'menu';
  gameState.player = null;
  gameState.score = 0;
  gameState.kills = 0;
  gameState.wave = 1;
  gameState.lives = START_LIVES;

  clearInput();
  updateHud();
  showOverlay('menuOv');

  $('pauseBtn').textContent = '⏸ Pause';
}

export function startGame() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  clearInput();

  Object.assign(gameState, {
    mode: 'play',
    player: {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      r: 16
    },
    bullets: [],
    zombies: [],
    particles: [],
    score: 0,
    kills: 0,
    wave: 1,
    lives: START_LIVES,
    invulnerability: 0,
    cooldown: 0,
    spawnTimer: 1,
    shake: 0,
    banner: 1.6,
    elapsed: 0,
    puzzle: null,
    saving: false
  });

  hideOverlays();
  updateHud();
}

export function togglePause() {
  if (gameState.mode === 'play') {
    gameState.mode = 'paused';
    clearInput();
    showOverlay('pauseOv');
    $('pauseBtn').textContent = '▶ Resume';

  } else if (gameState.mode === 'paused') {
    gameState.mode = 'play';
    hideOverlays();
    $('pauseBtn').textContent = '⏸ Pause';
  }
}

function burst(x, y, colour, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 160;

    gameState.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: .4 + Math.random() * .3,
      colour
    });
  }
}

function shoot() {
  const p = gameState.player;

  const angle = Math.atan2(
    mouse.y - p.y,
    mouse.x - p.x
  );

  gameState.cooldown = .17;

  gameState.bullets.push({
    x: p.x + Math.cos(angle) * 26,
    y: p.y + Math.sin(angle) * 26,
    vx: Math.cos(angle) * 620,
    vy: Math.sin(angle) * 620
  });

  burst(
    p.x + Math.cos(angle) * 28,
    p.y + Math.sin(angle) * 28,
    '#ffe66d',
    3
  );
}

function spawnZombie() {
  const side = Math.floor(Math.random() * 4);
  const margin = 24;

  let x;
  let y;

  if (side === 0) {
    x = Math.random() * WIDTH;
    y = -margin;
  } else if (side === 1) {
    x = WIDTH + margin;
    y = Math.random() * HEIGHT;
  } else if (side === 2) {
    x = Math.random() * WIDTH;
    y = HEIGHT + margin;
  } else {
    x = -margin;
    y = Math.random() * HEIGHT;
  }

  const big =
    gameState.wave >= 3 && Math.random() < .2;

  gameState.zombies.push({
    x,
    y,
    r: big ? 20 : 15,
    hp: big ? 2 : 1,
    speed:
      (big ? .75 : 1) *
      (50 + gameState.wave * 9 + Math.random() * 20),
    wobble: Math.random() * 6,
    angle: 0,
    big
  });
}

async function openPuzzle() {
  gameState.mode = 'puzzle';
  clearInput();
  showOverlay('puzzleOv');

  $('pzLives').textContent =
    gameState.lives > 0
      ? `You have ${gameState.lives} ${gameState.lives === 1 ? 'life' : 'lives'} left.`
      : 'Last chance — no lives left!';

  $('pzLoad').classList.remove('hidden');
  $('pzBody').classList.add('hidden');

  try {
    const puzzle = await getPuzzle();

    gameState.puzzle = puzzle;

    $('pzEq').textContent = puzzle.question;
    $('pzSrc').textContent = `Source: ${puzzle.source}`;

    $('pzIn').value = '';
    $('pzIn').disabled = false;

    $('pzMsg').textContent = '';
    $('pzMsg').className = 'msg';

    $('pzSubmit').classList.remove('hidden');
    $('pzSkip').classList.remove('hidden');
    $('pzCont').classList.add('hidden');

  } catch (error) {
    console.error(error);

    gameState.puzzle = null;

    $('pzEq').textContent = 'Puzzle unavailable';
    $('pzSrc').textContent = 'Please skip and continue.';

    $('pzSubmit').classList.add('hidden');
    $('pzSkip').classList.remove('hidden');
  }

  $('pzLoad').classList.add('hidden');
  $('pzBody').classList.remove('hidden');
}

function finishPuzzle() {
  $('pzIn').disabled = true;

  $('pzSubmit').classList.add('hidden');
  $('pzSkip').classList.add('hidden');

  $('pzCont').textContent =
    gameState.lives <= 0
      ? 'See results →'
      : 'Continue →';

  $('pzCont').classList.remove('hidden');
}

export function submitPuzzleAnswer(event) {
  event.preventDefault();

  const value = $('pzIn').value;

  if (value === '' || !gameState.puzzle) {
    return;
  }

  if (Number(value) === gameState.puzzle.answer) {
    gameState.lives = Math.min(
      MAX_LIVES,
      gameState.lives + 1
    );

    gameState.score += 50;

    $('pzMsg').textContent =
      '✓ Correct! +1 life and +50 bonus score';

    $('pzMsg').className = 'msg good';

  } else {
    $('pzMsg').textContent =
      `✗ Incorrect — the answer was ${gameState.puzzle.answer}. No extra life.`;

    $('pzMsg').className = 'msg bad';
  }

  updateHud();
  finishPuzzle();
}

export function skipPuzzle() {
  continueAfterPuzzle();
}

export function continueAfterPuzzle() {
  if (gameState.lives <= 0) {
    endGame();
    return;
  }

  for (const zombie of gameState.zombies) {
    const d = distance(zombie, gameState.player);

    if (d < 150) {
      const angle = Math.atan2(
        zombie.y - gameState.player.y,
        zombie.x - gameState.player.x
      );

      zombie.x =
        gameState.player.x + Math.cos(angle) * 150;

      zombie.y =
        gameState.player.y + Math.sin(angle) * 150;
    }
  }

  gameState.invulnerability = 2;
  gameState.mode = 'play';

  hideOverlays();
  updateHud();
}

async function endGame() {
  if (gameState.mode === 'over' || gameState.saving) {
    return;
  }

  gameState.mode = 'over';
  clearInput();

  $('goScore').textContent = gameState.score;
  $('goWave').textContent = gameState.wave;
  $('goKills').textContent = gameState.kills;

  showOverlay('overOv');

  if (!currentPlayer) {
    return;
  }

  gameState.saving = true;

  try {
    await saveGameScore({
      score: gameState.score,
      kills: gameState.kills,
      wave: gameState.wave
    });

    window.dispatchEvent(
      new CustomEvent('scores:updated')
    );

  } catch (error) {
    console.error('Score could not be saved:', error);

    window.dispatchEvent(
      new CustomEvent('scores:error', {
        detail: error.message
      })
    );

  } finally {
    gameState.saving = false;
  }
}

function update(dt) {
  const p = gameState.player;

  gameState.elapsed += dt;

  const dx =
    (keys.d || keys.arrowright ? 1 : 0) -
    (keys.a || keys.arrowleft ? 1 : 0);

  const dy =
    (keys.s || keys.arrowdown ? 1 : 0) -
    (keys.w || keys.arrowup ? 1 : 0);

  if (dx || dy) {
    const length = Math.hypot(dx, dy);

    p.x += dx / length * 230 * dt;
    p.y += dy / length * 230 * dt;
  }

  p.x = clamp(p.x, p.r, WIDTH - p.r);
  p.y = clamp(p.y, p.r, HEIGHT - p.r);

  gameState.cooldown -= dt;
  gameState.invulnerability -= dt;
  gameState.banner -= dt;

  gameState.shake = Math.max(
    0,
    gameState.shake - dt * 40
  );

  if (
    (mouse.down || keys[' ']) &&
    gameState.cooldown <= 0
  ) {
    shoot();
  }

  for (const bullet of gameState.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
  }

  gameState.spawnTimer -= dt;

  if (gameState.spawnTimer <= 0) {
    gameState.spawnTimer = (
      spawnZombie(),
      Math.max(.28, 1.3 - gameState.wave * .1)
    );
  }

  for (const zombie of gameState.zombies) {
    zombie.angle = Math.atan2(
      p.y - zombie.y,
      p.x - zombie.x
    );

    zombie.x +=
      Math.cos(zombie.angle) * zombie.speed * dt;

    zombie.y +=
      Math.sin(zombie.angle) * zombie.speed * dt;

    zombie.wobble += dt * 8;

    for (const bullet of gameState.bullets) {
      if (bullet.dead || zombie.dead) {
        continue;
      }

      if (distance(bullet, zombie) < zombie.r + 4) {
        bullet.dead = true;

        burst(
          bullet.x,
          bullet.y,
          '#b6ff7a',
          6
        );

        zombie.hp--;

        if (zombie.hp <= 0) {
          zombie.dead = true;

          gameState.score += zombie.big ? 25 : 10;
          gameState.kills++;

          burst(
            zombie.x,
            zombie.y,
            '#7bd957',
            16
          );

          const nextWave =
            1 + Math.floor(gameState.kills / 8);

          if (nextWave > gameState.wave) {
            gameState.wave = nextWave;
            gameState.banner = 1.6;
          }

          updateHud();
        }
      }
    }

    if (
      !zombie.dead &&
      gameState.invulnerability <= 0 &&
      distance(zombie, p) < zombie.r + p.r - 4
    ) {
      gameState.lives--;
      gameState.invulnerability = 2;
      gameState.shake = 12;

      burst(
        p.x,
        p.y,
        '#ff5b5b',
        20
      );

      updateHud();
      openPuzzle();
      break;
    }
  }

  gameState.bullets = gameState.bullets.filter(
    (b) =>
      !b.dead &&
      b.x > -12 &&
      b.x < WIDTH + 12 &&
      b.y > -12 &&
      b.y < HEIGHT + 12
  );

  gameState.zombies = gameState.zombies.filter(
    (z) => !z.dead
  );

  for (const particle of gameState.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  }

  gameState.particles = gameState.particles.filter(
    (particle) => particle.life > 0
  );
}

// Create the game background once.
const background = document.createElement('canvas');

background.width = WIDTH;
background.height = HEIGHT;

(function createBackground() {
  const c = background.getContext('2d');

  let seed = 7;

  const random = () => {
    seed = seed * 16807 % 2147483647;
    return seed / 2147483647;
  };

  const gradient = c.createRadialGradient(
    WIDTH / 2,
    HEIGHT / 2,
    60,
    WIDTH / 2,
    HEIGHT / 2,
    520
  );

  gradient.addColorStop(0, '#244529');
  gradient.addColorStop(1, '#0a140e');

  c.fillStyle = gradient;
  c.fillRect(0, 0, WIDTH, HEIGHT);

  c.fillStyle = 'rgba(80,58,34,.35)';
  c.beginPath();

  c.ellipse(
    WIDTH / 2,
    HEIGHT / 2,
    170,
    105,
    0,
    0,
    Math.PI * 2
  );

  c.fill();

  for (let i = 0; i < 280; i++) {
    c.strokeStyle =
      `rgba(100,175,95,${.1 + random() * .25})`;

    const x = random() * WIDTH;
    const y = random() * HEIGHT;

    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 2, y - 6);
    c.moveTo(x, y);
    c.lineTo(x + 3, y - 5);
    c.stroke();
  }

  for (let i = 0; i < 24; i++) {
    const edge = i % 4;

    let x = random() * WIDTH;
    let y = random() * HEIGHT;

    if (edge === 0) {
      y = random() * 26;
    } else if (edge === 1) {
      y = HEIGHT - random() * 26;
    } else if (edge === 2) {
      x = random() * 26;
    } else {
      x = WIDTH - random() * 26;
    }

    const size = 20 + random() * 14;

    c.fillStyle = '#3b2a1a';
    c.fillRect(x - 4, y, 8, size);

    c.fillStyle = '#12301c';
    c.beginPath();
    c.arc(x, y, size, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#1a4527';
    c.beginPath();
    c.arc(x - 4, y - 4, size * .6, 0, Math.PI * 2);
    c.fill();
  }
})();

function drawZombie(z) {
  ctx.save();
  ctx.translate(z.x, z.y);

  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();

  ctx.ellipse(
    0,
    z.r * .8,
    z.r,
    z.r * .4,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.rotate(z.angle);

  const sway = Math.sin(z.wobble) * 3;

  ctx.fillStyle = z.big ? '#4f8f45' : '#78c75f';

  ctx.fillRect(
    z.r * .4,
    -z.r * .9 + sway,
    z.r * 1.1,
    6
  );

  ctx.fillRect(
    z.r * .4,
    z.r * .9 - 6 - sway,
    z.r * 1.1,
    6
  );

  ctx.beginPath();
  ctx.arc(0, 0, z.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2f5a2a';
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.beginPath();

  ctx.arc(
    z.r * .4,
    -z.r * .35,
    z.r * .25,
    0,
    Math.PI * 2
  );

  ctx.arc(
    z.r * .4,
    z.r * .35,
    z.r * .25,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle = '#d00';
  ctx.beginPath();

  ctx.arc(
    z.r * .5,
    -z.r * .35,
    z.r * .11,
    0,
    Math.PI * 2
  );

  ctx.arc(
    z.r * .5,
    z.r * .35,
    z.r * .11,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

function drawPlayer(p) {
  const angle = Math.atan2(
    mouse.y - p.y,
    mouse.x - p.x
  );

  if (
    gameState.invulnerability > 0 &&
    Math.floor(gameState.elapsed * 12) % 2
  ) {
    ctx.globalAlpha = .35;
  }

  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath();

  ctx.ellipse(
    p.x,
    p.y + p.r * .85,
    p.r,
    p.r * .4,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);

  ctx.fillStyle = '#444';
  ctx.fillRect(8, -4, 24, 8);

  ctx.fillStyle = '#222';
  ctx.fillRect(28, -5, 5, 10);

  ctx.restore();

  const gradient = ctx.createRadialGradient(
    p.x - 5,
    p.y - 6,
    2,
    p.x,
    p.y,
    p.r
  );

  gradient.addColorStop(0, '#ff8a80');
  gradient.addColorStop(1, '#e0262a');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8c1014';
  ctx.stroke();

  ctx.fillStyle = '#3fae4a';

  for (let i = 0; i < 5; i++) {
    const t = i / 5 * Math.PI * 2;

    ctx.beginPath();

    ctx.ellipse(
      p.x + Math.cos(t) * 5,
      p.y - p.r + 3 + Math.sin(t) * 3,
      6,
      2.5,
      t,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.fillStyle = '#fff';
  ctx.beginPath();

  ctx.arc(
    p.x + Math.cos(angle) * 5 - 3,
    p.y + Math.sin(angle) * 5 - 2,
    3.6,
    0,
    Math.PI * 2
  );

  ctx.arc(
    p.x + Math.cos(angle) * 5 + 5,
    p.y + Math.sin(angle) * 5 - 2,
    3.6,
    0,
    Math.PI * 2
  );

  ctx.fill();
  ctx.globalAlpha = 1;
}

function render() {
  ctx.save();

  if (gameState.shake > 0) {
    ctx.translate(
      (Math.random() - .5) * gameState.shake,
      (Math.random() - .5) * gameState.shake
    );
  }

  ctx.drawImage(background, 0, 0);

  if (gameState.player) {
    gameState.zombies.forEach(drawZombie);

    ctx.shadowColor = '#ffe66d';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff3a0';

    for (const bullet of gameState.bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    drawPlayer(gameState.player);

    for (const particle of gameState.particles) {
      ctx.globalAlpha = clamp(particle.life * 2.5, 0, 1);
      ctx.fillStyle = particle.colour;

      ctx.fillRect(
        particle.x - 2,
        particle.y - 2,
        4,
        4
      );
    }

    ctx.globalAlpha = 1;
  }

  ctx.restore();

  const vignette = ctx.createRadialGradient(
    WIDTH / 2,
    HEIGHT / 2,
    HEIGHT * .35,
    WIDTH / 2,
    HEIGHT / 2,
    WIDTH * .65
  );

  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.55)');

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (gameState.player && gameState.banner > 0) {
    ctx.globalAlpha = clamp(gameState.banner, 0, 1);
    ctx.fillStyle = '#ffd166';
    ctx.font = '800 44px system-ui';
    ctx.textAlign = 'center';

    ctx.fillText(
      `WAVE ${gameState.wave}`,
      WIDTH / 2,
      90
    );

    ctx.globalAlpha = 1;
  }

  if (gameState.mode === 'play') {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      9,
      0,
      Math.PI * 2
    );

    ctx.moveTo(mouse.x - 14, mouse.y);
    ctx.lineTo(mouse.x - 5, mouse.y);

    ctx.moveTo(mouse.x + 5, mouse.y);
    ctx.lineTo(mouse.x + 14, mouse.y);

    ctx.moveTo(mouse.x, mouse.y - 14);
    ctx.lineTo(mouse.x, mouse.y - 5);

    ctx.moveTo(mouse.x, mouse.y + 5);
    ctx.lineTo(mouse.x, mouse.y + 14);

    ctx.stroke();
  }
}

let previousFrame = performance.now();

function gameLoop(now) {
  const dt = Math.min(
    .05,
    (now - previousFrame) / 1000
  );

  previousFrame = now;

  if (gameState.mode === 'play') {
    update(dt);
  }

  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
