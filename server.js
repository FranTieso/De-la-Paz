const express = require('express');
const errorHandler = require('./api/middlewares/errorHandler');
const apiRoutes = require('./api/routes');

const app = express();

// --- Middlewares ---
app.use(express.static('public'));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- API Routes ---
app.use('/api', apiRoutes);

// --- Manejo de errores ---
app.use(errorHandler);

// --- Puerto de escucha ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  console.log(`📱 Accede a tu web en http://localhost:${PORT}`);
  console.log(`🔌 API disponible en http://localhost:${PORT}/api`);
});
