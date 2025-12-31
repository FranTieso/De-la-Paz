const express = require('express');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const router = express.Router();
const {
  getLigas,
  getLigaById,
  createLiga,
  updateLiga,
  deleteLiga
} = require('../controllers/ligasController');

// GET /api/ligas - Obtener todas las ligas (público)
router.get('/', getLigas);

// GET /api/ligas/:id - Obtener una liga por ID (público)
router.get('/:id', getLigaById);

// POST /api/ligas - Crear una nueva liga (solo administradores)
router.post('/', adminAuthMiddleware, createLiga);

// PUT /api/ligas/:id - Actualizar una liga (solo administradores)
router.put('/:id', adminAuthMiddleware, updateLiga);

// DELETE /api/ligas/:id - Eliminar una liga (solo administradores)
router.delete('/:id', adminAuthMiddleware, deleteLiga);

module.exports = router;
