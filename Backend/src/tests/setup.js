const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function conectar() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

async function limpiar() {
  const colecciones = mongoose.connection.collections;
  for (const key in colecciones) {
    await colecciones[key].deleteMany({});
  }
}

async function cerrar() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

module.exports = { conectar, limpiar, cerrar };
