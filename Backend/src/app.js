const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Datos simulados basados en la interfaz de Agendamiento
const horariosDisponibles = [
  { id: 1, hora: "08:00 AM", estado: "disponible" },
  { id: 2, hora: "08:30 AM", estado: "disponible" },
  { id: 3, hora: "09:00 AM", estado: "ocupado" },
  { id: 4, hora: "09:30 AM", estado: "disponible" },
  { id: 5, hora: "10:00 AM", estado: "expira_pronto", tiempoRestanteMin: 10 },
  { id: 6, hora: "10:30 AM", estado: "ocupado" },
  { id: 7, hora: "11:00 AM", estado: "disponible" },
  { id: 8, hora: "11:30 AM", estado: "disponible" }
];

app.get('/api/horarios', (req, res) => {
  res.json({ status: "success", data: horariosDisponibles });
});

app.post('/api/citas/bloquear', (req, res) => {
  const { horarioId } = req.body;
  const bloque = horariosDisponibles.find(h => h.id === horarioId);
  
  if (!bloque || bloque.estado !== 'disponible') {
    return res.status(400).json({ status: "error", message: "Horario no disponible para reserva." });
  }

  bloque.estado = "expira_pronto";
  bloque.tiempoRestanteMin = 10;
  
  res.json({ 
    status: "success", 
    message: "Horario bloqueado temporalmente por 10 minutos.",
    data: bloque 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});