const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const {
  getLigas,
  getLigaById,
  createLiga,
  updateLiga,
  deleteLiga
} = require('../controllers/ligasController');

// GET /api/ligas - Obtener todas las ligas
router.get('/', getLigas);

// GET /api/ligas/:id - Obtener una liga por ID
router.get('/:id', getLigaById);

// POST /api/ligas - Crear una nueva liga (protegido)
router.post('/', auth, createLiga);

// PUT /api/ligas/:id - Actualizar una liga (protegido)
router.put('/:id', auth, updateLiga);

// DELETE /api/ligas/:id - Eliminar una liga (protegido)
router.delete('/:id', auth, deleteLiga);

module.exports = router;
