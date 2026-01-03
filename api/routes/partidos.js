const express = require('express');
const router = express.Router();
const partidosController = require('../controllers/partidosController');

const auth = require('../middlewares/auth');
const { requireAnyRole } = require('../middlewares/permissions');

// Rutas públicas (solo lectura)
router.get('/liga/:ligaId', partidosController.getPartidosByLiga);
router.get('/nombre/:nombreLiga', partidosController.getPartidosByNombreLiga);

// Rutas protegidas (admin)
router.post('/', auth, requireAnyRole('admin'), partidosController.crearPartido);
router.post('/batch', auth, requireAnyRole('admin'), partidosController.crearPartidosBatch);
router.delete('/liga/:ligaId', auth, requireAnyRole('admin'), partidosController.deletePartidosByLiga);

module.exports = router;

