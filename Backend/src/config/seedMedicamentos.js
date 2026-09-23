const Medicamento = require('../models/Medicamento');

// Mismo catálogo que antes vivía hardcodeado en el frontend (Medicamentos.jsx),
// ahora es la fuente real de verdad en la base de datos.
const CATALOGO_DEMO = [
  { nombre: 'Paracetamol 500mg', categoria: 'Analgésico', precio: 12.5, stock: 120, esControlado: false },
  { nombre: 'Ibuprofeno 400mg', categoria: 'Antiinflamatorio', precio: 18.9, stock: 80, esControlado: false },
  { nombre: 'Loratadina 10mg', categoria: 'Antialérgico', precio: 25.0, stock: 60, esControlado: false },
  { nombre: 'Omeprazol 20mg', categoria: 'Protector gástrico', precio: 32.0, stock: 90, esControlado: false },
  { nombre: 'Amoxicilina 500mg', categoria: 'Antibiótico', precio: 45.0, stock: 40, esControlado: false },
  { nombre: 'Tramadol 50mg', categoria: 'Analgésico controlado', precio: 60.0, stock: 15, esControlado: true },
  { nombre: 'Diazepam 10mg', categoria: 'Ansiolítico controlado', precio: 55.0, stock: 0, esControlado: true },
];

async function sembrarMedicamentos() {
  const existentes = await Medicamento.countDocuments();
  if (existentes > 0) return;

  await Medicamento.insertMany(CATALOGO_DEMO);
  console.log(`Se sembraron ${CATALOGO_DEMO.length} medicamentos de demo`);
}

module.exports = sembrarMedicamentos;
