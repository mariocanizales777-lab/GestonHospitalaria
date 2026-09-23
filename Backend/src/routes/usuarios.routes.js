const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const requireRol = require('../middleware/requireRol');
const { getUsuarios, crearDoctor, eliminarDoctor } = require('../controllers/usuarios.controller');

// Lectura pública, igual que /api/horarios y /api/medicamentos.
router.get('/', getUsuarios);

router.post('/doctores', verificarToken, requireRol('admin'), crearDoctor);
router.delete('/doctores/:id', verificarToken, requireRol('admin'), eliminarDoctor);

module.exports = router;
