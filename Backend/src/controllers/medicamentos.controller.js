const Medicamento = require('../models/Medicamento');

async function getMedicamentos(req, res) {
  const medicamentos = await Medicamento.find().sort({ nombre: 1 });
  res.json(medicamentos);
}

// Solo un admin puede dar de alta medicamentos (ver medicamentos.routes.js).
async function crearMedicamento(req, res) {
  const { nombre, categoria, precio, stock, esControlado } = req.body;

  if (!nombre || !nombre.trim() || !categoria || !categoria.trim() || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Nombre, categoría, precio y stock son obligatorios.' });
  }
  if (Number(precio) < 0 || Number(stock) < 0) {
    return res.status(400).json({ mensaje: 'El precio y el stock no pueden ser negativos.' });
  }

  const medicamento = await Medicamento.create({
    nombre: nombre.trim(),
    categoria: categoria.trim(),
    precio: Number(precio),
    stock: Number(stock),
    esControlado: !!esControlado,
  });

  res.status(201).json(medicamento);
}

async function actualizarMedicamento(req, res) {
  const { precio, stock, esControlado } = req.body;

  const medicamento = await Medicamento.findById(req.params.id);
  if (!medicamento) return res.status(404).json({ mensaje: 'Medicamento no encontrado.' });

  if (precio !== undefined) {
    if (Number(precio) < 0) return res.status(400).json({ mensaje: 'El precio no puede ser negativo.' });
    medicamento.precio = Number(precio);
  }
  if (stock !== undefined) {
    if (Number(stock) < 0) return res.status(400).json({ mensaje: 'El stock no puede ser negativo.' });
    medicamento.stock = Number(stock);
  }
  if (esControlado !== undefined) {
    medicamento.esControlado = !!esControlado;
  }

  await medicamento.save();
  res.json(medicamento);
}

async function eliminarMedicamento(req, res) {
  const medicamento = await Medicamento.findById(req.params.id);
  if (!medicamento) return res.status(404).json({ mensaje: 'Medicamento no encontrado.' });

  await medicamento.deleteOne();
  res.json({ mensaje: 'Medicamento eliminado.' });
}

module.exports = { getMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento };
