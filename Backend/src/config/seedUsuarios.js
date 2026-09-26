const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// IDs fijos para que todo lo demás (horarios, citas demo) siga apuntando
// consistentemente a estos mismos usuarios.
const USUARIOS_DEMO = [
  { _id: '650000000000000000000099', nombre: 'Paciente Demo', usuario: 'paciente', contrasena: '1234', rol: 'paciente' },
  { _id: '650000000000000000000001', nombre: 'Dra. Ana Torres', usuario: 'doctor', contrasena: '1234', rol: 'doctor' },
  { _id: '650000000000000000000002', nombre: 'Admin Demo', usuario: 'admin', contrasena: '1234', rol: 'admin' },
];

async function sembrarUsuarios() {
  for (const u of USUARIOS_DEMO) {
    const existente = await Usuario.findById(u._id);
    if (existente) continue;

    const contrasenaHasheada = await bcrypt.hash(u.contrasena, 10);
    await Usuario.create({ ...u, contrasena: contrasenaHasheada });
  }
}

module.exports = sembrarUsuarios;
