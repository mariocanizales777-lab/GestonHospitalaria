const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const requireRol = require('../middleware/requireRol');
const {
  crearPedido,
  crearPedidoDesdeReceta,
  getMisPedidos,
  getPedidos,
  actualizarEstadoPedido,
} = require('../controllers/pedidos.controller');

router.use(verificarToken);

router.post('/', requireRol('paciente'), crearPedido);
router.post('/desde-receta', requireRol('paciente'), crearPedidoDesdeReceta);
router.get('/mios', requireRol('paciente'), getMisPedidos);
router.get('/', requireRol('admin'), getPedidos);
router.put('/:id', requireRol('admin'), actualizarEstadoPedido);

module.exports = router;
