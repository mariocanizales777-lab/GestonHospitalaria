const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// Único usuario "de fábrica" que queda: el admin inicial. Es necesario
// porque alguien tiene que existir para poder entrar por primera vez y dar
// de alta doctores y medicamentos desde el panel de Admin.
//
// A partir de aquí, todo lo demás se crea desde la propia aplicación:
// - Los pacientes se registran ellos mismos en /registro.
// - Los doctores los da de alta este admin en Admin > Doctores (con su
//   propio usuario y contraseña).
// - Los medicamentos los da de alta este admin en Admin > Medicamentos.
//
// El doctor de demostración (Dra. Ana Torres) se deja porque ya tiene
// horarios y citas de ejemplo enlazados a su cuenta, y sirve como doctor real
// para que el profesor pueda probar el flujo de citas sin tener que crear uno
// primero. Su contraseña también se cambió a una menos obvia que "1234".
const USUARIOS_INICIALES = [
  { _id: '650000000000000000000001', nombre: 'Dra. Ana Torres', usuario: 'doctor', contrasena: 'Doctor#2026', rol: 'doctor' },
  { _id: '650000000000000000000002', nombre: 'Administrador General', usuario: 'admin', contrasena: 'FarmaAdmin#2026', rol: 'admin' },
];

async function sembrarUsuarios() {
  for (const u of USUARIOS_INICIALES) {
    const existente = await Usuario.findById(u._id);
    if (existente) continue;

    const contrasenaHasheada = await bcrypt.hash(u.contrasena, 10);
    await Usuario.create({ ...u, contrasena: contrasenaHasheada });
  }
}

module.exports = sembrarUsuarios;
