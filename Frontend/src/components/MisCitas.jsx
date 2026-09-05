import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../api';
import TokenSetup from './TokenSetup';

function formatearFecha(cita) {
  const fecha = new Date(cita.horario.fecha).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
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
      alert('No se pudieron cargar tus citas. Revisa el token.');
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

  return (
    <section className="panel">
      <TokenSetup onGuardar={cargarMisCitas} />

      <h2>Mis citas agendadas</h2>
      <ul className="citas-list">
        {citas.length === 0 && <li>No tienes citas agendadas.</li>}
        {citas.map((cita) => (
          <li key={cita._id} className={`cita-item ${cita.estado === 'cancelada' ? 'cancelada' : ''}`}>
            <div className="cita-info">
              <strong>{formatearFecha(cita)}</strong>
              <span>{cita.horario.sucursal} · {cita.estado}</span>
            </div>
            <div className="cita-actions">
              <button
                className="btn-cancelar"
                disabled={cita.estado === 'cancelada'}
                onClick={() => cancelarCita(cita._id)}
              >
                Cancelar
              </button>
              <button className="btn-modificar" disabled title="Próximamente">
                Modificar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}