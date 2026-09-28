import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

export default function Doctores() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();

  const [doctores, setDoctores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

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

    if (!nombre.trim() || !usuario.trim() || !contrasena) {
      toast.error('Nombre, usuario y contraseña son obligatorios.');
      return;
    }
    if (contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setEnviando(true);
    const res = await fetchAutenticado('/usuarios/doctores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), usuario: usuario.trim(), contrasena }),
    });

    const data = await res.json();
    setEnviando(false);

    if (res.ok) {
      toast.exito(`Doctor "${data.nombre}" agregado. Ya puede iniciar sesión con el usuario "${data.usuario}".`);
      setNombre('');
      setUsuario('');
      setContrasena('');
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
      <p>Alta y baja del personal médico. Cada doctor que crees aquí queda con su propio usuario y contraseña para iniciar sesión.</p>

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
        <label>
          Usuario
          <input
            type="text"
            placeholder="Ej. juan.perez"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Agregando…' : 'Agregar doctor'}
        </button>
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
                <span>Usuario: {doc.usuario}</span>
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
