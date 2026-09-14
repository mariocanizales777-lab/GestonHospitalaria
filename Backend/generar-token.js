require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const idFalso = new mongoose.Types.ObjectId().toString();
const token = jwt.sign({ id: idFalso }, process.env.JWT_SECRET, { expiresIn: '7d' });

console.log('ID de paciente de prueba:', idFalso);
console.log('Token:', token);