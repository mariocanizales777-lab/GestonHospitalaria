import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

export default function Doctores() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();

  const [doctores, setDoctores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);

  async function cargarDoctores() {
    setCargando(true);
    const res = await fetchAutenticado('/usuarios?rol=doctor');
    if (res.ok) setDoctores(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarDoctores();
  }, []);

  async function agregarDoctor(e) {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre del doctor es obligatorio.');
      return;
    }

    const res = await fetchAutenticado('/usuarios/doctores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.exito(`Doctor "${data.nombre}" agregado.`);
      setNombre('');
      cargarDoctores();
    } else {
      toast.error(data.mensaje || 'No se pudo agregar el doctor.');
    }
  }

  async function eliminarDoctor(id, nombreDoctor) {
    const confirmado = await pedirConfirmacion(`¿Eliminar a "${nombreDoctor}"? Sus horarios disponibles también se eliminarán.`);
    if (!confirmado) return;

    const res = await fetchAutenticado(`/usuarios/doctores/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      toast.exito('Doctor eliminado.');
      cargarDoctores();
    } else {
      toast.error(data.mensaje || 'No se pudo eliminar el doctor.');
    }
  }

  return (
    <section className="panel">
      <h2>Doctores</h2>
      <p>Alta y baja del personal médico disponible para asignar horarios.</p>

      <form onSubmit={agregarDoctor} className="horario-form">
        <label>
          Nombre del doctor
          <input
            type="text"
            placeholder="Ej. Dr. Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>
        <button type="submit">Agregar doctor</button>
      </form>

      <h3 style={{ marginTop: 24 }}>Doctores registrados</h3>

      {cargando && <p>Cargando…</p>}

      <ul className="citas-list">
        {!cargando && doctores.length === 0 && <li>No hay doctores registrados.</li>}
        {doctores.map((doc) => (
          <li key={doc._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{doc.nombre}</strong>
              </div>
              <div className="cita-actions">
                <button className="btn-cancelar" onClick={() => eliminarDoctor(doc._id, doc.nombre)}>
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
