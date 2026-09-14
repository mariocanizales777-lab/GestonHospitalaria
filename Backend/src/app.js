require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const citasRoutes = require('./routes/citas.routes');
const horariosRoutes = require('./routes/horarios.routes');
const devRoutes = require('./routes/dev.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/citas', citasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/dev', devRoutes);

connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));