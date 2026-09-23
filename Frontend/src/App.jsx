import { useEffect, useState } from 'react';
import { asegurarToken, entrarComo } from './api';
import Agendar from './components/Agendar';
import MisCitas from './components/MisCitas';
import Medicamentos from './components/Medicamentos';
import MisRecetas from './components/MisRecetas';
import MiAgenda from './components/MiAgenda';
import Horarios from './components/Horarios';
import Doctores from './components/Doctores';
import Pedidos from './components/Pedidos';

const TABS_POR_ROL = {
  paciente: [
    { id: 'agendar', label: 'Agendar' },
    { id: 'mis-citas', label: 'Mis citas' },
    { id: 'medicamentos', label: 'Medicamentos' },
    { id: 'mis-recetas', label: 'Mis recetas' },
  ],
  doctor: [
    { id: 'mi-agenda', label: 'Mi agenda' },
    { id: 'medicamentos', label: 'Medicamentos' },
  ],
  admin: [
    { id: 'horarios', label: 'Horarios' },
    { id: 'doctores', label: 'Doctores' },
    { id: 'pedidos', label: 'Pedidos' },
  ],
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    asegurarToken().then((u) => {
      setUsuario(u);
      setVista(TABS_POR_ROL[u.rol][0].id);
      setListo(true);
    });
  }, []);

  async function cambiarRol(rol) {
    setListo(false);
    const u = await entrarComo(rol);
    setUsuario(u);
    setVista(TABS_POR_ROL[u.rol][0].id);
    setListo(true);
  }

  if (!listo || !usuario) return <p style={{ padding: 32 }}>Cargando…</p>;

  const tabs = TABS_POR_ROL[usuario.rol];

  return (
    <div className="app">
      <header className="navbar">
        <h2>FarmaCitas <span>Fantásticas</span></h2>
        <nav className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={vista === tab.id ? 'active' : ''}
              onClick={() => setVista(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="user-badge">
          <span className="user-nombre">{usuario.nombre}</span>
          <select value={usuario.rol} onChange={(e) => cambiarRol(e.target.value)}>
            <option value="paciente">Actuar como: Paciente</option>
            <option value="doctor">Actuar como: Doctor</option>
            <option value="admin">Actuar como: Admin</option>
          </select>
        </div>
      </header>

      <main className="container">
        {vista === 'agendar' && <Agendar />}
        {vista === 'mis-citas' && <MisCitas />}
        {vista === 'medicamentos' && <Medicamentos />}
        {vista === 'mis-recetas' && <MisRecetas />}
        {vista === 'mi-agenda' && <MiAgenda />}
        {vista === 'horarios' && <Horarios />}
        {vista === 'doctores' && <Doctores />}
        {vista === 'pedidos' && <Pedidos />}
      </main>
    </div>
  );
}
