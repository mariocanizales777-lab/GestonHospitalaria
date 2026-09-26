const Cita = require('../models/Cita');
const Receta = require('../models/Receta');
const Pedido = require('../models/Pedido');

async function getResumen(req, res) {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo un administrador puede ver los reportes.' });
    }

    const citasPorEstadoRaw = await Cita.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } },
    ]);
    const citasPorEstado = citasPorEstadoRaw.map((c) => ({ estado: c._id, total: c.total }));

    const citasPorDoctorRaw = await Cita.aggregate([
      {
        $lookup: {
          from: 'horarios',
          localField: 'horario',
          foreignField: '_id',
          as: 'horarioInfo',
        },
      },
      { $unwind: '$horarioInfo' },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'horarioInfo.medico',
          foreignField: '_id',
          as: 'medicoInfo',
        },
      },
      { $unwind: '$medicoInfo' },
      {
        $group: {
          _id: '$medicoInfo._id',
          nombre: { $first: '$medicoInfo.nombre' },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    const citasPorDoctor = citasPorDoctorRaw.map((c) => ({ doctor: c.nombre, total: c.total }));

    const medicamentosMasRecetadosRaw = await Receta.aggregate([
      {
        $group: {
          _id: '$medicamento',
          totalRecetado: { $sum: '$cantidad' },
          vecesRecetado: { $sum: 1 },
        },
      },
      { $sort: { vecesRecetado: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'medicamentos',
          localField: '_id',
          foreignField: '_id',
          as: 'medicamentoInfo',
        },
      },
      { $unwind: '$medicamentoInfo' },
    ]);
    const medicamentosMasRecetados = medicamentosMasRecetadosRaw.map((m) => ({
      nombre: m.medicamentoInfo.nombre,
      vecesRecetado: m.vecesRecetado,
      totalUnidades: m.totalRecetado,
    }));

    const pedidosPorEstadoRaw = await Pedido.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } },
    ]);
    const pedidosPorEstado = pedidosPorEstadoRaw.map((p) => ({ estado: p._id, total: p.total }));

    const pedidosControladosVsLibresRaw = await Pedido.aggregate([
      { $group: { _id: '$esControlado', total: { $sum: 1 } } },
    ]);
    const pedidosControladosVsLibres = {
      controlados: pedidosControladosVsLibresRaw.find((p) => p._id === true)?.total ?? 0,
      libres: pedidosControladosVsLibresRaw.find((p) => p._id === false)?.total ?? 0,
    };

    res.json({
      citasPorEstado,
      citasPorDoctor,
      medicamentosMasRecetados,
      pedidosPorEstado,
      pedidosControladosVsLibres,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el reporte.', error: error.message });
  }
}

module.exports = { getResumen };