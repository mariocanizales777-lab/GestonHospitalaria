import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

export default function Pedidos() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargarPedidos() {
    setCargando(true);
    const res = await fetchAutenticado('/pedidos');
    if (res.ok) setPedidos(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function actualizarEstado(id, estado) {
    if (estado === 'cancelado') {
      const confirmado = await pedirConfirmacion('¿Cancelar este pedido? El stock se repondrá automáticamente.');
      if (!confirmado) return;
    }

    const res = await fetchAutenticado(`/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.exito(estado === 'entregado' ? 'Pedido marcado como entregado.' : 'Pedido cancelado, stock repuesto.');
      cargarPedidos();
    } else {
      toast.error(data.mensaje || 'No se pudo actualizar el pedido.');
    }
  }

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente');
  const procesados = pedidos.filter((p) => p.estado !== 'pendiente');

  return (
    <section className="panel">
      <h2>Pedidos de medicamentos</h2>
      <p className="nota-receta">
        Ciclo: un pedido nace <strong>pendiente</strong> cuando un paciente aparta un medicamento libre o surte una
        receta controlada. Aquí lo marcas como <strong>entregado</strong>, o lo <strong>cancelas</strong> (esto repone el stock).
      </p>

      {cargando && <p>Cargando…</p>}

      <h3>Pendientes</h3>
      <ul className="citas-list">
        {!cargando && pendientes.length === 0 && <li>No hay pedidos pendientes.</li>}
        {pendientes.map((p) => (
          <li key={p._id} className="cita-item-wrapper">
            <div className="cita-item">
              <div className="cita-info">
                <strong>{p.medicamento?.nombre} × {p.cantidad}</strong>
                <span>{p.paciente?.nombre ?? 'Paciente'} · {p.esControlado ? 'Controlado' : 'Libre'}</span>
              </div>
              <div className="cita-actions">
                <button className="btn-modificar" onClick={() => actualizarEstado(p._id, 'entregado')}>
                  Marcar entregado
                </button>
                <button className="btn-cancelar" onClick={() => actualizarEstado(p._id, 'cancelado')}>
                  Cancelar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {procesados.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Historial</h3>
          <ul className="citas-list">
            {procesados.map((p) => (
              <li key={p._id} className="cita-item-wrapper">
                <div className="cita-item">
                  <div className="cita-info">
                    <strong>{p.medicamento?.nombre} × {p.cantidad}</strong>
                    <span>{p.paciente?.nombre ?? 'Paciente'} · {p.esControlado ? 'Controlado' : 'Libre'} · {p.estado}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
