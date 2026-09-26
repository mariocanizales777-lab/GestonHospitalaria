import { useState } from 'react';
import NavbarRol from './NavbarRol';
import Horarios from './Horarios';
import Doctores from './Doctores';
import Medicamentos from './Medicamentos';
import Pedidos from './Pedidos';
import Reportes from './Reportes';

const TABS = ['Horarios', 'Doctores', 'Medicamentos', 'Pedidos', 'Reportes'];

export default function AdminHome({ usuario, onCerrarSesion }) {
  const [tabActiva, setTabActiva] = useState(TABS[0]);

  return (
    <>
      <NavbarRol
        titulo="Admin"
        tabs={TABS}
        tabActual={tabActiva}
        onCambiarTab={setTabActiva}
        usuario={usuario}
        onCerrarSesion={onCerrarSesion}
      />

      <div className="container">
        {tabActiva === 'Horarios' && <Horarios />}
        {tabActiva === 'Doctores' && <Doctores />}
        {tabActiva === 'Medicamentos' && <Medicamentos />}
        {tabActiva === 'Pedidos' && <Pedidos />}
        {tabActiva === 'Reportes' && <Reportes />}
      </div>
    </>
  );
}
