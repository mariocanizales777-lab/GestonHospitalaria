const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema(
  {
    sucursal: { type: String, required: true },
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, required: true }, // día del horario
    hora: { type: String, required: true }, // ej. "10:00"
    estado: {
      type: String,
      enum: ['disponible', 'ocupado'],
      default: 'disponible',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Horario', horarioSchema);