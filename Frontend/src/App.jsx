import { useEffect, useState } from 'react';
import { asegurarToken } from './api';
import Agendar from './components/Agendar';
import MisCitas from './components/MisCitas';
import Horarios from './components/Horarios';
import Medicamentos from './components/Medicamentos';

export default function App() {
  const [vista, setVista] = useState('agendar');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    asegurarToken().then(() => setListo(true));
  }, []);

  if (!listo) return <p style={{ padding: 32 }}>Cargando…</p>;

  return (
    <div className="app">
      <header className="navbar">
        <h2>FarmaCitas <span>Fantásticas</span></h2>
        <nav className="tabs">
          <button className={vista === 'agendar' ? 'active' : ''} onClick={() => setVista('agendar')}>Agendar</button>
          <button className={vista === 'mis-citas' ? 'active' : ''} onClick={() => setVista('mis-citas')}>Mis citas</button>
          <button className={vista === 'medicamentos' ? 'active' : ''} onClick={() => setVista('medicamentos')}>Medicamentos</button>
          <button className={vista === 'horarios' ? 'active' : ''} onClick={() => setVista('horarios')}>Horarios (Personal)</button>
        </nav>
        <div className="user-badge">Usuario (Premium)</div>
      </header>

      <main className="container">
        {vista === 'agendar' && <Agendar />}
        {vista === 'mis-citas' && <MisCitas />}
        {vista === 'medicamentos' && <Medicamentos />}
        {vista === 'horarios' && <Horarios />}
      </main>
    </div>
  );
}