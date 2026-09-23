import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';

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

  const recetasControladas = recetas.filter((r) => r.esControlado);

  return (
    <section className="panel">
      <h2>Mis recetas</h2>
      <p>Recetas de medicamentos controlados emitidas por tu doctor.</p>

      {cargando && <p>Cargando…</p>}

      <ul className="citas-list">
        {!cargando && recetasControladas.length === 0 && <li>No tienes recetas de medicamentos controlados.</li>}
        {recetasControladas.map((r) => (
          <li key={r._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{r.medicamento?.nombre}</strong>
                <span>{r.cantidad} unidades · {r.surtida ? 'Ya surtida' : 'Vigente'}</span>
              </div>
              <div className="cita-actions">
                {!r.surtida && (
                  <button className="btn-receta" onClick={() => surtir(r._id)}>
                    Surtir
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

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
