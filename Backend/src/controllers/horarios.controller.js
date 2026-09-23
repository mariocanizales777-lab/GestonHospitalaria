const Horario = require('../models/Horario');
const Usuario = require('../models/Usuario');
const sembrarHorariosDeHoy = require('../config/seed');

async function getHorarios(req, res) {
  await sembrarHorariosDeHoy();

  const { sucursal, fecha, medico } = req.query;
  const filtro = {};
  if (sucursal) filtro.sucursal = sucursal;
  if (fecha) filtro.fecha = new Date(fecha);
  if (medico) filtro.medico = medico;
  const horarios = await Horario.find(filtro).populate('medico').sort({ hora: 1 });
  res.json(horarios);
}

async function crearHorario(req, res) {
  const { sucursal, medico, fecha, hora } = req.body;

  if (!sucursal || !medico || !fecha || !hora) {
    return res.status(400).json({ mensaje: 'Sucursal, médico, fecha y hora son obligatorios' });
  }

  const doctor = await Usuario.findById(medico);
  if (!doctor || doctor.rol !== 'doctor') {
    return res.status(400).json({ mensaje: 'El médico indicado no existe o no tiene rol de doctor' });
  }

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
  // Solo se permite reprogramar hora/sucursal de un horario aún disponible;
  // uno ya ocupado tiene una cita real detrás y no se debe mover por debajo del paciente.
  const horario = await Horario.findById(req.params.id);
  if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado' });
  if (horario.estado === 'ocupado') {
    return res.status(400).json({ mensaje: 'No se puede editar un horario ocupado; cancela la cita primero' });
  }

  const { sucursal, hora, fecha } = req.body;
  if (sucursal) horario.sucursal = sucursal;
  if (hora) horario.hora = hora;
  if (fecha) horario.fecha = fecha;
  await horario.save();

  res.json(horario);
}

async function eliminarHorario(req, res) {
  const horario = await Horario.findById(req.params.id);
  if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado' });
  if (horario.estado === 'ocupado') {
    return res.status(400).json({ mensaje: 'No se puede eliminar un horario ocupado; cancela la cita primero' });
  }

  await horario.deleteOne();
  res.json({ mensaje: 'Horario eliminado' });
}

module.exports = { getHorarios, crearHorario, editarHorario, eliminarHorario };
