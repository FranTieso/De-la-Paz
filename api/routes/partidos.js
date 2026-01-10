const express = require('express');
const router = express.Router();
const {
  crearPartido,
  crearPartidosBatch,
  getPartidosByLiga,
  getPartidosByNombreLiga,
  getPartidoById,
  getPartidosByArbitro,
  deletePartidosByLiga,
  updatePartido
} = require('../controllers/partidosController');

const auth = require('../middlewares/auth');
const { requireAnyRole } = require('../middlewares/permissions');

// Rutas públicas (solo lectura)
router.get('/liga/:ligaId', getPartidosByLiga);
router.get('/nombre/:nombreLiga', getPartidosByNombreLiga);
router.get('/arbitro/:arbitroId', getPartidosByArbitro);
router.get('/:id', getPartidoById);

// Rutas protegidas (admin y árbitros para actualizar)
router.post('/', auth, requireAnyRole('admin', 'administrador'), crearPartido);
router.post('/batch', auth, requireAnyRole('admin', 'administrador'), crearPartidosBatch);
router.put('/:id', auth, requireAnyRole('admin', 'administrador', 'arbitro'), updatePartido);
router.delete('/liga/:ligaId', auth, requireAnyRole('admin', 'administrador'), deletePartidosByLiga);

module.exports = router;

