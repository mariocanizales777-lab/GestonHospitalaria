import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../api';

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
  const [citas, setCitas] = useState([]);

  async function cargarMisCitas() {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/citas/mias`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert('No se pudieron cargar tus citas.');
      return;
    }
    setCitas(await res.json());
  }

  useEffect(() => {
    cargarMisCitas();
  }, []);

  async function cancelarCita(id) {
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return;

    const res = await fetch(`${API_URL}/citas/${id}/cancelar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (res.ok) {
      cargarMisCitas();
    } else {
      alert('No se pudo cancelar la cita.');
    }
  }

  async function modificarCita(cita) {
    const nuevoMotivo = prompt('Nuevo motivo de la consulta:', cita.motivo);
    if (nuevoMotivo === null || !nuevoMotivo.trim()) return;

    const res = await fetch(`${API_URL}/citas/${cita._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ motivo: nuevoMotivo }),
    });

    if (res.ok) {
      cargarMisCitas();
    } else {
      const data = await res.json();
      alert(data.mensaje || 'No se pudo modificar la cita.');
    }
  }

  const citasActivas = citas.filter((c) => c.estado !== 'cancelada');

  return (
    <section className="panel">
      <h2>Mis citas agendadas</h2>
      <ul className="citas-list">
        {citasActivas.length === 0 && <li>No tienes citas agendadas.</li>}
        {citasActivas.map((cita) => (
          <li key={cita._id} className="cita-item">
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
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}