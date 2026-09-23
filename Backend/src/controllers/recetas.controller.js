const Receta = require('../models/Receta');
const Cita = require('../models/Cita');
const Medicamento = require('../models/Medicamento');
const Pedido = require('../models/Pedido');

// Reglas de negocio para medicamentos controlados.
// Ahora que hay roles: solo el DOCTOR ASIGNADO al horario de la cita puede recetar.
const LIMITE_CANTIDAD_CONTROLADO = 30; // unidades máximas por receta
const DIAS_ESPERA_CONTROLADO = 30; // días de espera antes de poder re-recetar el mismo controlado

async function esDoctorAsignado(cita, req) {
  if (req.usuario.rol !== 'doctor') return false;
  if (!cita.horario) return false;
  return cita.horario.medico.toString() === req.usuario.id;
}

async function crearReceta(req, res) {
  const { medicamentoId, cantidad } = req.body;
  const citaId = req.params.id;

  if (!medicamentoId || !cantidad || Number(cantidad) < 1) {
    return res.status(400).json({ mensaje: 'Selecciona un medicamento y una cantidad válida' });
  }

  const cita = await Cita.findById(citaId).populate('horario');
  if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

  if (req.usuario.rol !== 'doctor') {
    return res.status(403).json({ mensaje: 'Solo un doctor puede emitir recetas' });
  }
  if (!(await esDoctorAsignado(cita, req))) {
    return res.status(403).json({ mensaje: 'Solo el doctor asignado a esta cita puede recetar sobre ella' });
  }
  if (cita.estado === 'cancelada') {
    return res.status(400).json({ mensaje: 'No se puede emitir una receta sobre una cita cancelada' });
  }
  if (!cita.motivo || !cita.motivo.trim()) {
    return res.status(400).json({ mensaje: 'La cita debe tener un motivo de consulta antes de recetar' });
  }

  const medicamento = await Medicamento.findById(medicamentoId);
  if (!medicamento) return res.status(404).json({ mensaje: 'Medicamento no encontrado' });

  const cantidadNum = Number(cantidad);

  if (medicamento.esControlado) {
    if (cantidadNum > LIMITE_CANTIDAD_CONTROLADO) {
      return res.status(400).json({
        mensaje: `Los medicamentos controlados no pueden recetarse en cantidades mayores a ${LIMITE_CANTIDAD_CONTROLADO} unidades por receta`,
      });
    }

    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_ESPERA_CONTROLADO);

    const recetaReciente = await Receta.findOne({
      paciente: cita.paciente,
      medicamento: medicamento._id,
      esControlado: true,
      createdAt: { $gte: desde },
    });

    if (recetaReciente) {
      return res.status(409).json({
        mensaje: `Ya se emitió una receta de ${medicamento.nombre} para este paciente en los últimos ${DIAS_ESPERA_CONTROLADO} días`,
      });
    }
  }

  // Descuento de stock atómico: la condición stock >= cantidad va en el filtro,
  // así que si dos requests llegan casi al mismo tiempo, solo una gana la carrera.
  const medicamentoActualizado = await Medicamento.findOneAndUpdate(
    { _id: medicamento._id, stock: { $gte: cantidadNum } },
    { $inc: { stock: -cantidadNum } },
    { new: true }
  );

  if (!medicamentoActualizado) {
    return res.status(409).json({ mensaje: 'No hay stock suficiente de este medicamento' });
  }

  const receta = await Receta.create({
    cita: cita._id,
    paciente: cita.paciente,
    emitidoPor: req.usuario.id,
    medicamento: medicamento._id,
    cantidad: cantidadNum,
    esControlado: medicamento.esControlado,
  });

  const recetaConMedicamento = await receta.populate('medicamento');
  res.status(201).json(recetaConMedicamento);
}

async function getRecetasDeCita(req, res) {
  const cita = await Cita.findById(req.params.id).populate('horario');
  if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

  const esPaciente = cita.paciente.toString() === req.usuario.id;
  const esDoctor = await esDoctorAsignado(cita, req);

  if (!esPaciente && !esDoctor) {
    return res.status(403).json({ mensaje: 'No tienes acceso a las recetas de esta cita' });
  }

  const recetas = await Receta.find({ cita: cita._id }).populate('medicamento').sort({ createdAt: -1 });
  res.json(recetas);
}

// Todas las recetas del paciente autenticado, con una bandera "surtida" que
// dice si ya se generó un Pedido a partir de ella (para saber cuáles siguen vigentes).
async function getMisRecetas(req, res) {
  const recetas = await Receta.find({ paciente: req.usuario.id }).populate('medicamento').sort({ createdAt: -1 });

  const idsRecetas = recetas.map((r) => r._id);
  const pedidosExistentes = await Pedido.find({ receta: { $in: idsRecetas } }).select('receta');
  const idsConPedido = new Set(pedidosExistentes.map((p) => p.receta.toString()));

  const recetasConEstado = recetas.map((r) => ({
    ...r.toObject(),
    surtida: idsConPedido.has(r._id.toString()),
  }));

  res.json(recetasConEstado);
}

module.exports = { crearReceta, getRecetasDeCita, getMisRecetas };
