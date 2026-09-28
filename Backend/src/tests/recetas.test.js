const request = require('supertest');
const app = require('../app');
const { conectar, limpiar, cerrar } = require('./setup');
const { generarToken } = require('./helpers');

const Usuario = require('../models/Usuario');
const Horario = require('../models/Horario');
const Cita = require('../models/Cita');
const Medicamento = require('../models/Medicamento');
const Receta = require('../models/Receta');

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
    usuario: 'doctor.recetas.test',
    contrasena: 'hash-no-usado',
    rol: 'doctor',
  });

  const otroDoctor = await Usuario.create({
    nombre: 'Dr. Otro',
    usuario: 'otrodoctor.recetas.test',
    contrasena: 'hash-no-usado',
    rol: 'doctor',
  });

  const paciente = await Usuario.create({
    nombre: 'Paciente de prueba',
    usuario: 'paciente.recetas.test',
    contrasena: 'hash-no-usado',
    rol: 'paciente',
  });

  const horario = await Horario.create({
    sucursal: 'Sucursal Centro',
    medico: doctor._id,
    fecha: new Date(),
    hora: '10:00',
    estado: 'ocupado',
  });

  const cita = await Cita.create({
    paciente: paciente._id,
    horario: horario._id,
    motivo: 'Consulta general',
    estado: 'reservada',
  });

  const medicamentoControlado = await Medicamento.create({
    nombre: 'Clonazepam',
    categoria: 'Controlado',
    precio: 50,
    stock: 100,
    esControlado: true,
  });

  return { doctor, otroDoctor, paciente, cita, medicamentoControlado };
}

describe('POST /citas/:id/receta', () => {
  test('el doctor asignado puede recetar un medicamento controlado dentro del límite', async () => {
    const { doctor, cita, medicamentoControlado } = await crearEscenarioBase();
    const token = generarToken(doctor);

    const res = await request(app)
      .post(`/api/citas/${cita._id}/receta`)
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamentoControlado._id, cantidad: 20 });

    expect(res.status).toBe(201);
    expect(res.body.cantidad).toBe(20);
    expect(res.body.esControlado).toBe(true);
  });

  test('rechaza recetar más de 30 unidades de un medicamento controlado', async () => {
    const { doctor, cita, medicamentoControlado } = await crearEscenarioBase();
    const token = generarToken(doctor);

    const res = await request(app)
      .post(`/api/citas/${cita._id}/receta`)
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamentoControlado._id, cantidad: 31 });

    expect(res.status).toBe(400);
  });

  test('rechaza una receta duplicada del mismo controlado dentro del periodo de cooldown', async () => {
    const { doctor, cita, medicamentoControlado } = await crearEscenarioBase();
    const token = generarToken(doctor);

    await request(app)
      .post(`/api/citas/${cita._id}/receta`)
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamentoControlado._id, cantidad: 10 });

    const res = await request(app)
      .post(`/api/citas/${cita._id}/receta`)
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamentoControlado._id, cantidad: 10 });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/últimos/i);
  });

  test('rechaza a un doctor que no está asignado a la cita', async () => {
    const { otroDoctor, cita, medicamentoControlado } = await crearEscenarioBase();
    const token = generarToken(otroDoctor);

    const res = await request(app)
      .post(`/api/citas/${cita._id}/receta`)
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamentoControlado._id, cantidad: 5 });

    expect(res.status).toBe(403);
  });
});

describe('POST /citas/:id/receta — validaciones', () => {
  test('rechaza si falta el medicamento o la cantidad es inválida', async () => {
    const { doctor, cita } = await crearEscenarioBase();
    const token = generarToken(doctor);

    const res = await request(app)
      .post(`/api/citas/${cita._id}/receta`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 0 });

    expect(res.status).toBe(400);
  });
});

describe('GET /recetas/mias', () => {
  test('un paciente ve sus propias recetas', async () => {
    const { doctor, paciente, cita, medicamentoControlado } = await crearEscenarioBase();
    const tokenPaciente = generarToken(paciente);

    await Receta.create({
      cita: cita._id,
      paciente: paciente._id,
      emitidoPor: doctor._id,
      medicamento: medicamentoControlado._id,
      cantidad: 15,
      esControlado: true,
    });

    const res = await request(app)
      .get('/api/recetas/mias')
      .set('Authorization', `Bearer ${tokenPaciente}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].cantidad).toBe(15);
  });
});

describe('GET /citas/:id/recetas', () => {
  test('devuelve las recetas emitidas en una cita específica', async () => {
    const { doctor, paciente, cita, medicamentoControlado } = await crearEscenarioBase();
    const tokenDoctor = generarToken(doctor);

    await Receta.create({
      cita: cita._id,
      paciente: paciente._id,
      emitidoPor: doctor._id,
      medicamento: medicamentoControlado._id,
      cantidad: 12,
      esControlado: true,
    });

    const res = await request(app)
      .get(`/api/citas/${cita._id}/recetas`)
      .set('Authorization', `Bearer ${tokenDoctor}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].medicamento.nombre).toBe('Clonazepam');
  });
});

describe('GET /recetas/paciente/:pacienteId', () => {
  test('un doctor ve el historial de recetas que él mismo emitió a un paciente', async () => {
    const { doctor, paciente, cita, medicamentoControlado } = await crearEscenarioBase();
    const tokenDoctor = generarToken(doctor);

    await Receta.create({
      cita: cita._id,
      paciente: paciente._id,
      emitidoPor: doctor._id,
      medicamento: medicamentoControlado._id,
      cantidad: 8,
      esControlado: true,
    });

    const res = await request(app)
      .get(`/api/recetas/paciente/${paciente._id}`)
      .set('Authorization', `Bearer ${tokenDoctor}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});