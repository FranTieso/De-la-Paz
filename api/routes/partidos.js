const express = require('express');
const router = express.Router();
const partidosController = require('../controllers/partidosController');
const adminAuthMiddleware = require('../middlewares/adminAuth');

// Rutas públicas (solo lectura)
router.get('/liga/:ligaId', partidosController.getPartidosByLiga);
router.get('/nombre/:nombreLiga', partidosController.getPartidosByNombreLiga);

// Rutas protegidas (solo administradores)
router.post('/', adminAuthMiddleware, partidosController.crearPartido);
router.post('/batch', adminAuthMiddleware, partidosController.crearPartidosBatch);
router.delete('/liga/:ligaId', adminAuthMiddleware, partidosController.deletePartidosByLiga);

module.exports = router;
