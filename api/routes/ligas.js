const express = require('express');
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

// POST /api/ligas - Crear una nueva liga
router.post('/', createLiga);

// PUT /api/ligas/:id - Actualizar una liga
router.put('/:id', updateLiga);

// DELETE /api/ligas/:id - Eliminar una liga
router.delete('/:id', deleteLiga);

module.exports = router;
