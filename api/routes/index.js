const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usuariosRoutes = require('./usuarios');
const equiposRoutes = require('./equipos');
const categoriasRoutes = require('./categorias');
const ligasRoutes = require('./ligas');
const jugadoresRoutes = require('./jugadores');
const partidosRoutes = require('./partidos');
const camposRoutes = require('./campos');
const resultadosRoutes = require('./resultados');
const clasificacionesRoutes = require('./clasificaciones');
const calendarioRoutes = require('./calendario');
const mensajesRoutes = require('./mensajes');


// Montar las rutas
router.use('/usuarios', usuariosRoutes);
router.use('/equipos', equiposRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/ligas', ligasRoutes);
router.use('/jugadores', jugadoresRoutes);
router.use('/partidos', partidosRoutes);
router.use('/campos', camposRoutes);
router.use('/resultados', resultadosRoutes);
router.use('/clasificaciones', clasificacionesRoutes);
router.use('/calendario', calendarioRoutes);
router.use('/mensajes', mensajesRoutes);


// Ruta de bienvenida de la API
router.get('/', (req, res) => {
  res.json({
    message: 'API de Asociación de la Paz',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      equipos: '/api/equipos',
      categorias: '/api/categorias',
      ligas: '/api/ligas',
      jugadores: '/api/jugadores',
      partidos: '/api/partidos',
      campos: '/api/campos',
      resultados: '/api/resultados',
      clasificaciones: '/api/clasificaciones',
      mensajes: '/api/mensajes'
    }
  });
});

module.exports = router;
