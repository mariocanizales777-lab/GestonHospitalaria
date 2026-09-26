import { useEffect, useState } from 'react';
import { API_URL, fetchAutenticado } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

function generarDias() {
  const dias = [];
  const hoy = new Date();
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    dias.push(fecha);
  }
  return dias;
}

function toISO(fecha) {
  return fecha.toISOString().slice(0, 10);
}

export default function Horarios() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();

  const dias = generarDias();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(toISO(dias[0]));
  const [doctores, setDoctores] = useState([]);
  const [medicoId, setMedicoId] = useState('');
  const [hora, setHora] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [horaEditada, setHoraEditada] = useState('');

  async function cargarDoctores() {
    const res = await fetch(`${API_URL}/usuarios?rol=doctor`);
    if (res.ok) {
      const data = await res.json();
      setDoctores(data);
      if (data.length > 0) setMedicoId((prev) => prev || data[0]._id);
    }
  }

  async function cargarHorarios() {
    setCargando(true);
    const res = await fetch(`${API_URL}/horarios?fecha=${fechaSeleccionada}`);
    if (res.ok) setHorarios(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarDoctores();
  }, []);

  useEffect(() => {
    cargarHorarios();
  }, [fechaSeleccionada]);

  async function crearHorario(e) {
    e.preventDefault();
    if (!medicoId || !hora || !sucursal.trim()) {
      toast.error('Completa doctor, hora y sucursal.');
      return;
    }
    setEnviando(true);
    const res = await fetchAutenticado('/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medico: medicoId, fecha: fechaSeleccionada, hora, sucursal: sucursal.trim() }),
    });
    const data = await res.json();
    setEnviando(false);
    if (res.ok) {
      toast.exito('Horario creado.');
      setHora('');
      cargarHorarios();
    } else {
      toast.error(data.mensaje || 'No se pudo crear el horario.');
    }
  }

  function iniciarEdicionHora(horario) {
    setEditandoId(horario._id);
    setHoraEditada(horario.hora);
  }

  async function guardarHora(horarioId) {
    const res = await fetchAutenticado(`/horarios/${horarioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hora: horaEditada }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.exito('Hora actualizada.');
      setEditandoId(null);
      cargarHorarios();
    } else {
      toast.error(data.mensaje || 'No se pudo actualizar el horario.');
    }
  }

  async function eliminarHorario(horarioId) {
    const confirmado = await pedirConfirmacion('¿Eliminar este horario?');
    if (!confirmado) return;
    const res = await fetchAutenticado(`/horarios/${horarioId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      toast.exito('Horario eliminado.');
      cargarHorarios();
    } else {
      toast.error(data.mensaje || 'No se pudo eliminar el horario.');
    }
  }

  return (
    <section className="panel">
      <h2>Gestión de horarios</h2>

      <div className="dias-selector">
        {dias.map((dia) => {
          const iso = toISO(dia);
          return (
            <button
              key={iso}
              className={`dia-btn ${fechaSeleccionada === iso ? 'activo' : ''}`}
              onClick={() => setFechaSeleccionada(iso)}
            >
              <span className="dia-nombre">{dia.toLocaleDateString('es-MX', { weekday: 'short', timeZone: 'UTC' })}</span>
              <span className="dia-numero">{dia.getDate()}</span>
            </button>
          );
        })}
      </div>

      {doctores.length === 0 && <p className="campo-ayuda">No hay doctores registrados. Ve a "Doctores" para crear uno.</p>}

      <form className="horario-form" onSubmit={crearHorario}>
        <label>
          Doctor
          <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} disabled={doctores.length === 0}>
            {doctores.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Hora
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} disabled={doctores.length === 0} />
        </label>
        <label>
          Sucursal
          <input value={sucursal} onChange={(e) => setSucursal(e.target.value)} disabled={doctores.length === 0} />
        </label>
        <button type="submit" disabled={enviando || doctores.length === 0}>
          {enviando ? 'Creando…' : 'Crear horario'}
        </button>
      </form>

      {cargando && <p>Cargando horarios…</p>}

      <ul className="citas-list" style={{ marginTop: 20 }}>
        {!cargando && horarios.length === 0 && <li>No hay horarios para este día.</li>}
        {horarios.map((h) => (
          <li key={h._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{h.medico?.nombre ?? 'Sin doctor'}</strong>
                {editandoId === h._id ? (
                  <div className="edicion-inline">
                    <input type="time" value={horaEditada} onChange={(e) => setHoraEditada(e.target.value)} />
                    <button onClick={() => guardarHora(h._id)}>Guardar</button>
                    <button onClick={() => setEditandoId(null)}>Cancelar</button>
                  </div>
                ) : (
                  <span>{h.hora} · {h.sucursal} · {h.ocupado ? 'Ocupado' : 'Disponible'}</span>
                )}
              </div>
              {editandoId !== h._id && (
                <div className="cita-actions">
                  <button className="btn-modificar" onClick={() => iniciarEdicionHora(h)} disabled={h.ocupado}>
                    Editar
                  </button>
                  <button className="btn-cancelar" onClick={() => eliminarHorario(h._id)} disabled={h.ocupado}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}