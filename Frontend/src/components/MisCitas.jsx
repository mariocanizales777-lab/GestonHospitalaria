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
  const [editandoId, setEditandoId] = useState(null);
  const [motivoEditado, setMotivoEditado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [citaAbierta, setCitaAbierta] = useState(null);
  const [recetasPorCita, setRecetasPorCita] = useState({});

  async function cargarCitas() {
    setCargando(true);
    const res = await fetchAutenticado('/citas/mias');
    if (res.ok) {
      setCitas(await res.json());
    } else {
      toast.error('No se pudieron cargar tus citas.');
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarCitas();
  }, []);

  function iniciarEdicion(cita) {
    setEditandoId(cita._id);
    setMotivoEditado(cita.motivo || '');
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setMotivoEditado('');
  }

  async function guardarMotivo(citaId) {
    if (!motivoEditado.trim()) {
      toast.error('El motivo no puede estar vacío.');
      return;
    }
    setGuardando(true);
    const res = await fetchAutenticado(`/citas/${citaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivoEditado.trim() }),
    });
    const data = await res.json();
    setGuardando(false);
    if (res.ok) {
      toast.exito('Motivo actualizado.');
      setEditandoId(null);
      cargarCitas();
    } else {
      toast.error(data.mensaje || 'No se pudo actualizar el motivo.');
    }
  }

  async function cancelarCita(citaId) {
    const confirmado = await pedirConfirmacion('¿Cancelar esta cita? Esta acción no se puede deshacer.');
    if (!confirmado) return;

    const res = await fetchAutenticado(`/citas/${citaId}/cancelar`, { method: 'PUT' });
    const data = await res.json();
    if (res.ok) {
      toast.exito('Cita cancelada.');
      cargarCitas();
    } else {
      toast.error(data.mensaje || 'No se pudo cancelar la cita.');
    }
  }

  async function toggleRecetas(citaId) {
    if (citaAbierta === citaId) {
      setCitaAbierta(null);
      return;
    }
    setCitaAbierta(citaId);
    if (!recetasPorCita[citaId]) {
      const res = await fetchAutenticado(`/citas/${citaId}/recetas`);
      if (res.ok) {
        const data = await res.json();
        setRecetasPorCita((prev) => ({ ...prev, [citaId]: data }));
      }
    }
  }

  return (
    <section className="panel">
      <h2>Mis citas</h2>

      {cargando && <p>Cargando…</p>}

      <ul className="citas-list">
        {!cargando && citas.length === 0 && <li>Todavía no tienes citas agendadas.</li>}
        {citas.map((cita) => (
          <li key={cita._id} className={`cita-item-wrapper ${cita.estado === 'cancelada' ? 'cancelada' : ''}`}>
            <div className="cita-item">
              <div className="cita-info">
                <strong>{formatearFecha(cita)}</strong>
                <span>
                  {cita.horario?.sucursal ?? '—'} · Dr(a). {cita.horario?.medico?.nombre ?? 'Sin asignar'}
                </span>

                {editandoId === cita._id ? (
                  <div className="edicion-inline">
                    <input
                      value={motivoEditado}
                      onChange={(e) => setMotivoEditado(e.target.value)}
                      disabled={guardando}
                    />
                    <button onClick={() => guardarMotivo(cita._id)} disabled={guardando}>
                      {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button onClick={cancelarEdicion} disabled={guardando}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <span>Motivo: {cita.motivo} · {cita.estado}</span>
                )}
              </div>

              {cita.estado !== 'cancelada' && editandoId !== cita._id && (
                <div className="cita-actions">
                  <button className="btn-modificar" onClick={() => iniciarEdicion(cita)}>
                    Modificar
                  </button>
                  <button className="btn-cancelar" onClick={() => cancelarCita(cita._id)}>
                    Cancelar
                  </button>
                  <button className="btn-receta" onClick={() => toggleRecetas(cita._id)}>
                    {citaAbierta === cita._id ? 'Ocultar recetas' : 'Ver recetas'}
                  </button>
                </div>
              )}
            </div>

            {citaAbierta === cita._id && (
              <div className="receta-panel">
                <h4>Recetas de esta cita</h4>
                <ul className="recetas-list">
                  {(recetasPorCita[cita._id] ?? []).length === 0 && <li>Sin recetas emitidas.</li>}
                  {(recetasPorCita[cita._id] ?? []).map((r) => (
                    <li key={r._id}>
                      {r.medicamento?.nombre} — {r.cantidad} unidades
                      {r.esControlado && <span className="med-receta"> Controlado</span>}
                      {r.esControlado && <span> · Pedido: {r.pedidoEstado ?? 'sin surtir'}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}