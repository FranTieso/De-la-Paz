const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usuariosRoutes = require('./usuarios');
const equiposRoutes = require('./equipos');
const categoriasRoutes = require('./categorias');
const ligasRoutes = require('./ligas');

// Montar las rutas
router.use('/usuarios', usuariosRoutes);
router.use('/equipos', equiposRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/ligas', ligasRoutes);

// Ruta de bienvenida de la API
router.get('/', (req, res) => {
  res.json({
    message: 'API de Asociación de la Paz',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      equipos: '/api/equipos',
      categorias: '/api/categorias',
      ligas: '/api/ligas'
    }
  });
});

module.exports = router;
