const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Horario = require('../models/Horario');

// Lectura pública (la usan los selectores de doctor al crear horarios/citas).
// No expone la contraseña porque el modelo nunca la incluye en toJSON de más:
// aquí igual la excluimos explícitamente para no filtrarla ni por accidente.
async function getUsuarios(req, res) {
  const filtro = {};
  if (req.query.rol) filtro.rol = req.query.rol;
  const usuarios = await Usuario.find(filtro).select('-contrasena').sort({ nombre: 1 });
  res.json(usuarios);
}

// Solo un admin puede dar de alta doctores (ver usuarios.routes.js). Ahora sí
// les da usuario y contraseña reales para que puedan iniciar sesión como
// cualquier otro rol, en vez de crear una cuenta "fantasma" sin acceso.
async function crearDoctor(req, res) {
  try {
    const { nombre, usuario, contrasena } = req.body;

    if (!nombre || !nombre.trim() || !usuario || !usuario.trim() || !contrasena) {
      return res.status(400).json({ mensaje: 'Nombre, usuario y contraseña son obligatorios para crear el acceso del doctor.' });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const usuarioNormalizado = usuario.trim().toLowerCase();
    const existente = await Usuario.findOne({ usuario: usuarioNormalizado });
    if (existente) {
      return res.status(409).json({ mensaje: 'Ese nombre de usuario ya está en uso.' });
    }

    const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

    const doctor = await Usuario.create({
      nombre: nombre.trim(),
      usuario: usuarioNormalizado,
      contrasena: contrasenaHasheada,
      rol: 'doctor',
    });

    res.status(201).json({ _id: doctor._id, nombre: doctor.nombre, usuario: doctor.usuario, rol: doctor.rol });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'Ese nombre de usuario ya está en uso.' });
    }
    res.status(500).json({ mensaje: 'Error al crear el doctor.', error: error.message });
  }
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
