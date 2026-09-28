const request = require('supertest');
const app = require('../app');
const { conectar, limpiar, cerrar } = require('./setup');
const { generarToken } = require('./helpers');

const Usuario = require('../models/Usuario');
const Horario = require('../models/Horario');
const Cita = require('../models/Cita');
const Medicamento = require('../models/Medicamento');
const Receta = require('../models/Receta');
const Pedido = require('../models/Pedido');

beforeAll(async () => {
  await conectar();
});

afterEach(async () => {
  await limpiar();
});

afterAll(async () => {
  await cerrar();
});

async function crearPaciente(sufijo = '') {
  return Usuario.create({
    nombre: 'Paciente de prueba',
    usuario: `paciente.pedidos.test${sufijo}`,
    contrasena: 'hash-no-usado',
    rol: 'paciente',
  });
}

async function crearAdmin(sufijo = '') {
  return Usuario.create({
    nombre: 'Admin de prueba',
    usuario: `admin.pedidos.test${sufijo}`,
    contrasena: 'hash-no-usado',
    rol: 'admin',
  });
}

describe('POST /pedidos', () => {
  test('un paciente puede pedir un medicamento no controlado y el stock se descuenta', async () => {
    const paciente = await crearPaciente();
    const token = generarToken(paciente);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 10,
      esControlado: false,
    });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamento._id, cantidad: 3 });

    expect(res.status).toBe(201);
    expect(res.body.cantidad).toBe(3);

    const medicamentoActualizado = await Medicamento.findById(medicamento._id);
    expect(medicamentoActualizado.stock).toBe(7);
  });

  test('rechaza un pedido que excede el stock disponible', async () => {
    const paciente = await crearPaciente('2');
    const token = generarToken(paciente);

    const medicamento = await Medicamento.create({
      nombre: 'Ibuprofeno',
      categoria: 'Analgésico',
      precio: 25,
      stock: 5,
      esControlado: false,
    });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamento._id, cantidad: 10 });

    expect(res.status).toBe(409);

    const medicamentoSinCambios = await Medicamento.findById(medicamento._id);
    expect(medicamentoSinCambios.stock).toBe(5);
  });

  test('rechaza el pedido si falta el medicamento o la cantidad', async () => {
    const paciente = await crearPaciente('3');
    const token = generarToken(paciente);

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 0 });

    expect(res.status).toBe(400);
  });

  test('rechaza el pedido si el medicamento no existe', async () => {
    const paciente = await crearPaciente('4');
    const token = generarToken(paciente);
    const idInexistente = '650000000000000000000abc';

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: idInexistente, cantidad: 1 });

    expect(res.status).toBe(404);
  });

  test('rechaza pedir directamente un medicamento controlado (debe surtirse por receta)', async () => {
    const paciente = await crearPaciente('5');
    const token = generarToken(paciente);

    const medicamento = await Medicamento.create({
      nombre: 'Clonazepam',
      categoria: 'Controlado',
      precio: 50,
      stock: 20,
      esControlado: true,
    });

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ medicamentoId: medicamento._id, cantidad: 1 });

    expect(res.status).toBe(400);
  });
});

describe('POST /pedidos/desde-receta', () => {
  async function crearRecetaControlada(sufijo = '') {
    const doctor = await Usuario.create({
      nombre: 'Dra. Ana Torres',
      usuario: `doctor.pedidosreceta.test${sufijo}`,
      contrasena: 'hash-no-usado',
      rol: 'doctor',
    });
    const paciente = await crearPaciente(`receta${sufijo}`);

    const horario = await Horario.create({
      sucursal: 'Sucursal Centro',
      medico: doctor._id,
      fecha: new Date(),
      hora: '11:00',
      estado: 'ocupado',
    });

    const cita = await Cita.create({
      paciente: paciente._id,
      horario: horario._id,
      motivo: 'Consulta',
      estado: 'reservada',
    });

    const medicamento = await Medicamento.create({
      nombre: 'Clonazepam',
      categoria: 'Controlado',
      precio: 50,
      stock: 100,
      esControlado: true,
    });

    const receta = await Receta.create({
      cita: cita._id,
      paciente: paciente._id,
      emitidoPor: doctor._id,
      medicamento: medicamento._id,
      cantidad: 10,
      esControlado: true,
    });

    return { paciente, receta };
  }

  test('un paciente puede surtir una receta de un medicamento controlado', async () => {
    const { paciente, receta } = await crearRecetaControlada();
    const token = generarToken(paciente);

    const res = await request(app)
      .post('/api/pedidos/desde-receta')
      .set('Authorization', `Bearer ${token}`)
      .send({ recetaId: receta._id });

    expect(res.status).toBe(201);
    expect(res.body.esControlado).toBe(true);
    expect(res.body.cantidad).toBe(10);
  });

  test('rechaza surtir la misma receta dos veces', async () => {
    const { paciente, receta } = await crearRecetaControlada('2');
    const token = generarToken(paciente);

    await request(app)
      .post('/api/pedidos/desde-receta')
      .set('Authorization', `Bearer ${token}`)
      .send({ recetaId: receta._id });

    const res = await request(app)
      .post('/api/pedidos/desde-receta')
      .set('Authorization', `Bearer ${token}`)
      .send({ recetaId: receta._id });

    expect(res.status).toBe(409);
  });

  test('rechaza si falta el id de la receta', async () => {
    const paciente = await crearPaciente('6');
    const token = generarToken(paciente);

    const res = await request(app)
      .post('/api/pedidos/desde-receta')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('rechaza si la receta no existe', async () => {
    const paciente = await crearPaciente('7');
    const token = generarToken(paciente);
    const idInexistente = '650000000000000000000abc';

    const res = await request(app)
      .post('/api/pedidos/desde-receta')
      .set('Authorization', `Bearer ${token}`)
      .send({ recetaId: idInexistente });

    expect(res.status).toBe(404);
  });

  test('rechaza surtir una receta que pertenece a otro paciente', async () => {
    const { receta } = await crearRecetaControlada('8');
    const otroPaciente = await crearPaciente('9');
    const token = generarToken(otroPaciente);

    const res = await request(app)
      .post('/api/pedidos/desde-receta')
      .set('Authorization', `Bearer ${token}`)
      .send({ recetaId: receta._id });

    expect(res.status).toBe(403);
  });
});

describe('GET /pedidos/mios', () => {
  test('un paciente ve únicamente sus propios pedidos', async () => {
    const paciente = await crearPaciente('10');
    const token = generarToken(paciente);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 10,
      esControlado: false,
    });

    await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 2,
      esControlado: false,
      estado: 'pendiente',
    });

    const res = await request(app)
      .get('/api/pedidos/mios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /pedidos (admin)', () => {
  test('un admin ve todos los pedidos, y puede filtrar por estado', async () => {
    const admin = await crearAdmin();
    const paciente = await crearPaciente('11');
    const token = generarToken(admin);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 10,
      esControlado: false,
    });

    await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 2,
      esControlado: false,
      estado: 'pendiente',
    });
    await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 1,
      esControlado: false,
      estado: 'entregado',
    });

    const resTodos = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${token}`);
    expect(resTodos.status).toBe(200);
    expect(resTodos.body.length).toBe(2);

    const resFiltrados = await request(app)
      .get('/api/pedidos?estado=entregado')
      .set('Authorization', `Bearer ${token}`);
    expect(resFiltrados.status).toBe(200);
    expect(resFiltrados.body.length).toBe(1);
  });
});

describe('PUT /pedidos/:id (admin)', () => {
  test('un admin puede marcar un pedido como entregado', async () => {
    const admin = await crearAdmin('2');
    const paciente = await crearPaciente('12');
    const token = generarToken(admin);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 10,
      esControlado: false,
    });

    const pedido = await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 2,
      esControlado: false,
      estado: 'pendiente',
    });

    const res = await request(app)
      .put(`/api/pedidos/${pedido._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'entregado' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('entregado');
  });

  test('al cancelar un pedido se devuelve el stock reservado', async () => {
    const admin = await crearAdmin('3');
    const paciente = await crearPaciente('13');
    const token = generarToken(admin);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 7,
      esControlado: false,
    });

    const pedido = await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 3,
      esControlado: false,
      estado: 'pendiente',
    });

    const res = await request(app)
      .put(`/api/pedidos/${pedido._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'cancelado' });

    expect(res.status).toBe(200);

    const medicamentoActualizado = await Medicamento.findById(medicamento._id);
    expect(medicamentoActualizado.stock).toBe(10);
  });

  test('rechaza un estado inválido', async () => {
    const admin = await crearAdmin('4');
    const paciente = await crearPaciente('14');
    const token = generarToken(admin);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 10,
      esControlado: false,
    });

    const pedido = await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 2,
      esControlado: false,
      estado: 'pendiente',
    });

    const res = await request(app)
      .put(`/api/pedidos/${pedido._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'otro' });

    expect(res.status).toBe(400);
  });

  test('rechaza actualizar un pedido que ya fue procesado', async () => {
    const admin = await crearAdmin('5');
    const paciente = await crearPaciente('15');
    const token = generarToken(admin);

    const medicamento = await Medicamento.create({
      nombre: 'Paracetamol',
      categoria: 'Analgésico',
      precio: 20,
      stock: 10,
      esControlado: false,
    });

    const pedido = await Pedido.create({
      paciente: paciente._id,
      medicamento: medicamento._id,
      cantidad: 2,
      esControlado: false,
      estado: 'entregado',
    });

    const res = await request(app)
      .put(`/api/pedidos/${pedido._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'cancelado' });

    expect(res.status).toBe(400);
  });
});