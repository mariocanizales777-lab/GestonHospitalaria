import { useState } from 'react';
import { API_URL } from '../api';
import { useToast } from './Toast';

export default function Login({ onLogin }) {
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
      localStorage.setItem('fc_token', data.token);
      localStorage.setItem('fc_usuario', JSON.stringify(data.usuario));
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
        <p className="campo-ayuda">Demo: paciente/1234 · doctor/1234 · admin/1234</p>
      </form>
    </div>
  );
}
