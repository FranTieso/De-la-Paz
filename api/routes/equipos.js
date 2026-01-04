const express = require('express');
const auth = require('../middlewares/auth');
const { requireAnyRole, requireOwnTeamOrAdmin } = require("../middlewares/permissions");
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

// GET /api/equipos/categoria/:categoria - Obtener equipos por categoría
router.get('/categoria/:categoria', getEquiposByCategoria);

// GET /api/equipos/:id - Obtener un equipo por ID
router.get('/:id', getEquipoById);

// POST /api/equipos - Crear un nuevo equipo
router.post('/', auth, requireAnyRole("admin"), createEquipo);

// PUT /api/equipos/:id - Actualizar un equipo
router.put('/:id', auth, requireAnyRole("admin", "delegado"),
  requireOwnTeamOrAdmin, updateEquipo);

// DELETE /api/equipos/:id - Eliminar un equipo
router.delete('/:id', auth, requireAnyRole("admin"), deleteEquipo);

module.exports = router;
