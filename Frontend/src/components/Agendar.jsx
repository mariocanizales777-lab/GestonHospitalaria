import { useEffect, useState } from 'react';
import { API_URL, fetchAutenticado } from '../api';
import { useToast } from './Toast';

function generarDias() {
  const dias = [];
  for (let i = 0; i < 5; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i);
    dias.push(fecha);
  }
  return dias;
}

function formatearISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function Agendar() {
  const toast = useToast();
  const dias = generarDias();
  const [diaSeleccionado, setDiaSeleccionado] = useState(formatearISO(dias[0]));
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [motivo, setMotivo] = useState('');

  async function cargarHorarios(fecha) {
    setCargando(true);
    const res = await fetch(`${API_URL}/horarios?fecha=${fecha}`);
    if (!res.ok) {
      toast.error('No se pudieron cargar los horarios.');
      setCargando(false);
      return;
    }
    setHorarios(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarHorarios(diaSeleccionado);
  }, [diaSeleccionado]);

  async function reservarCita(horarioId) {
    if (!motivo.trim()) {
      toast.error('Escribe el motivo de la consulta antes de reservar.');
      return;
    }

    const res = await fetchAutenticado('/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horarioId, motivo }),
    });

    if (res.ok) {
      toast.exito('Cita reservada con éxito.');
      setMotivo('');
      cargarHorarios(diaSeleccionado);
    } else {
      const data = await res.json();
      toast.error(data.mensaje || 'No se pudo reservar la cita.');
    }
  }

  const motivoValido = motivo.trim().length > 0;

  return (
    <section className="booking-section">
      <h1>Agendar nueva cita médica</h1>
      <p>Seleccione el día de su preferencia y una de las horas disponibles.</p>

      <div className="dias-selector">
        {dias.map((dia) => {
          const iso = formatearISO(dia);
          const activo = iso === diaSeleccionado;
          return (
            <button
              key={iso}
              className={`dia-btn ${activo ? 'activo' : ''}`}
              onClick={() => setDiaSeleccionado(iso)}
            >
              <span className="dia-nombre">{dia.toLocaleDateString('es-MX', { weekday: 'short' })}</span>
              <span className="dia-numero">{dia.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="motivo-field">
        <label htmlFor="motivo">Motivo de la consulta:</label>
        <input
          id="motivo"
          type="text"
          placeholder="Ej. Dolor de cabeza persistente"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        {!motivoValido && <span className="campo-ayuda">Necesario para poder reservar un horario.</span>}
      </div>

      <h3>Horarios Disponibles</h3>
      <div className="legend">
        <span className="badge disponible">Disponible</span>
        <span className="badge ocupado">Ocupado</span>
      </div>

      {cargando && <p>Cargando horarios…</p>}

      <div className="slots-grid">
        {!cargando && horarios.length === 0 && <p>No hay horarios cargados para este día.</p>}
        {horarios.map((horario) => (
          <button
            key={horario._id}
            className={`slot ${horario.estado}`}
            disabled={horario.estado !== 'disponible' || !motivoValido}
            title={!motivoValido ? 'Escribe el motivo de la consulta primero' : ''}
            onClick={() => reservarCita(horario._id)}
          >
            <strong>{horario.hora}</strong>
            <span>{horario.estado === 'disponible' ? 'Disponible' : 'Ocupado'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
