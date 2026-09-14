const Horario = require('../models/Horario');

const MEDICO_DEMO = '650000000000000000000001';
const SUCURSAL_DEMO = 'Sucursal Norte';
const HORAS_DEMO = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];

async function sembrarHorariosDeHoy() {
  const hoy = new Date(new Date().toDateString()); // medianoche de hoy, sin hora

  const existentes = await Horario.countDocuments({ fecha: hoy });
  if (existentes > 0) return; // ya hay horarios de hoy, no dupliques

  const horarios = HORAS_DEMO.map((hora) => ({
    sucursal: SUCURSAL_DEMO,
    medico: MEDICO_DEMO,
    fecha: hoy,
    hora,
    estado: 'disponible',
  }));

  await Horario.insertMany(horarios);
  console.log(`Se sembraron ${horarios.length} horarios de demo para hoy`);
}

module.exports = sembrarHorariosDeHoy;