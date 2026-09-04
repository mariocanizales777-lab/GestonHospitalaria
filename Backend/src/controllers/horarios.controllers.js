const Horario = require('../models/Horario');

async function getHorarios(req, res) {
  const { sucursal, fecha } = req.query;
  const filtro = { estado: 'disponible' };
  if (sucursal) filtro.sucursal = sucursal;
  if (fecha) filtro.fecha = new Date(fecha);
  const horarios = await Horario.find(filtro).sort({ hora: 1 });
  res.json(horarios);
}

async function crearHorario(req, res) {
  const { sucursal, medico, fecha, hora } = req.body;
  const horario = await Horario.create({ sucursal, medico, fecha, hora });
  res.status(201).json(horario);
}

async function editarHorario(req, res) {
  const horario = await Horario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado' });
  res.json(horario);
}

module.exports = { getHorarios, crearHorario, editarHorario };