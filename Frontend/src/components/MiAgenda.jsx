import { useEffect, useState } from 'react';
import { API_URL, fetchAutenticado } from '../api';
import { useToast } from './Toast';
import RecetaCard from './RecetaCard';

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

export default function MiAgenda() {
  const toast = useToast();

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [medicamentos, setMedicamentos] = useState([]);
  const [recetasPorCita, setRecetasPorCita] = useState({});
  const [citaAbierta, setCitaAbierta] = useState(null);
  const [medicamentoId, setMedicamentoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [enviandoReceta, setEnviandoReceta] = useState(false);

  async function cargarMiAgenda() {
    setCargando(true);
    const res = await fetchAutenticado('/citas/mi-agenda');
    if (!res.ok) {
      toast.error('No se pudo cargar tu agenda.');
      setCargando(false);
      return;
    }
    setCitas(await res.json());
    setCargando(false);
  }

  async function cargarMedicamentos() {
    const res = await fetch(`${API_URL}/medicamentos`);
    if (res.ok) setMedicamentos(await res.json());
  }

  async function cargarRecetas(citaId) {
    const res = await fetchAutenticado(`/citas/${citaId}/recetas`);
    if (res.ok) {
      const data = await res.json();
      setRecetasPorCita((prev) => ({ ...prev, [citaId]: data }));
    }
  }

  useEffect(() => {
    cargarMiAgenda();
    cargarMedicamentos();
  }, []);

  function toggleRecetar(citaId) {
    if (citaAbierta === citaId) {
      setCitaAbierta(null);
      return;
    }
    setCitaAbierta(citaId);
    setMedicamentoId('');
    setCantidad(1);
    if (!recetasPorCita[citaId]) cargarRecetas(citaId);
  }

  async function emitirReceta(citaId) {
    if (!medicamentoId) {
      toast.error('Selecciona un medicamento.');
      return;
    }

    setEnviandoReceta(true);
    const res = await fetchAutenticado(`/citas/${citaId}/receta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicamentoId, cantidad: Number(cantidad) }),
    });

    const data = await res.json();
    setEnviandoReceta(false);

    if (res.ok) {
      toast.exito(`Receta emitida: ${data.medicamento.nombre} × ${data.cantidad}.`);
      setMedicamentoId('');
      setCantidad(1);
      cargarRecetas(citaId);
      cargarMedicamentos();
    } else {
      toast.error(data.mensaje || 'No se pudo emitir la receta.');
    }
  }

  return (
    <section className="panel">
      <h2>Mi agenda</h2>
      <p className="nota-receta">
        Aquí aparecen las citas que los pacientes agendan en horarios asignados a ti.
        Si no ves ninguna, pídele al Admin que cree un horario para ti y a un Paciente que agende en él.
      </p>

      {cargando && <p>Cargando…</p>}

      <ul className="citas-list">
        {!cargando && citas.length === 0 && <li>No tienes citas en tu agenda todavía.</li>}
        {citas.map((cita) => (
          <li key={cita._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{formatearFecha(cita)}</strong>
                <span>
                  Paciente: {cita.paciente?.nombre ?? '—'} · {cita.horario?.sucursal ?? '—'} · {cita.motivo} · {cita.estado}
                </span>
              </div>
              <div className="cita-actions">
                <button className="btn-receta" onClick={() => toggleRecetar(cita._id)}>
                  {citaAbierta === cita._id ? 'Cerrar' : 'Recetar'}
                </button>
              </div>
            </div>

            {citaAbierta === cita._id && (
              <div className="receta-panel">
                <h4>Recetas de esta cita</h4>

                <div className="recetas-grid">
                  {(recetasPorCita[cita._id] ?? []).length === 0 && <p>Sin recetas emitidas.</p>}
                  {(recetasPorCita[cita._id] ?? []).map((r) => (
                    <RecetaCard key={r._id} receta={r} />
                  ))}
                </div>

                <div className="receta-form">
                  <select value={medicamentoId} onChange={(e) => setMedicamentoId(e.target.value)}>
                    <option value="">Selecciona un medicamento</option>
                    {medicamentos.map((med) => (
                      <option key={med._id} value={med._id} disabled={med.stock <= 0}>
                        {med.nombre}{med.esControlado ? ' (Controlado)' : ''} — stock: {med.stock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                  <button onClick={() => emitirReceta(cita._id)} disabled={enviandoReceta}>
                    {enviandoReceta ? 'Emitiendo…' : 'Emitir receta'}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}