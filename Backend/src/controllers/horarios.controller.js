const Horario = require('../models/Horario');
const sembrarHorariosDeHoy = require('../config/seed');

async function getHorarios(req, res) {
  await sembrarHorariosDeHoy();

  const { sucursal, fecha } = req.query;
  const filtro = {};
  if (sucursal) filtro.sucursal = sucursal;
  if (fecha) filtro.fecha = new Date(fecha);
  const horarios = await Horario.find(filtro).sort({ hora: 1 });
  res.json(horarios);
}

async function crearHorario(req, res) {
  const { sucursal, medico, fecha, hora } = req.body;

  const hoy = new Date();
  const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  if (fecha < hoyISO) {
    return res.status(400).json({ mensaje: 'No se pueden crear horarios en el pasado' });
  }
  const yaExiste = await Horario.findOne({ sucursal, medico, fecha, hora });
  if (yaExiste) {
    return res.status(409).json({ mensaje: 'Ya existe un horario para esa sucursal, médico, fecha y hora' });
  }

  const horario = await Horario.create({ sucursal, medico, fecha, hora });
  res.status(201).json(horario);
}

async function editarHorario(req, res) {
  const horario = await Horario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado' });
  res.json(horario);
}

module.exports = { getHorarios, crearHorario, editarHorario };