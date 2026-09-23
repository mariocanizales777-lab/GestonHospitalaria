const mongoose = require('mongoose');

const medicamentoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    esControlado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicamento', medicamentoSchema);
