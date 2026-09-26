const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STORAGE_TOKEN_KEY = 'fc_token';
const STORAGE_USUARIO_KEY = 'fc_usuario';

export { API_URL };

export function getUsuarioActual() {
  const raw = localStorage.getItem(STORAGE_USUARIO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function guardarSesion(token, usuario) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify(usuario));
}

export async function entrarComo(rol) {
  const res = await fetch(`${API_URL}/dev/token?rol=${rol}`);
  if (!res.ok) throw new Error('No se pudo iniciar sesión con ese rol');
  const data = await res.json();
  guardarSesion(data.token, data.usuario);
  return data.usuario;
}

export async function asegurarToken() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const usuario = getUsuarioActual();
  if (token && usuario) return token;
  await entrarComo('paciente');
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export async function fetchAutenticado(path, options = {}) {
  let token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) {
    await asegurarToken();
    token = localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  const hacerFetch = (tok) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${tok}`,
      },
    });

  let res = await hacerFetch(token);

  if (res.status === 401) {
    const usuarioActual = getUsuarioActual();
    const rol = usuarioActual?.rol || 'paciente';
    await entrarComo(rol);
    const tokenNuevo = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (tokenNuevo) {
      res = await hacerFetch(tokenNuevo);
    }
  }

  return res;
}