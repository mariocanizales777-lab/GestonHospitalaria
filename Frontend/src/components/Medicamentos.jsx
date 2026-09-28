import { useEffect, useState } from 'react';
import { API_URL, fetchAutenticado, getUsuarioActual } from '../api';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

export default function Medicamentos() {
  const toast = useToast();
  const pedirConfirmacion = useConfirm();
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cantidades, setCantidades] = useState({});

  const usuario = getUsuarioActual();
  const esPaciente = usuario?.rol === 'paciente';
  const esAdmin = usuario?.rol === 'admin';

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [esControlado, setEsControlado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [stockEditado, setStockEditado] = useState('');
  const [precioEditado, setPrecioEditado] = useState('');

  async function cargarMedicamentos() {
    setCargando(true);
    const res = await fetch(`${API_URL}/medicamentos`);
    if (res.ok) setMedicamentos(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  async function apartar(medicamentoId, nombreMed) {
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
      toast.exito(`Pedido creado: ${nombreMed} × ${cantidad}. Revisa "Mis recetas" para ver su estado.`);
      cargarMedicamentos();
    } else {
      toast.error(data.mensaje || 'No se pudo apartar el medicamento.');
    }
  }

  async function agregarMedicamento(e) {
    e.preventDefault();
    if (!nombre.trim() || !categoria.trim() || precio === '' || stock === '') {
      toast.error('Completa nombre, categoría, precio y stock.');
      return;
    }

    setEnviando(true);
    const res = await fetchAutenticado('/medicamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio),
        stock: Number(stock),
        esControlado,
      }),
    });
    const data = await res.json();
    setEnviando(false);

    if (res.ok) {
      toast.exito(`Medicamento "${data.nombre}" agregado al catálogo.`);
      setNombre('');
      setCategoria('');
      setPrecio('');
      setStock('');
      setEsControlado(false);
      cargarMedicamentos();
    } else {
      toast.error(data.mensaje || 'No se pudo agregar el medicamento.');
    }
  }

  function iniciarEdicion(med) {
    setEditandoId(med._id);
    setStockEditado(med.stock);
    setPrecioEditado(med.precio);
  }

  async function guardarEdicion(medId) {
    const res = await fetchAutenticado(`/medicamentos/${medId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: Number(stockEditado), precio: Number(precioEditado) }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.exito('Medicamento actualizado.');
      setEditandoId(null);
      cargarMedicamentos();
    } else {
      toast.error(data.mensaje || 'No se pudo actualizar el medicamento.');
    }
  }

  async function eliminarMedicamento(medId, nombreMed) {
    const confirmado = await pedirConfirmacion(`¿Eliminar "${nombreMed}" del catálogo?`);
    if (!confirmado) return;

    const res = await fetchAutenticado(`/medicamentos/${medId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      toast.exito('Medicamento eliminado.');
      cargarMedicamentos();
    } else {
      toast.error(data.mensaje || 'No se pudo eliminar el medicamento.');
    }
  }

  return (
    <section className="panel">
      <h2>Catálogo de Medicamentos</h2>
      <p className="nota-receta">
        Los medicamentos controlados requieren receta médica válida para su entrega.
        {esPaciente && ' Ve a "Mis recetas" para surtir una receta vigente.'}
      </p>

      {esAdmin && (
        <form onSubmit={agregarMedicamento} className="horario-form">
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Paracetamol 500mg" />
          </label>
          <label>
            Categoría
            <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej. Analgésico" />
          </label>
          <label>
            Precio
            <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </label>
          <label>
            Stock inicial
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={esControlado} onChange={(e) => setEsControlado(e.target.checked)} />
            Es controlado (requiere receta)
          </label>
          <button type="submit" disabled={enviando}>
            {enviando ? 'Agregando…' : 'Agregar medicamento'}
          </button>
        </form>
      )}

      {cargando && <p>Cargando catálogo...</p>}

      <ul className="medicamentos-list">
        {!cargando && medicamentos.length === 0 && <li>No hay medicamentos en el catálogo.</li>}
        {medicamentos.map((med) => (
          <li key={med._id} className="medicamento-item">
            <div>
              <strong>{med.nombre}</strong>
              <span className="med-categoria">{med.categoria}</span>
            </div>

            {editandoId === med._id ? (
              <div className="edicion-inline">
                <input type="number" min="0" step="0.01" value={precioEditado} onChange={(e) => setPrecioEditado(e.target.value)} />
                <input type="number" min="0" value={stockEditado} onChange={(e) => setStockEditado(e.target.value)} />
                <button onClick={() => guardarEdicion(med._id)}>Guardar</button>
                <button onClick={() => setEditandoId(null)}>Cancelar</button>
              </div>
            ) : (
              <>
                <div className="med-precio">${med.precio.toFixed(2)}</div>
                <div className="med-etiquetas">
                  <span className={`med-estado ${med.stock > 0 ? 'disponible' : 'agotado'}`}>
                    {med.stock > 0 ? `Disponible (${med.stock})` : 'Agotado'}
                  </span>
                  {med.esControlado && <span className="med-receta">Requiere receta</span>}
                </div>
              </>
            )}

            {esPaciente && !med.esControlado && editandoId !== med._id && (
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

            {esAdmin && editandoId !== med._id && (
              <div className="cita-actions">
                <button className="btn-modificar" onClick={() => iniciarEdicion(med)}>Editar</button>
                <button className="btn-cancelar" onClick={() => eliminarMedicamento(med._id, med.nombre)}>Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
