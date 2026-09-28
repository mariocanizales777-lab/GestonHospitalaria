import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';
import RecetaCard from './RecetaCard';

export default function MisRecetas() {
  const toast = useToast();
  const [recetas, setRecetas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargarTodo() {
    setCargando(true);
    const [resRecetas, resPedidos] = await Promise.all([
      fetchAutenticado('/recetas/mias'),
      fetchAutenticado('/pedidos/mios'),
    ]);
    if (resRecetas.ok) setRecetas(await resRecetas.json());
    if (resPedidos.ok) setPedidos(await resPedidos.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  async function surtir(recetaId) {
    const res = await fetchAutenticado('/pedidos/desde-receta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recetaId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.exito('Receta surtida. Tu pedido quedó pendiente de entrega.');
      cargarTodo();
    } else {
      toast.error(data.mensaje || 'No se pudo surtir la receta.');
    }
  }

  return (
    <section className="panel">
      <h2>Mis recetas</h2>
      <p>Aquí puedes ver el detalle de cada receta que tu doctor te ha emitido.</p>

      {cargando && <p>Cargando…</p>}

      <div className="recetas-grid">
        {!cargando && recetas.length === 0 && <p>No tienes recetas emitidas todavía.</p>}
        {recetas.map((r) => (
          <RecetaCard
            key={r._id}
            receta={r}
            mostrarDoctor
            accion={
              r.esControlado && !r.surtida ? (
                <button className="btn-receta" onClick={() => surtir(r._id)}>
                  Surtir receta
                </button>
              ) : null
            }
          />
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>Mis pedidos</h3>
      <ul className="citas-list">
        {!cargando && pedidos.length === 0 && <li>No tienes pedidos.</li>}
        {pedidos.map((p) => (
          <li key={p._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{p.medicamento?.nombre} × {p.cantidad}</strong>
                <span>{p.esControlado ? 'Controlado' : 'Libre'} · {p.estado}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}