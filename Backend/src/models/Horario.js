const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema(
  {
    sucursal: { type: String, required: true },
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    estado: {
      type: String,
      enum: ['disponible', 'ocupado'],
      default: 'disponible',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Horario', horarioSchema);