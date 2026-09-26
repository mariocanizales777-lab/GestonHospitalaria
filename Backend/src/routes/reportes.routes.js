const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const requireRol = require('../middleware/requireRol');
const { getResumen } = require('../controllers/reportes.controller');

router.get('/resumen', verificarToken, requireRol('admin'), getResumen);

module.exports = router;
