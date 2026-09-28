const Receta = require('../models/Receta');
const Cita = require('../models/Cita');
const Medicamento = require('../models/Medicamento');
const Pedido = require('../models/Pedido');

const CANTIDAD_MAXIMA_CONTROLADO = 30;
const DIAS_COOLDOWN_CONTROLADO = 15;

async function esDoctorAsignado(citaId, doctorId) {
  const cita = await Cita.findById(citaId).populate({ path: 'horario', populate: { path: 'medico' } });
  if (!cita) return { ok: false, mensaje: 'Cita no encontrada.' };
  if (String(cita.horario?.medico?._id) !== String(doctorId)) {
    return { ok: false, mensaje: 'No eres el doctor asignado a esta cita.' };
  }
  return { ok: true, cita };
}

async function crearReceta(req, res) {
  try {
    if (req.usuario.rol !== 'doctor') {
      return res.status(403).json({ mensaje: 'Solo un doctor puede emitir recetas.' });
    }

    const { medicamentoId, cantidad } = req.body;
    const citaId = req.params.id;

    if (!medicamentoId || !cantidad || cantidad < 1) {
      return res.status(400).json({ mensaje: 'Falta el medicamento o la cantidad es inválida.' });
    }

    const verificacion = await esDoctorAsignado(citaId, req.usuario.id);
    if (!verificacion.ok) return res.status(403).json({ mensaje: verificacion.mensaje });

    const medicamento = await Medicamento.findById(medicamentoId);
    if (!medicamento) return res.status(404).json({ mensaje: 'Medicamento no encontrado.' });

    if (medicamento.esControlado) {
      if (cantidad > CANTIDAD_MAXIMA_CONTROLADO) {
        return res.status(400).json({
          mensaje: `No puedes recetar más de ${CANTIDAD_MAXIMA_CONTROLADO} unidades de un medicamento controlado.`,
        });
      }

      const pacienteId = verificacion.cita.paciente;
      const limiteFecha = new Date();
      limiteFecha.setDate(limiteFecha.getDate() - DIAS_COOLDOWN_CONTROLADO);

      const recetaReciente = await Receta.findOne({
        paciente: pacienteId,
        medicamento: medicamentoId,
        esControlado: true,
        createdAt: { $gte: limiteFecha },
      });

      if (recetaReciente) {
        return res.status(400).json({
          mensaje: `Este paciente ya recibió una receta de este medicamento en los últimos ${DIAS_COOLDOWN_CONTROLADO} días.`,
        });
      }
    }

    const receta = await Receta.create({
      cita: citaId,
      paciente: verificacion.cita.paciente,
      emitidoPor: req.usuario.id,
      medicamento: medicamentoId,
      cantidad,
      esControlado: medicamento.esControlado,
    });

    const recetaPopulada = await Receta.findById(receta._id)
      .populate('medicamento')
      .populate({ path: 'emitidoPor', select: 'nombre' })
      .populate({ path: 'paciente', select: 'nombre' });

    res.status(201).json(recetaPopulada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al emitir la receta.', error: error.message });
  }
}

async function getRecetasDeCita(req, res) {
  try {
    const recetas = await Receta.find({ cita: req.params.id })
      .populate('medicamento')
      .populate({ path: 'emitidoPor', select: 'nombre' })
      .populate({ path: 'paciente', select: 'nombre' })
      .sort({ createdAt: -1 });

    const recetasConEstado = await Promise.all(
      recetas.map(async (r) => {
        const objeto = r.toObject();
        if (r.esControlado) {
          const pedido = await Pedido.findOne({ receta: r._id });
          objeto.pedidoEstado = pedido ? pedido.estado : null;
          objeto.surtida = !!pedido;
        }
        return objeto;
      })
    );

    res.json(recetasConEstado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las recetas de la cita.', error: error.message });
  }
}

async function getMisRecetas(req, res) {
  try {
    const recetas = await Receta.find({ paciente: req.usuario.id })
      .populate('medicamento')
      .populate({ path: 'emitidoPor', select: 'nombre' })
      .sort({ createdAt: -1 });

    const recetasConEstado = await Promise.all(
      recetas.map(async (r) => {
        const objeto = r.toObject();
        const pedido = await Pedido.findOne({ receta: r._id });
        objeto.surtida = !!pedido;
        return objeto;
      })
    );

    res.json(recetasConEstado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tus recetas.', error: error.message });
  }
}

async function getHistorialPaciente(req, res) {
  try {
    const { pacienteId } = req.params;

    const recetas = await Receta.find({ paciente: pacienteId, emitidoPor: req.usuario.id })
      .populate('medicamento')
      .populate({ path: 'emitidoPor', select: 'nombre' })
      .sort({ createdAt: -1 });

    res.json(recetas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el historial del paciente.', error: error.message });
  }
}

module.exports = {
  crearReceta,
  getRecetasDeCita,
  getMisRecetas,
  getHistorialPaciente,
};