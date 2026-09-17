import { useState } from 'react';
import { API_URL, getToken } from '../api';

export default function Horarios() {
  const [sucursal, setSucursal] = useState('Sucursal Centro');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function crearHorario(e) {
    e.preventDefault();
    setMensaje('');

    const res = await fetch(`${API_URL}/horarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        sucursal,
        medico: '650000000000000000000001',
        fecha,
        hora,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMensaje(`Horario creado: ${sucursal} — ${fecha} ${hora}`);
      setHora('');
    } else {
      setMensaje(data.mensaje || 'No se pudo crear el horario.');
    }
  }

  return (
    <section className="panel">
      <h2>Crear horario (personal administrativo)</h2>
      <p>Define un bloque de horario disponible por sucursal.</p>

      <form onSubmit={crearHorario} className="horario-form">
        <label>
          Sucursal
          <select value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
            <option>Sucursal Centro</option>
            <option>Sucursal Norte</option>
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

        <button type="submit">Crear horario</button>
      </form>

      {mensaje && <p className="mensaje-horario">{mensaje}</p>}
    </section>
  );
}