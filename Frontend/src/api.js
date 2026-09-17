export const API_URL = 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export async function asegurarToken() {
  if (getToken()) return;
  const res = await fetch(`${API_URL}/dev/token`);
  const data = await res.json();
  saveToken(data.token);
}