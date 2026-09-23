const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    rol: { type: String, enum: ['paciente', 'doctor', 'admin'], default: 'paciente', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
