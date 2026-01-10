require('dotenv').config();

const express = require('express');
const errorHandler = require('./api/middlewares/errorHandler');
const apiRoutes = require('./api/routes');

const app = express();

// --- Middlewares ---
app.use(express.static('public'));
app.use(express.json());

// --- API Routes ---
app.use('/api', apiRoutes);

// --- Manejo de errores ---
app.use(errorHandler);

// --- Puerto de escucha ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
