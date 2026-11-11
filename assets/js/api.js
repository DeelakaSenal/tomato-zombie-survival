
// Centralised PHP API client.
// All requests include the PHP session cookie.

export const API_BASE = 'backend/api';

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : {};

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

export const registerPlayer = (payload) =>
  apiRequest('auth/register.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const loginPlayer = (payload) =>
  apiRequest('auth/login.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getCurrentPlayer = () =>
  apiRequest('auth/me.php');

export const logoutPlayer = () =>
  apiRequest('auth/logout.php', {
    method: 'POST'
  });

export const saveGameScore = (payload) =>
  apiRequest('scores/save.php', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getLeaderboard = () =>
  apiRequest('scores/leaderboard.php');
