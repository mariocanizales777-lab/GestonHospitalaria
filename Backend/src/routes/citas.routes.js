const express = require('express');
const router = express.Router();
const {
  reservarCita,
  getMisCitas,
  getCitasDelDoctor,
  actualizarCita,
  cancelarCita,
} = require('../controllers/citas.controller');
const { crearReceta, getRecetasDeCita } = require('../controllers/recetas.controller');
const verificarToken = require('../middleware/auth');

router.use(verificarToken);

router.post('/', reservarCita);
router.get('/mias', getMisCitas);
router.get('/mi-agenda', getCitasDelDoctor);
router.put('/:id', actualizarCita);
router.put('/:id/cancelar', cancelarCita);
router.post('/:id/receta', crearReceta);
router.get('/:id/recetas', getRecetasDeCita);

module.exports = router;
