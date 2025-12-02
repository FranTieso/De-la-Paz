const express = require('express');
const router = express.Router();
const {
  getEquipos,
  getEquipoById,
  getEquiposByCategoria,
  createEquipo,
  updateEquipo,
  deleteEquipo
} = require('../controllers/equiposController');

// GET /api/equipos - Obtener todos los equipos
router.get('/', getEquipos);

// GET /api/equipos/:id - Obtener un equipo por ID
router.get('/:id', getEquipoById);

// GET /api/equipos/categoria/:categoria - Obtener equipos por categoría
router.get('/categoria/:categoria', getEquiposByCategoria);

// POST /api/equipos - Crear un nuevo equipo
router.post('/', createEquipo);

// PUT /api/equipos/:id - Actualizar un equipo
router.put('/:id', updateEquipo);

// DELETE /api/equipos/:id - Eliminar un equipo
router.delete('/:id', deleteEquipo);

module.exports = router;
