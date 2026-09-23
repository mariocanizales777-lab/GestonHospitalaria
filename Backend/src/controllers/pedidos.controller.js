const Pedido = require('../models/Pedido');
const Medicamento = require('../models/Medicamento');
const Receta = require('../models/Receta');

// Apartar un medicamento NO controlado directo desde el catálogo.
// Descuenta stock al instante; queda "pendiente" hasta que un admin lo confirme como entregado.
async function crearPedido(req, res) {
  const { medicamentoId, cantidad } = req.body;

  if (!medicamentoId || !cantidad || Number(cantidad) < 1) {
    return res.status(400).json({ mensaje: 'Selecciona un medicamento y una cantidad válida' });
  }

  const medicamento = await Medicamento.findById(medicamentoId);
  if (!medicamento) return res.status(404).json({ mensaje: 'Medicamento no encontrado' });

  if (medicamento.esControlado) {
    return res.status(400).json({
      mensaje: 'Este medicamento es controlado: debe surtirse desde una receta vigente en "Mis recetas"',
    });
  }

  const cantidadNum = Number(cantidad);

  // Mismo patrón de descuento atómico que usamos en recetas.controller.js.
  const medicamentoActualizado = await Medicamento.findOneAndUpdate(
    { _id: medicamento._id, stock: { $gte: cantidadNum } },
    { $inc: { stock: -cantidadNum } },
    { new: true }
  );

  if (!medicamentoActualizado) {
    return res.status(409).json({ mensaje: 'No hay stock suficiente de este medicamento' });
  }

  const pedido = await Pedido.create({
    paciente: req.usuario.id,
    medicamento: medicamento._id,
    cantidad: cantidadNum,
    esControlado: false,
    estado: 'pendiente',
  });

  const pedidoConMedicamento = await pedido.populate('medicamento');
  res.status(201).json(pedidoConMedicamento);
}

// Surtir un medicamento CONTROLADO a partir de una receta ya emitida por un doctor.
// El stock ya se descontó cuando el doctor emitió la receta, así que aquí NO se descuenta otra vez.
async function crearPedidoDesdeReceta(req, res) {
  const { recetaId } = req.body;
  if (!recetaId) return res.status(400).json({ mensaje: 'Falta indicar la receta a surtir' });

  const receta = await Receta.findById(recetaId).populate('medicamento');
  if (!receta) return res.status(404).json({ mensaje: 'Receta no encontrada' });

  if (receta.paciente.toString() !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'Esta receta no te pertenece' });
  }
  if (!receta.esControlado) {
    return res.status(400).json({ mensaje: 'Esta receta no corresponde a un medicamento controlado' });
  }

  const yaSurtida = await Pedido.findOne({ receta: receta._id });
  if (yaSurtida) {
    return res.status(409).json({ mensaje: 'Esta receta ya fue surtida anteriormente' });
  }

  const pedido = await Pedido.create({
    paciente: req.usuario.id,
    medicamento: receta.medicamento._id,
    cantidad: receta.cantidad,
    esControlado: true,
    receta: receta._id,
    estado: 'pendiente',
  });

  const pedidoConMedicamento = await pedido.populate('medicamento');
  res.status(201).json(pedidoConMedicamento);
}

async function getMisPedidos(req, res) {
  const pedidos = await Pedido.find({ paciente: req.usuario.id }).populate('medicamento').sort({ createdAt: -1 });
  res.json(pedidos);
}

// Admin: ve todos los pedidos para poder confirmarlos o cancelarlos.
async function getPedidos(req, res) {
  const filtro = {};
  if (req.query.estado) filtro.estado = req.query.estado;
  const pedidos = await Pedido.find(filtro).populate('medicamento').populate('paciente').sort({ createdAt: -1 });
  res.json(pedidos);
}

async function actualizarEstadoPedido(req, res) {
  const { estado } = req.body;
  if (!['entregado', 'cancelado'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  const pedido = await Pedido.findById(req.params.id);
  if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
  if (pedido.estado !== 'pendiente') {
    return res.status(400).json({ mensaje: 'Este pedido ya fue procesado' });
  }

  if (estado === 'cancelado') {
    // Devolver el stock reservado al cancelar (aplica tanto a libres como a controlados).
    await Medicamento.findByIdAndUpdate(pedido.medicamento, { $inc: { stock: pedido.cantidad } });
  }

  pedido.estado = estado;
  await pedido.save();
  res.json(pedido);
}

module.exports = { crearPedido, crearPedidoDesdeReceta, getMisPedidos, getPedidos, actualizarEstadoPedido };
