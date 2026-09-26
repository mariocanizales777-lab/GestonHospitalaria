const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

async function login(req, res) {
  try {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos.' });
    }

    const encontrado = await Usuario.findOne({ usuario });
    if (!encontrado) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    const coincide = await bcrypt.compare(contrasena, encontrado.contrasena);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: encontrado._id, rol: encontrado.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { id: encontrado._id, nombre: encontrado.nombre, rol: encontrado.rol },
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error: error.message });
  }
}

module.exports = { login };
