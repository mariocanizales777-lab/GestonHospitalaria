import { useState } from 'react';
import NavbarRol from './NavbarRol';
import RecordatorioCitas from './RecordatorioCitas';
import Agendar from './Agendar';
import MisCitas from './MisCitas';
import Medicamentos from './Medicamentos';
import MisRecetas from './MisRecetas';

const TABS = ['Agendar', 'Mis citas', 'Medicamentos', 'Mis recetas'];

export default function PacienteHome({ usuario, onCerrarSesion }) {
  const [tabActiva, setTabActiva] = useState(TABS[0]);

  return (
    <>
      <NavbarRol
        titulo="Paciente"
        tabs={TABS}
        tabActual={tabActiva}
        onCambiarTab={setTabActiva}
        usuario={usuario}
        onCerrarSesion={onCerrarSesion}
      />

      <RecordatorioCitas />

      <div className="container">
        {tabActiva === 'Agendar' && <Agendar />}
        {tabActiva === 'Mis citas' && <MisCitas />}
        {tabActiva === 'Medicamentos' && <Medicamentos />}
        {tabActiva === 'Mis recetas' && <MisRecetas />}
      </div>
    </>
  );
}
