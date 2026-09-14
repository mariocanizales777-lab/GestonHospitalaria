import { useEffect, useState } from 'react';
import { asegurarToken } from './api';
import Agendar from './components/Agendar';
import MisCitas from './components/MisCitas';

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
          <button className={vista === 'agendar' ? 'active' : ''} onClick={() => setVista('agendar')}>
            Agendar
          </button>
          <button className={vista === 'mis-citas' ? 'active' : ''} onClick={() => setVista('mis-citas')}>
            Mis citas
          </button>
        </nav>
        <div className="user-badge">Mario Canizales (Paciente Premium)</div>
      </header>

      <main className="container">
        {vista === 'agendar' ? <Agendar /> : <MisCitas />}
      </main>
    </div>
  );
}