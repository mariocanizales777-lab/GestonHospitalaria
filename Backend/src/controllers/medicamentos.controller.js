const Medicamento = require('../models/Medicamento');

async function getMedicamentos(req, res) {
  const medicamentos = await Medicamento.find().sort({ nombre: 1 });
  res.json(medicamentos);
}

module.exports = { getMedicamentos };
