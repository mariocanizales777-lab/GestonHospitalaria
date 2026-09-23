const Usuario = require('../models/Usuario');

// IDs fijos para que el flujo "Actuar como" (sin login) siempre sepa a qué
// usuario demo apuntar. El id de doctor coincide con el MEDICO_DEMO que ya
// usa seed.js para los horarios, así que todo queda consistente.
const USUARIOS_DEMO = [
  { _id: '650000000000000000000099', nombre: 'Paciente Demo', rol: 'paciente' },
  { _id: '650000000000000000000001', nombre: 'Dra. Ana Torres', rol: 'doctor' },
  { _id: '650000000000000000000002', nombre: 'Admin Demo', rol: 'admin' },
];

async function sembrarUsuarios() {
  // upsert idempotente: no duplica en reinicios y no falla si ya existen.
  await Promise.all(
    USUARIOS_DEMO.map((u) =>
      Usuario.findByIdAndUpdate(u._id, u, { upsert: true, setDefaultsOnInsert: true })
    )
  );
}

module.exports = sembrarUsuarios;
