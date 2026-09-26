require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const citasRoutes = require('./routes/citas.routes');
const horariosRoutes = require('./routes/horarios.routes');
const medicamentosRoutes = require('./routes/medicamentos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const recetasRoutes = require('./routes/recetas.routes');
const devRoutes = require('./routes/dev.routes');
const reportesRoutes = require('./routes/reportes.routes');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/citas', citasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
