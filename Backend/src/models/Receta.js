const mongoose = require('mongoose');

const recetaSchema = new mongoose.Schema(
  {
    cita: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    emitidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    medicamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    esControlado: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Receta', recetaSchema);
