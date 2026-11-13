
import {
  canvas,
  keys,
  mouse,
  gameState,
  updateMousePosition,
  clearInput,
  togglePause,
  startGame,
  showMenu,
  submitPuzzleAnswer,
  skipPuzzle,
  continueAfterPuzzle
} from './game.js';

const $ = (id) => document.getElementById(id);

export function bindGameEvents() {
  document.addEventListener('keydown', (event) => {
    if (
      event.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA'].includes(event.target.tagName)
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    if (
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ']
        .includes(key) &&
      gameState.mode === 'play'
    ) {
      event.preventDefault();
    }

    if (key === 'p' || key === 'escape') {
      if (
        gameState.mode === 'play' ||
        gameState.mode === 'paused'
      ) {
        togglePause();
      }

      return;
    }

    keys[key] = true;
  });

  document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  canvas.addEventListener('mousemove', (event) => {
    updateMousePosition(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousedown', (event) => {
    updateMousePosition(event.clientX, event.clientY);
    mouse.down = true;
  });

  window.addEventListener('mouseup', () => {
    mouse.down = false;
  });

  canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];

    updateMousePosition(touch.clientX, touch.clientY);
    mouse.down = true;

    event.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];

    updateMousePosition(touch.clientX, touch.clientY);
    event.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    mouse.down = false;
  });

  window.addEventListener('blur', () => {
    if (gameState.mode === 'play') {
      togglePause();
    }
  });

  $('startBtn').addEventListener('click', startGame);
  $('againBtn').addEventListener('click', startGame);
  $('dashBtn').addEventListener('click', showMenu);
  $('pauseBtn').addEventListener('click', togglePause);
  $('resumeBtn').addEventListener('click', togglePause);

  $('pzForm').addEventListener('submit', submitPuzzleAnswer);
  $('pzSkip').addEventListener('click', skipPuzzle);
  $('pzCont').addEventListener('click', continueAfterPuzzle);
}
