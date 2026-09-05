import { useState } from 'react';
import Agendar from './components/Agendar';
import MisCitas from './components/MisCitas';

export default function App() {
  const [vista, setVista] = useState('agendar');

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
        <div className="user-badge">Laura Martínez (Paciente Premium)</div>
      </header>

      <main className="container">
        {vista === 'agendar' ? <Agendar /> : <MisCitas />}
      </main>
    </div>
  );
}
