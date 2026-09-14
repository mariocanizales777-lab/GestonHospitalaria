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

  horario.estado = 'ocupado';
  await horario.save();

  const cita = await Cita.create({ paciente, horario: horario._id, motivo, estado: 'reservada' });
  res.status(201).json(cita);
}

async function getMisCitas(req, res) {
  const citas = await Cita.find({ paciente: req.usuario.id }).populate('horario');
  res.json(citas);
}

async function cancelarCita(req, res) {
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada' });

  cita.estado = 'cancelada';
  await cita.save();
  await Horario.findByIdAndUpdate(cita.horario, { estado: 'disponible' });

  res.json(cita);
}

module.exports = { reservarCita, getMisCitas, cancelarCita };