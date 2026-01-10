const express = require('express');
const router = express.Router();
const camposController = require('../controllers/camposController');

const auth = require('../middlewares/auth');
const { requireAnyRole } = require('../middlewares/permissions');

// Rutas públicas (solo lectura)
router.get('/', camposController.getCampos);
router.get('/:id', camposController.getCampoById);

// Rutas protegidas (admin)
router.post('/', auth, requireAnyRole('admin'), camposController.createCampo);
router.put('/:id', auth, requireAnyRole('admin'), camposController.updateCampo);
router.delete('/:id', auth, requireAnyRole('admin'), camposController.deleteCampo);

module.exports = router;
