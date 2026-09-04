const express = require('express');
const router = express.Router();
const { getHorarios, crearHorario, editarHorario } = require('../controllers/horarios.controller');
const verificarToken = require('../middleware/auth');

router.get('/', getHorarios);
router.post('/', verificarToken, crearHorario);
router.put('/:id', verificarToken, editarHorario);

module.exports = router;