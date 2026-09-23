import { useEffect, useState } from 'react';
import { API_URL, fetchAutenticado, getUsuarioActual } from '../api';
import { useToast } from './Toast';

export default function Medicamentos() {
  const toast = useToast();
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cantidades, setCantidades] = useState({});

  const usuario = getUsuarioActual();
  const esPaciente = usuario?.rol === 'paciente';

  async function cargarMedicamentos() {
    setCargando(true);
    const res = await fetch(`${API_URL}/medicamentos`);
    if (res.ok) setMedicamentos(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  async function apartar(medicamentoId, nombre) {
    const cantidad = Number(cantidades[medicamentoId] || 1);
    if (cantidad < 1) {
      toast.error('La cantidad debe ser al menos 1.');
      return;
    }

    const res = await fetchAutenticado('/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicamentoId, cantidad }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.exito(`Pedido creado: ${nombre} × ${cantidad}. Revisa "Mis recetas" para ver su estado.`);
      cargarMedicamentos();
    } else {
      toast.error(data.mensaje || 'No se pudo apartar el medicamento.');
    }
  }

  return (
    <section className="panel">
      <h2>Catálogo de Medicamentos</h2>
      <p className="nota-receta">
        Los medicamentos controlados requieren receta médica válida para su entrega.
        {esPaciente && ' Ve a "Mis recetas" para surtir una receta vigente.'}
      </p>

      {cargando && <p>Cargando catálogo...</p>}

      <ul className="medicamentos-list">
        {!cargando && medicamentos.length === 0 && <li>No hay medicamentos en el catálogo.</li>}
        {medicamentos.map((med) => (
          <li key={med._id} className="medicamento-item">
            <div>
              <strong>{med.nombre}</strong>
              <span className="med-categoria">{med.categoria}</span>
            </div>
            <div className="med-precio">${med.precio.toFixed(2)}</div>
            <div className="med-etiquetas">
              <span className={`med-estado ${med.stock > 0 ? 'disponible' : 'agotado'}`}>
                {med.stock > 0 ? 'Disponible' : 'Agotado'}
              </span>
              {med.esControlado && <span className="med-receta">Requiere receta</span>}
            </div>

            {esPaciente && !med.esControlado && (
              <div className="apartar-form">
                <input
                  type="number"
                  min="1"
                  value={cantidades[med._id] ?? 1}
                  onChange={(e) => setCantidades((prev) => ({ ...prev, [med._id]: e.target.value }))}
                  disabled={med.stock <= 0}
                />
                <button onClick={() => apartar(med._id, med.nombre)} disabled={med.stock <= 0}>
                  Apartar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
