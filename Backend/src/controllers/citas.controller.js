const Cita = require('../models/Cita');
const Horario = require('../models/Horario');

async function reservarCita(req, res) {
  try {
    if (req.usuario.rol !== 'paciente') {
      return res.status(403).json({ mensaje: 'Solo un paciente puede agendar citas.' });
    }

    const { horarioId, motivo } = req.body;
    if (!horarioId || !motivo?.trim()) {
      return res.status(400).json({ mensaje: 'Falta el horario o el motivo.' });
    }

    const horario = await Horario.findById(horarioId);
    if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado.' });
    if (horario.ocupado) return res.status(400).json({ mensaje: 'Ese horario ya está ocupado.' });

    horario.ocupado = true;
    await horario.save();

    const cita = await Cita.create({
      paciente: req.usuario.id,
      horario: horario._id,
      motivo: motivo.trim(),
      estado: 'confirmada',
    });

    res.status(201).json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agendar la cita.', error: error.message });
  }
}

async function getMisCitas(req, res) {
  try {
    const citas = await Cita.find({ paciente: req.usuario.id })
      .populate({ path: 'horario', populate: { path: 'medico' } })
      .sort({ createdAt: -1 });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tus citas.', error: error.message });
  }
}

async function getCitasDelDoctor(req, res) {
  try {
    if (req.usuario.rol !== 'doctor') {
      return res.status(403).json({ mensaje: 'Solo un doctor puede ver su agenda.' });
    }

    const horarios = await Horario.find({ medico: req.usuario.id }).select('_id');
    const horarioIds = horarios.map((h) => h._id);

    const citas = await Cita.find({ horario: { $in: horarioIds }, estado: { $ne: 'cancelada' } })
      .populate('horario')
      .populate('paciente')
      .sort({ createdAt: -1 });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tu agenda.', error: error.message });
  }
}

async function actualizarCita(req, res) {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada.' });

    if (String(cita.paciente) !== String(req.usuario.id)) {
      return res.status(403).json({ mensaje: 'No puedes modificar una cita que no es tuya.' });
    }
    if (cita.estado === 'cancelada') {
      return res.status(400).json({ mensaje: 'No puedes modificar una cita cancelada.' });
    }

    const { motivo } = req.body;
    if (!motivo?.trim()) {
      return res.status(400).json({ mensaje: 'El motivo no puede estar vacío.' });
    }

    cita.motivo = motivo.trim();
    await cita.save();
    res.json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la cita.', error: error.message });
  }
}

async function cancelarCita(req, res) {
  try {
    const cita = await Cita.findById(req.params.id).populate('horario');
    if (!cita) return res.status(404).json({ mensaje: 'Cita no encontrada.' });

    if (String(cita.paciente) !== String(req.usuario.id)) {
      return res.status(403).json({ mensaje: 'No puedes cancelar una cita que no es tuya.' });
    }
    if (cita.estado === 'cancelada') {
      return res.status(400).json({ mensaje: 'Esta cita ya está cancelada.' });
    }

    cita.estado = 'cancelada';
    await cita.save();

    if (cita.horario) {
      await Horario.findByIdAndUpdate(cita.horario._id, { ocupado: false });
    }

    res.json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar la cita.', error: error.message });
  }
}

module.exports = {
  reservarCita,
  getMisCitas,
  getCitasDelDoctor,
  actualizarCita,
  cancelarCita,
};