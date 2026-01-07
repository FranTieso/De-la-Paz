const express = require('express');
const router = express.Router();

const clasificacionesController = require('../controllers/clasificacionesController');

// Rutas públicas (solo lectura)
router.get('/liga/:ligaId', clasificacionesController.getClasificacionByLiga);

module.exports = router;
