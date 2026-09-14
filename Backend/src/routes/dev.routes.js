const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// SOLO PARA DEMOS: genera un token de un paciente de prueba fijo, sin necesidad de login.
router.get('/token', (req, res) => {
  const idDemo = '650000000000000000000099'; // paciente de prueba fijo
  const token = jwt.sign({ id: idDemo }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;