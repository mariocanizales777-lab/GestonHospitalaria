const Cita = require('../models/Cita');
const Horario = require('../models/Horario');

async function reservarCita(req, res) {
  const { horarioId, motivo } = req.body;
  const paciente = req.usuario.id;

  if (!motivo || !motivo.trim()) {
    return res.status(400).json({ mensaje: 'El motivo de la consulta es obligatorio' });
  }

  const horario = await Horario.findById(horarioId);
  if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado' });

  if (horario.estado !== 'disponible') {
    return res.status(409).json({ mensaje: 'Ese horario ya no está disponible' });
  }

  horario.estado = 'ocupado';
  await horario.save();

  const cita = await Cita.create({ paciente, horario: horario._id, motivo, estado: 'reservada' });
  res.status(201).json(cita);
}

async function getMisCitas(req, res) {
  const citas = await Cita.find({ paciente: req.usuario.id }).populate('horario');
  res.json(citas);
}

async function getCitasDelDoctor(req, res) {
  try {
    const horarios = await Horario.find({ medico: req.usuario.id }).select('_id');
    const horarioIds = horarios.map((h) => h._id);

    const citas = await Cita.find({ horario: { $in: horarioIds } })
      .populate('horario')
      .populate({ path: 'paciente', select: 'nombre' })
      .sort({ createdAt: -1 });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tu agenda.', error: error.message });
  }
}

async function actualizarCita(req, res) {
  const { motivo } = req.body;
  if (!motivo || !motivo.trim()) {
    return res.status(400).json({ mensaje: 'El motivo no puede quedar vacío' });
  }

  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

  if (cita.paciente.toString() !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No puedes modificar la cita de otro paciente' });
  }

  if (cita.estado === 'cancelada') {
    return res.status(400).json({ mensaje: 'No se puede modificar una cita cancelada' });
  }

  cita.motivo = motivo;
  await cita.save();
  res.json(cita);
}

async function cancelarCita(req, res) {
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

  if (cita.paciente.toString() !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No puedes cancelar la cita de otro paciente' });
  }

  cita.estado = 'cancelada';
  await cita.save();
  await Horario.findByIdAndUpdate(cita.horario, { estado: 'disponible' });

  res.json(cita);
}

module.exports = {
  reservarCita,
  getMisCitas,
  getCitasDelDoctor,
  actualizarCita,
  cancelarCita,
};