const express = require('express');
const router = express.Router();
const { reservarCita, getMisCitas, cancelarCita } = require('../controllers/citas.controller');
const verificarToken = require('../middleware/auth');

router.use(verificarToken);

router.post('/', reservarCita);
router.get('/mias', getMisCitas);
router.put('/:id/cancelar', cancelarCita);

module.exports = router;