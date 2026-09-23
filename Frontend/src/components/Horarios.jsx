import { useEffect, useState } from 'react';
import { API_URL, fetchAutenticado } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

function hoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function Horarios() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();

  const [doctores, setDoctores] = useState([]);
  const [cargandoDoctores, setCargandoDoctores] = useState(true);
  const [sucursal, setSucursal] = useState('Sucursal Centro');
  const [medico, setMedico] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [hora, setHora] = useState('');

  const [fechaConsulta, setFechaConsulta] = useState(hoyISO());
  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);

  async function cargarDoctores() {
    setCargandoDoctores(true);
    const res = await fetch(`${API_URL}/usuarios?rol=doctor`);
    if (res.ok) {
      const data = await res.json();
      setDoctores(data);
      if (data.length > 0 && !medico) setMedico(data[0]._id);
    }
    setCargandoDoctores(false);
  }

  async function cargarHorarios(fechaBuscada) {
    setCargandoHorarios(true);
    const res = await fetch(`${API_URL}/horarios?fecha=${fechaBuscada}`);
    if (res.ok) setHorarios(await res.json());
    setCargandoHorarios(false);
  }

  useEffect(() => {
    cargarDoctores();
  }, []);

  useEffect(() => {
    cargarHorarios(fechaConsulta);
  }, [fechaConsulta]);

  async function crearHorario(e) {
    e.preventDefault();

    if (!medico) {
      toast.error('Selecciona un doctor. Si no hay ninguno, agrégalo primero en "Doctores".');
      return;
    }
    if (!fecha || !hora) {
      toast.error('Fecha y hora son obligatorias.');
      return;
    }

    const res = await fetchAutenticado('/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sucursal, medico, fecha, hora }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.exito(`Horario creado: ${sucursal} — ${fecha} ${hora}`);
      setHora('');
      if (fecha === fechaConsulta) cargarHorarios(fechaConsulta);
    } else {
      toast.error(data.mensaje || 'No se pudo crear el horario.');
    }
  }

  async function editarHorario(horario) {
    const nuevaHora = prompt('Nueva hora (HH:MM):', horario.hora);
    if (nuevaHora === null || !nuevaHora.trim()) return;

    const res = await fetchAutenticado(`/horarios/${horario._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hora: nuevaHora }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.exito('Horario actualizado.');
      cargarHorarios(fechaConsulta);
    } else {
      toast.error(data.mensaje || 'No se pudo editar el horario.');
    }
  }

  async function eliminarHorario(horario) {
    const confirmado = await pedirConfirmacion('¿Eliminar este horario?');
    if (!confirmado) return;

    const res = await fetchAutenticado(`/horarios/${horario._id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      toast.exito('Horario eliminado.');
      cargarHorarios(fechaConsulta);
    } else {
      toast.error(data.mensaje || 'No se pudo eliminar el horario.');
    }
  }

  return (
    <section className="panel">
      <h2>Gestión de horarios (Admin)</h2>
      <p>Crea, edita o elimina bloques de horario por sucursal y doctor.</p>

      {!cargandoDoctores && doctores.length === 0 && (
        <p className="campo-ayuda">
          No hay doctores registrados todavía. Ve a la pestaña "Doctores" para agregar uno antes de crear horarios.
        </p>
      )}

      <form onSubmit={crearHorario} className="horario-form">
        <label>
          Sucursal
          <select value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
            <option>Sucursal Centro</option>
            <option>Sucursal Norte</option>
          </select>
        </label>

        <label>
          Doctor
          <select value={medico} onChange={(e) => setMedico(e.target.value)} disabled={doctores.length === 0}>
            {doctores.length === 0 && <option value="">No hay doctores registrados</option>}
            {doctores.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.nombre}</option>
            ))}
          </select>
        </label>

        <label>
          Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </label>

        <label>
          Hora
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
        </label>

        <button type="submit" disabled={doctores.length === 0}>Crear horario</button>
      </form>

      <h3 style={{ marginTop: 24 }}>Horarios existentes</h3>
      <div className="motivo-field">
        <label>
          Consultar fecha
          <input type="date" value={fechaConsulta} onChange={(e) => setFechaConsulta(e.target.value)} />
        </label>
      </div>

      {cargandoHorarios && <p>Cargando…</p>}

      <ul className="citas-list">
        {!cargandoHorarios && horarios.length === 0 && <li>No hay horarios para esa fecha.</li>}
        {horarios.map((h) => (
          <li key={h._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{h.hora} — {h.sucursal}</strong>
                <span>{h.medico?.nombre ?? 'Doctor no encontrado'} · {h.estado}</span>
              </div>
              <div className="cita-actions">
                <button
                  className="btn-modificar"
                  onClick={() => editarHorario(h)}
                  disabled={h.estado === 'ocupado'}
                  title={h.estado === 'ocupado' ? 'Cancela la cita antes de editar este horario' : ''}
                >
                  Editar
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => eliminarHorario(h)}
                  disabled={h.estado === 'ocupado'}
                  title={h.estado === 'ocupado' ? 'Cancela la cita antes de eliminar este horario' : ''}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
