import { useState } from 'react';
import { API_URL, guardarSesion } from '../api';
import { useToast } from './Toast';

export default function Login({ onLogin, onIrARegistro }) {
  const toast = useToast();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(e) {
    e.preventDefault();
    if (!usuario.trim() || !contrasena) {
      toast.error('Completa usuario y contraseña.');
      return;
    }

    setEnviando(true);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario.trim(), contrasena }),
    });
    const data = await res.json();
    setEnviando(false);

    if (res.ok) {
      guardarSesion(data.token, data.usuario);
      onLogin(data.usuario);
    } else {
      toast.error(data.mensaje || 'No se pudo iniciar sesión.');
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={iniciarSesion}>
        <h2>FarmaCitas Fantásticas</h2>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <button type="button" className="link-btn" onClick={onIrARegistro}>
          ¿No tienes cuenta? Regístrate como paciente
        </button>
      </form>
    </div>
  );
}
