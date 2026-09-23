const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    medicamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    esControlado: { type: Boolean, required: true },
    // Solo presente cuando el pedido viene de surtir una receta de un controlado.
    receta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta' },
    estado: { type: String, enum: ['pendiente', 'entregado', 'cancelado'], default: 'pendiente' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
