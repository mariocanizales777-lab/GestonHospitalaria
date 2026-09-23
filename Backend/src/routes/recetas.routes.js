const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const { getMisRecetas } = require('../controllers/recetas.controller');

router.use(verificarToken);

router.get('/mias', getMisRecetas);

module.exports = router;
