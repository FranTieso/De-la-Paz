const express = require('express');
const router = express.Router();
const {
  getJugadores,
  getJugadoresByEquipo,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador
} = require('../controllers/jugadoresController');

// GET /api/jugadores - Obtener todos los jugadores
router.get('/', getJugadores);

// GET /api/jugadores/equipo/:equipo - Obtener jugadores por equipo
router.get('/equipo/:equipo', getJugadoresByEquipo);

// GET /api/jugadores/:id - Obtener un jugador por ID
router.get('/:id', getJugadorById);

// POST /api/jugadores - Crear un nuevo jugador
router.post('/', createJugador);

// PUT /api/jugadores/:id - Actualizar un jugador
router.put('/:id', updateJugador);

// DELETE /api/jugadores/:id - Eliminar un jugador
router.delete('/:id', deleteJugador);

module.exports = router;