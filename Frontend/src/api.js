export const API_URL = 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}