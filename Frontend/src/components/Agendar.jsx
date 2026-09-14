import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../api';

export default function Agendar() {
  const [horarios, setHorarios] = useState([]);
  const [motivo, setMotivo] = useState('');

  async function cargarHorarios() {
    const res = await fetch(`${API_URL}/horarios`);
    if (!res.ok) {
      alert('No se pudieron cargar los horarios.');
      return;
    }
    setHorarios(await res.json());
  }

  useEffect(() => {
    cargarHorarios();
  }, []);

  async function reservarCita(horarioId) {
    const token = getToken();
    if (!motivo.trim()) {
      alert('Escribe el motivo de la consulta antes de reservar.');
      return;
    }

    const res = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ horarioId, motivo }),
    });

    if (res.ok) {
      alert('Cita reservada con éxito.');
      setMotivo('');
      cargarHorarios();
    } else {
      const data = await res.json();
      alert(data.mensaje || 'No se pudo reservar la cita.');
    }
  }

  return (
    <section className="booking-section">
      <h1>Agendar nueva cita médica</h1>
      <p>Seleccione una de las horas disponibles para confirmar su asistencia.</p>

      <div className="motivo-field">
        <label htmlFor="motivo">Motivo de la consulta:</label>
        <input
          id="motivo"
          type="text"
          placeholder="Ej. Dolor de cabeza persistente"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>

      <h3>Horarios Disponibles</h3>
      <div className="legend">
        <span className="badge disponible">Disponible</span>
        <span className="badge expira">Próximo a expirar (Bloqueo 10 min)</span>
        <span className="badge ocupado">Ocupado</span>
      </div>

      <div className="slots-grid">
        {horarios.length === 0 && <p>No hay horarios cargados todavía.</p>}
        {horarios.map((horario) => (
          <button
            key={horario._id}
            className={`slot ${horario.estado}`}
            disabled={horario.estado !== 'disponible'}
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