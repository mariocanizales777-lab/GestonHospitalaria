const mongoose = require('mongoose');
const sembrarUsuarios = require('./seedUsuarios');
const sembrarHorariosDeHoy = require('./seed');
const sembrarMedicamentos = require('./seedMedicamentos');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');
    // Orden importa: los horarios de demo referencian al doctor demo,
    // así que los usuarios deben sembrarse primero.
    await sembrarUsuarios();
    await sembrarHorariosDeHoy();
    await sembrarMedicamentos();
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
