import { useState } from 'react';
import { getUsuarioActual } from './api';
import Login from './components/Login';
import PacienteHome from './components/PacienteHome';
import DoctorHome from './components/DoctorHome';
import AdminHome from './components/AdminHome';

export default function App() {
  const [usuarioSesion, setUsuarioSesion] = useState(getUsuarioActual());

  if (!usuarioSesion) {
    return <Login onLogin={setUsuarioSesion} />;
  }

  function cerrarSesion() {
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_usuario');
    setUsuarioSesion(null);
  }

  if (usuarioSesion.rol === 'paciente') {
    return <PacienteHome usuario={usuarioSesion} onCerrarSesion={cerrarSesion} />;
  }
  if (usuarioSesion.rol === 'doctor') {
    return <DoctorHome usuario={usuarioSesion} onCerrarSesion={cerrarSesion} />;
  }
  if (usuarioSesion.rol === 'admin') {
    return <AdminHome usuario={usuarioSesion} onCerrarSesion={cerrarSesion} />;
  }

  return <p>Rol desconocido. Cierra sesión e intenta de nuevo.</p>;
}
