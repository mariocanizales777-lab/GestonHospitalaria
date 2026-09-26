const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const requireRol = require('../middleware/requireRol');
const { getMisRecetas, getHistorialPaciente } = require('../controllers/recetas.controller');

router.get('/mias', verificarToken, getMisRecetas);
router.get('/paciente/:pacienteId', verificarToken, requireRol('doctor'), getHistorialPaciente);

module.exports = router;
