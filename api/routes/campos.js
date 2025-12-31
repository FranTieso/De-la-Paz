const express = require('express');
const router = express.Router();
const camposController = require('../controllers/camposController');
const adminAuthMiddleware = require('../middlewares/adminAuth');

// Rutas públicas (solo lectura)
router.get('/', camposController.getCampos);
router.get('/:id', camposController.getCampoById);

// Rutas protegidas (requieren autenticación de administrador)
router.post('/', adminAuthMiddleware, camposController.createCampo);
router.put('/:id', adminAuthMiddleware, camposController.updateCampo);
router.delete('/:id', adminAuthMiddleware, camposController.deleteCampo);

module.exports = router;