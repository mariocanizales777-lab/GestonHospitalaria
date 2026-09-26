import { useState } from 'react';
import NavbarRol from './NavbarRol';
import MiAgenda from './MiAgenda';
import Medicamentos from './Medicamentos';

const TABS = ['Mi agenda', 'Medicamentos'];

export default function DoctorHome({ usuario, onCerrarSesion }) {
  const [tabActiva, setTabActiva] = useState(TABS[0]);

  return (
    <>
      <NavbarRol
        titulo="Doctor"
        tabs={TABS}
        tabActual={tabActiva}
        onCambiarTab={setTabActiva}
        usuario={usuario}
        onCerrarSesion={onCerrarSesion}
      />

      <div className="container">
        {tabActiva === 'Mi agenda' && <MiAgenda />}
        {tabActiva === 'Medicamentos' && <Medicamentos />}
      </div>
    </>
  );
}
