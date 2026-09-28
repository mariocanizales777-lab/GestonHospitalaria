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

export function guardarSesion(token, usuario) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify(usuario));
}

export function cerrarSesionLocal() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USUARIO_KEY);
}

// Hace un fetch autenticado con el token guardado. Si el token ya no es
// válido (expiró o el backend lo rechaza), cierra la sesión local y recarga
// la página para que la persona vuelva a la pantalla de inicio de sesión.
// Ya no existe un "modo demo" que consiga un token nuevo sin contraseña.
export async function fetchAutenticado(path, options = {}) {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    cerrarSesionLocal();
    window.location.reload();
  }

  return res;
}
