const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { generarToken };
