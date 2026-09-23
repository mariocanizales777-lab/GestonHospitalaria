import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

function formatearFecha(cita) {
  if (!cita.horario) return 'Horario no disponible';
  const fecha = new Date(cita.horario.fecha).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  return `${fecha} — ${cita.horario.hora}`;
}

export default function MisCitas() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recetasPorCita, setRecetasPorCita] = useState({});
  const [citaAbierta, setCitaAbierta] = useState(null);

  async function cargarMisCitas() {
    setCargando(true);
    const res = await fetchAutenticado('/citas/mias');

    if (!res.ok) {
      toast.error('No se pudieron cargar tus citas.');
      setCargando(false);
      return;
    }
    setCitas(await res.json());
    setCargando(false);
  }

  async function cargarRecetas(citaId) {
    const res = await fetchAutenticado(`/citas/${citaId}/recetas`);
    if (res.ok) {
      const data = await res.json();
      setRecetasPorCita((prev) => ({ ...prev, [citaId]: data }));
    }
  }

  useEffect(() => {
    cargarMisCitas();
  }, []);

  async function cancelarCita(id) {
    const confirmado = await pedirConfirmacion('¿Seguro que quieres cancelar esta cita?');
    if (!confirmado) return;

    const res = await fetchAutenticado(`/citas/${id}/cancelar`, { method: 'PUT' });

    if (res.ok) {
      toast.exito('Cita cancelada.');
      cargarMisCitas();
    } else {
      toast.error('No se pudo cancelar la cita.');
    }
  }

  async function modificarCita(cita) {
    const nuevoMotivo = prompt('Nuevo motivo de la consulta:', cita.motivo);
    if (nuevoMotivo === null || !nuevoMotivo.trim()) return;

    const res = await fetchAutenticado(`/citas/${cita._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: nuevoMotivo }),
    });

    if (res.ok) {
      toast.exito('Motivo actualizado.');
      cargarMisCitas();
    } else {
      const data = await res.json();
      toast.error(data.mensaje || 'No se pudo modificar la cita.');
    }
  }

  function toggleRecetas(citaId) {
    if (citaAbierta === citaId) {
      setCitaAbierta(null);
      return;
    }
    setCitaAbierta(citaId);
    if (!recetasPorCita[citaId]) cargarRecetas(citaId);
  }

  const citasActivas = citas.filter((c) => c.estado !== 'cancelada');

  return (
    <section className="panel">
      <h2>Mis citas agendadas</h2>

      {cargando && <p>Cargando…</p>}

      <ul className="citas-list">
        {!cargando && citasActivas.length === 0 && <li>No tienes citas agendadas.</li>}
        {citasActivas.map((cita) => (
          <li key={cita._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{formatearFecha(cita)}</strong>
                <span>{cita.horario?.sucursal ?? '—'} · {cita.motivo} · {cita.estado}</span>
              </div>
              <div className="cita-actions">
                <button className="btn-cancelar" onClick={() => cancelarCita(cita._id)}>
                  Cancelar
                </button>
                <button className="btn-modificar" onClick={() => modificarCita(cita)}>
                  Modificar
                </button>
                <button className="btn-receta" onClick={() => toggleRecetas(cita._id)}>
                  {citaAbierta === cita._id ? 'Cerrar' : 'Ver recetas'}
                </button>
              </div>
            </div>

            {citaAbierta === cita._id && (
              <div className="receta-panel">
                <h4>Recetas emitidas por tu doctor en esta cita</h4>
                <ul className="recetas-list">
                  {(recetasPorCita[cita._id] ?? []).length === 0 && <li>Sin recetas emitidas todavía.</li>}
                  {(recetasPorCita[cita._id] ?? []).map((r) => (
                    <li key={r._id}>
                      {r.medicamento?.nombre} — {r.cantidad} unidades
                      {r.esControlado && <span className="med-receta"> Controlado</span>}
                    </li>
                  ))}
                </ul>
                {(recetasPorCita[cita._id] ?? []).some((r) => r.esControlado) && (
                  <p className="nota-receta">Ve a la pestaña "Mis recetas" para surtir los controlados.</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
