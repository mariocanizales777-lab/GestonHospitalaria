const express = require('express');
const router = express.Router();
const { getHorarios, crearHorario, editarHorario, eliminarHorario } = require('../controllers/horarios.controller');
const verificarToken = require('../middleware/auth');
const requireRol = require('../middleware/requireRol');

// Lectura pública (agendar necesita ver horarios disponibles sin ser admin).
router.get('/', getHorarios);

// Gestión de horarios: solo administradores.
router.post('/', verificarToken, requireRol('admin'), crearHorario);
router.put('/:id', verificarToken, requireRol('admin'), editarHorario);
router.delete('/:id', verificarToken, requireRol('admin'), eliminarHorario);

module.exports = router;
