export const API_URL = 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUsuarioActual() {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

function guardarSesion(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
}

// "Actuar como": sin login real, pide un token para el usuario demo del rol elegido.
export async function entrarComo(rol) {
  const res = await fetch(`${API_URL}/dev/token?rol=${rol}`);
  if (!res.ok) throw new Error('No se pudo iniciar sesión con ese rol');
  const data = await res.json();
  guardarSesion(data);
  return data.usuario;
}

export async function asegurarToken() {
  const usuario = getUsuarioActual();
  if (getToken() && usuario) return usuario;
  return entrarComo('paciente');
}

// Fetch autenticado centralizado: si el token guardado ya no es válido
// (expiró, o el backend se reinició con otro JWT_SECRET), pide uno nuevo
// automáticamente para el mismo rol y reintenta la petición una sola vez.
export async function fetchAutenticado(path, options = {}) {
  const hacerRequest = (token) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await hacerRequest(getToken());

  if (res.status === 401) {
    const rolActual = getUsuarioActual()?.rol || 'paciente';
    await entrarComo(rolActual);
    res = await hacerRequest(getToken());
  }

  return res;
}
