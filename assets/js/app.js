
import {
  registerPlayer as apiRegister,
  loginPlayer as apiLogin,
  getCurrentPlayer,
  logoutPlayer,
  getLeaderboard
} from './api.js';

import { bindGameEvents } from './events.js';
import { setCurrentPlayer, showMenu } from './game.js';

const $ = (id) => document.getElementById(id);

const FRONTEND_ONLY = true;

let currentPlayer = null;

function showPage(page) {
  document.querySelectorAll('.page').forEach((element) => {
    element.classList.add('hidden');
  });

  $(`${page}Page`).classList.remove('hidden');
}

function route() {
  const requested = (location.hash || '#login').slice(1);

  const page = ['login', 'signup', 'game'].includes(requested)
    ? requested
    : 'login';

  if (page === 'game' && !currentPlayer) {
    location.hash = 'login';
    return;
  }

  if (page !== 'game' && currentPlayer) {
    location.hash = 'game';
    return;
  }

  showPage(page);

  $('loginErr').textContent = '';
  $('signupErr').textContent = '';

  if (page === 'game') {
    refreshLeaderboard();
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const name = $('regName').value.trim();
  const email = $('regEmail').value.trim().toLowerCase();
  const password = $('regPass').value;
  const confirmPassword = $('regPass2').value;
  const message = $('signupErr');

  message.classList.remove('ok');

  if (!name || !email || !password || !confirmPassword) {
    message.textContent = 'Please fill in all fields.';
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = 'The passwords do not match.';
    return;
  }

  try {
    await apiRegister({ name, email, password });

    $('signupForm').reset();
    $('loginEmail').value = email;

    $('loginErr').textContent =
      'Account created successfully. Please log in.';

    $('loginErr').classList.add('ok');
    location.hash = 'login';

  } catch (error) {
    message.textContent = error.message;
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = $('loginEmail').value.trim().toLowerCase();
  const password = $('loginPassword').value;
  const message = $('loginErr');

  message.classList.remove('ok');

  if (!email || !password) {
    message.textContent = 'Enter your email and password.';
    return;
  }

  try {
    const result = await apiLogin({ email, password });

    setPlayer(result.player);
    $('loginForm').reset();

    location.hash = 'game';
    route();

  } catch (error) {
    message.textContent = error.message;
  }
}

function setPlayer(player) {
  currentPlayer = player;

  setCurrentPlayer(player);

  $('hName').textContent = player.name;
  $('pName').textContent = player.name;
}

async function restoreSession() {
  if (FRONTEND_ONLY) {
    setPlayer({ name: 'Demo Player' });
    location.hash = 'game';
    route();
    return;
  }

  try {
    const result = await getCurrentPlayer();

    setPlayer(result.player);
    location.hash = 'game';

  } catch {
    currentPlayer = null;
    setCurrentPlayer(null);
    location.hash = 'login';
  }

  route();
}

async function handleLogout() {
  try {
    await logoutPlayer();

    currentPlayer = null;
    setCurrentPlayer(null);

    showMenu();

    location.hash = 'login';
    route();

  } catch (error) {
    window.alert(error.message);
  }
}

async function refreshLeaderboard() {
  if (!currentPlayer) return;

  try {
    const result = await getLeaderboard();
    const board = $('board');

    board.replaceChildren();

    if (!result.leaderboard.length) {
      const item = document.createElement('li');
      item.textContent = 'No scores yet';
      board.appendChild(item);

    } else {
      result.leaderboard.forEach((player) => {
        const item = document.createElement('li');

        item.textContent =
          `${player.player_name} — ${player.best_score} (W${player.best_wave})`;

        board.appendChild(item);
      });
    }

    $('pBest').textContent = result.personalBest ?? 0;

  } catch (error) {
    console.error('Leaderboard could not load:', error);
  }
}

$('loginForm').addEventListener('submit', handleLogin);
$('signupForm').addEventListener('submit', handleRegister);
$('signOut').addEventListener('click', handleLogout);

window.addEventListener('hashchange', route);
window.addEventListener('scores:updated', refreshLeaderboard);

bindGameEvents();
restoreSession();
