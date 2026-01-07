const express = require('express');
const router = express.Router();

const resultadosController = require('../controllers/resultadosController');

// Rutas públicas (solo lectura)
router.get('/', resultadosController.getResultados);
router.get('/liga/:ligaId', resultadosController.getResultadosByLiga);

module.exports = router;
      