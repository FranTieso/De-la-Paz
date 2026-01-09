const express = require('express');
const auth = require('../middlewares/auth');
const { requireAnyRole } = require("../middlewares/permissions");
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

// POST /api/ligas - Crear una nueva liga (protegido)
router.post('/', auth, requireAnyRole("admin", "administrador"), createLiga);

// PUT /api/ligas/:id - Actualizar una liga (protegido)
router.put('/:id', auth, requireAnyRole("admin", "administrador"), updateLiga);

// DELETE /api/ligas/:id - Eliminar una liga (protegido)
router.delete('/:id', auth, requireAnyRole("admin", "administrador"), deleteLiga);

module.exports = router;
