const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Sin login real todavía: "Actuar como" pide un token para el usuario demo
// del rol elegido. Cuando haya autenticación real, este endpoint desaparece.
const IDS_DEMO_POR_ROL = {
  paciente: '650000000000000000000099',
  doctor: '650000000000000000000001',
  admin: '650000000000000000000002',
};

router.get('/token', async (req, res) => {
  const rolSolicitado = req.query.rol || 'paciente';
  const usuarioId = req.query.usuarioId || IDS_DEMO_POR_ROL[rolSolicitado];

  if (!usuarioId) {
    return res.status(400).json({ mensaje: `Rol no reconocido: ${rolSolicitado}` });
  }

  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario demo no encontrado. Reinicia el backend para sembrar los usuarios.' });
  }

  const token = jwt.sign(
    { id: usuario._id.toString(), rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol } });
});

module.exports = router;
