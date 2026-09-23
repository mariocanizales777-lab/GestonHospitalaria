const express = require('express');
const router = express.Router();
const { getMedicamentos } = require('../controllers/medicamentos.controller');

// El catálogo es de lectura pública, igual que GET /api/horarios.
router.get('/', getMedicamentos);

module.exports = router;
