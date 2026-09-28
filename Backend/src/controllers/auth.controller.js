const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

async function login(req, res) {
  try {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos.' });
    }

    const usuarioNormalizado = usuario.trim().toLowerCase();
    const encontrado = await Usuario.findOne({ usuario: usuarioNormalizado });
    if (!encontrado) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    const coincide = await bcrypt.compare(contrasena, encontrado.contrasena);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    const token = firmarToken(encontrado);

    res.json({
      token,
      usuario: { id: encontrado._id, nombre: encontrado.nombre, rol: encontrado.rol },
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error: error.message });
  }
}

// Registro público. SOLO crea cuentas de paciente: el rol nunca se toma del
// cuerpo de la petición para que nadie pueda registrarse como doctor o admin
// mandando { rol: 'admin' } a mano.
async function registro(req, res) {
  try {
    const { nombre, usuario, contrasena } = req.body;

    if (!nombre || !nombre.trim() || !usuario || !usuario.trim() || !contrasena) {
      return res.status(400).json({ mensaje: 'Nombre, usuario y contraseña son requeridos.' });
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

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      usuario: usuarioNormalizado,
      contrasena: contrasenaHasheada,
      rol: 'paciente',
    });

    const token = firmarToken(nuevoUsuario);

    res.status(201).json({
      token,
      usuario: { id: nuevoUsuario._id, nombre: nuevoUsuario.nombre, rol: nuevoUsuario.rol },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'Ese nombre de usuario ya está en uso.' });
    }
    res.status(500).json({ mensaje: 'Error al registrar la cuenta.', error: error.message });
  }
}

module.exports = { login, registro };
