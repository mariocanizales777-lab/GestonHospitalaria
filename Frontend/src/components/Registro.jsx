import { useState } from 'react';
import { API_URL, guardarSesion } from '../api';
import { useToast } from './Toast';

// Registro público: SIEMPRE crea una cuenta de paciente. Los doctores los da
// de alta un admin desde Admin > Doctores, y solo puede haber un admin nuevo
// si otro admin lo crea (por ahora no hay pantalla para eso, a propósito).
export default function Registro({ onRegistro, onIrALogin }) {
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function crearCuenta(e) {
    e.preventDefault();

    if (!nombre.trim() || !usuario.trim() || !contrasena) {
      toast.error('Completa todos los campos.');
      return;
    }
    if (contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), usuario: usuario.trim(), contrasena }),
    });
    const data = await res.json();
    setEnviando(false);

    if (res.ok) {
      guardarSesion(data.token, data.usuario);
      toast.exito(`Cuenta creada. ¡Bienvenido, ${data.usuario.nombre}!`);
      onRegistro(data.usuario);
    } else {
      toast.error(data.mensaje || 'No se pudo crear la cuenta.');
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={crearCuenta}>
        <h2>Crear cuenta de paciente</h2>
        <label>
          Nombre completo
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
        </label>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        </label>
        <label>
          Confirmar contraseña
          <input type="password" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <button type="button" className="link-btn" onClick={onIrALogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </div>
  );
}
