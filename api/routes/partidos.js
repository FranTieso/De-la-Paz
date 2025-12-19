const express = require('express');
const router = express.Router();
const partidosController = require('../controllers/partidosController');

// Rutas
router.post('/batch', partidosController.crearPartidosBatch);
router.get('/liga/:ligaId', partidosController.getPartidosByLiga);
router.delete('/liga/:ligaId', partidosController.deletePartidosByLiga);

module.exports = router;
