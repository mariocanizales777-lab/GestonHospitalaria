const request = require('supertest');
const app = require('../app');
const { conectar, limpiar, cerrar } = require('./setup');
const { generarToken } = require('./helpers');

const Usuario = require('../models/Usuario');
const Horario = require('../models/Horario');
const Cita = require('../models/Cita');

beforeAll(async () => {
  await conectar();
});

afterEach(async () => {
  await limpiar();
});

afterAll(async () => {
  await cerrar();
});

async function crearEscenarioBase() {
  const doctor = await Usuario.create({
    nombre: 'Dra. Ana Torres',
    usuario: 'doctor.citas.test',
    contrasena: 'hash-no-usado',
    rol: 'doctor',
  });

  const paciente1 = await Usuario.create({
    nombre: 'Paciente Uno',
    usuario: 'paciente1.citas.test',
    contrasena: 'hash-no-usado',
    rol: 'paciente',
  });

  const paciente2 = await Usuario.create({
    nombre: 'Paciente Dos',
    usuario: 'paciente2.citas.test',
    contrasena: 'hash-no-usado',
    rol: 'paciente',
  });

  const horario = await Horario.create({
    sucursal: 'Sucursal Centro',
    medico: doctor._id,
    fecha: new Date(),
    hora: '09:00',
    estado: 'disponible',
  });

  return { doctor, paciente1, paciente2, horario };
}

describe('POST /citas', () => {
  test('un paciente puede agendar un horario disponible', async () => {
    const { paciente1, horario } = await crearEscenarioBase();
    const token = generarToken(paciente1);

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ horarioId: horario._id, motivo: 'Dolor de cabeza' });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('reservada');
  });

  test('rechaza agendar un horario que ya fue tomado por otro paciente', async () => {
    const { paciente1, paciente2, horario } = await crearEscenarioBase();
    const token1 = generarToken(paciente1);
    const token2 = generarToken(paciente2);

    await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token1}`)
      .send({ horarioId: horario._id, motivo: 'Dolor de cabeza' });

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token2}`)
      .send({ horarioId: horario._id, motivo: 'Revisión' });

    expect(res.status).toBe(409);
  });
});

describe('POST /citas — validaciones', () => {
  test('rechaza agendar sin motivo', async () => {
    const { paciente1, horario } = await crearEscenarioBase();
    const token = generarToken(paciente1);

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ horarioId: horario._id, motivo: '' });

    expect(res.status).toBe(400);
  });

  test('rechaza agendar un horario que no existe', async () => {
    const { paciente1 } = await crearEscenarioBase();
    const token = generarToken(paciente1);
    const idInexistente = '650000000000000000000abc';

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ horarioId: idInexistente, motivo: 'Consulta' });

    expect(res.status).toBe(404);
  });
});

describe('GET /citas/mias', () => {
  test('un paciente ve únicamente sus propias citas', async () => {
    const { paciente1, horario } = await crearEscenarioBase();
    const token1 = generarToken(paciente1);

    await Cita.create({
      paciente: paciente1._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'reservada',
    });

    const res = await request(app)
      .get('/api/citas/mias')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].motivo).toBe('Consulta');
  });
});

describe('GET /citas/mi-agenda', () => {
  test('un doctor ve las citas agendadas en sus horarios', async () => {
    const { doctor, paciente1, horario } = await crearEscenarioBase();
    const tokenDoctor = generarToken(doctor);

    await Cita.create({
      paciente: paciente1._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'reservada',
    });

    const res = await request(app)
      .get('/api/citas/mi-agenda')
      .set('Authorization', `Bearer ${tokenDoctor}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].paciente.nombre).toBe('Paciente Uno');
  });
});

describe('PUT /citas/:id', () => {
  test('un paciente puede modificar el motivo de su propia cita', async () => {
    const { paciente1, horario } = await crearEscenarioBase();
    const token1 = generarToken(paciente1);

    const cita = await Cita.create({
      paciente: paciente1._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'reservada',
    });

    const res = await request(app)
      .put(`/api/citas/${cita._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ motivo: 'Consulta de seguimiento' });

    expect(res.status).toBe(200);
    expect(res.body.motivo).toBe('Consulta de seguimiento');
  });

  test('rechaza modificar una cita ya cancelada', async () => {
    const { paciente1, horario } = await crearEscenarioBase();
    const token1 = generarToken(paciente1);

    const cita = await Cita.create({
      paciente: paciente1._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'cancelada',
    });

    const res = await request(app)
      .put(`/api/citas/${cita._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ motivo: 'Otro motivo' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /citas/:id/cancelar', () => {
  test('un paciente no puede cancelar la cita de otro paciente', async () => {
    const { paciente1, paciente2, horario } = await crearEscenarioBase();
    const token2 = generarToken(paciente2);

    const cita = await Cita.create({
      paciente: paciente1._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'reservada',
    });

    const res = await request(app)
      .put(`/api/citas/${cita._id}/cancelar`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });

  test('un paciente sí puede cancelar su propia cita', async () => {
    const { paciente1, horario } = await crearEscenarioBase();
    const token1 = generarToken(paciente1);

    const cita = await Cita.create({
      paciente: paciente1._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'reservada',
    });

    const res = await request(app)
      .put(`/api/citas/${cita._id}/cancelar`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cancelada');
  });
});