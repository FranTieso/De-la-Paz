const express = require('express');
const router = express.Router();
const partidosController = require('../controllers/partidosController');

const auth = require('../middlewares/auth');
const { requireAnyRole } = require('../middlewares/permissions');

// Rutas públicas (solo lectura)
router.get('/liga/:ligaId', partidosController.getPartidosByLiga);
router.get('/nombre/:nombreLiga', partidosController.getPartidosByNombreLiga);

// Rutas protegidas (admin)
router.post('/', auth, requireAnyRole('admin', 'administrador'), partidosController.crearPartido);
router.post('/batch', auth, requireAnyRole('admin', 'administrador'), partidosController.crearPartidosBatch);
router.put('/:id', auth, requireAnyRole('admin', 'administrador'), partidosController.updatePartido);
router.delete('/liga/:ligaId', auth, requireAnyRole('admin', 'administrador'), partidosController.deletePartidosByLiga);

module.exports = router;

