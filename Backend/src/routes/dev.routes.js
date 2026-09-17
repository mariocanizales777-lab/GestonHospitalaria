const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/token', (req, res) => {
  const idDemo = '650000000000000000000099';
  const token = jwt.sign({ id: idDemo }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;