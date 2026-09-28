import { useState } from 'react';
import { getUsuarioActual, cerrarSesionLocal } from './api';
import Login from './components/Login';
import Registro from './components/Registro';
import PacienteHome from './components/PacienteHome';
import DoctorHome from './components/DoctorHome';
import AdminHome from './components/AdminHome';

export default function App() {
  const [usuarioSesion, setUsuarioSesion] = useState(getUsuarioActual());
  const [vista, setVista] = useState('login'); // 'login' | 'registro'

  if (!usuarioSesion) {
    if (vista === 'registro') {
      return <Registro onRegistro={setUsuarioSesion} onIrALogin={() => setVista('login')} />;
    }
    return <Login onLogin={setUsuarioSesion} onIrARegistro={() => setVista('registro')} />;
  }

  function cerrarSesion() {
    cerrarSesionLocal();
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
