const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    horario: { type: mongoose.Schema.Types.ObjectId, ref: 'Horario', required: true },
    estado: {
      type: String,
      enum: ['reservada', 'cancelada'],
      default: 'reservada',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cita', citaSchema);