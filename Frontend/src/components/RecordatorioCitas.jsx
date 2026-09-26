import { useEffect, useState } from 'react';
import { fetchAutenticado, getUsuarioActual } from '../api';

function horasHasta(cita) {
  if (!cita.horario) return Infinity;
  const fechaHora = new Date(`${cita.horario.fecha.slice(0, 10)}T${cita.horario.hora}:00Z`);
  return (fechaHora.getTime() - Date.now()) / (1000 * 60 * 60);
}

export default function RecordatorioCitas() {
  const [proximas, setProximas] = useState([]);
  const usuario = getUsuarioActual();

  async function cargar() {
    if (usuario?.rol !== 'paciente') return;
    const res = await fetchAutenticado('/citas/mias');
    if (!res.ok) return;
    const citas = await res.json();
    const dentroDe24h = citas.filter((c) => {
      if (c.estado === 'cancelada') return false;
      const horas = horasHasta(c);
      return horas > 0 && horas <= 24;
    });
    setProximas(dentroDe24h);
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (proximas.length === 0) return null;

  return (
    <div className="recordatorio-banner">
      {proximas.map((c) => (
        <div key={c._id}>
          Recordatorio: tienes una cita con Dr(a). {c.horario?.medico?.nombre ?? 'tu doctor'} el{' '}
          {new Date(c.horario.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' })} a
          las {c.horario.hora}.
        </div>
      ))}
    </div>
  );
}
