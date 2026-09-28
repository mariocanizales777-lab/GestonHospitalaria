const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const requireRol = require('../middleware/requireRol');
const {
  getMedicamentos,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento,
} = require('../controllers/medicamentos.controller');

// El catálogo es de lectura pública, igual que GET /api/horarios.
router.get('/', getMedicamentos);

router.post('/', verificarToken, requireRol('admin'), crearMedicamento);
router.put('/:id', verificarToken, requireRol('admin'), actualizarMedicamento);
router.delete('/:id', verificarToken, requireRol('admin'), eliminarMedicamento);

module.exports = router;
