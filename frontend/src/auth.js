export function saveTokens({ accessToken, refreshToken, user }) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
}
export function getAccessToken() { return localStorage.getItem('accessToken'); }
export function getRefreshToken() { return localStorage.getItem('refreshToken'); }
export function getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
export function clearAuth() { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user'); }
