const Usuario = require('../models/Usuario');
const Horario = require('../models/Horario');

// Lectura pública (la usan el selector "Actuar como" del frontend y el
// selector de doctor al crear un horario).
async function getUsuarios(req, res) {
  const filtro = {};
  if (req.query.rol) filtro.rol = req.query.rol;
  const usuarios = await Usuario.find(filtro).sort({ nombre: 1 });
  res.json(usuarios);
}

async function crearDoctor(req, res) {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ mensaje: 'El nombre del doctor es obligatorio' });
  }

  const doctor = await Usuario.create({ nombre: nombre.trim(), rol: 'doctor' });
  res.status(201).json(doctor);
}

async function eliminarDoctor(req, res) {
  const doctor = await Usuario.findById(req.params.id);
  if (!doctor || doctor.rol !== 'doctor') {
    return res.status(404).json({ mensaje: 'Doctor no encontrado' });
  }

  const horariosOcupados = await Horario.countDocuments({ medico: doctor._id, estado: 'ocupado' });
  if (horariosOcupados > 0) {
    return res.status(400).json({ mensaje: 'No se puede eliminar un doctor con citas activas en su agenda' });
  }

  await Horario.deleteMany({ medico: doctor._id, estado: 'disponible' });
  await doctor.deleteOne();
  res.json({ mensaje: 'Doctor eliminado' });
}

module.exports = { getUsuarios, crearDoctor, eliminarDoctor };
