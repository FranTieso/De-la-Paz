// api/routes/jugadores.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { requireAnyRole } = require("../middlewares/permissions");

const {
  getJugadores,
  getJugadoresByEquipo,
  getJugadoresByCategoria,
  getJugadoresBySexo,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador,
  migrarEquipoId
} = require("../controllers/jugadoresController");

// Log de carga de rutas (comprobación por fallos)

// GET /api/jugadores/equipo/:equipo (público para árbitros)
router.get("/equipo/:equipo", getJugadoresByEquipo);

// GET /api/jugadores/categoria/:categoria (público)
router.get("/categoria/:categoria", getJugadoresByCategoria);

// GET /api/jugadores/sexo/:sexo (público)
router.get("/sexo/:sexo", getJugadoresBySexo);

// GET /api/jugadores  (admin/delegado -> todos, entrenador -> solo su equipo)
router.get("/", auth, requireAnyRole("admin", "delegado", "entrenador"), getJugadores);

// MIGRACIÓN (endpoint temporal) - POST /api/jugadores/migracion/equipo-id
router.post("/migracion/equipo-id", auth, requireAnyRole("admin"), migrarEquipoId);

// GET /api/jugadores/:id (admin/delegado -> cualquiera, entrenador -> solo si es de su equipo)
router.get("/:id", auth, requireAnyRole("admin", "delegado", "entrenador"), getJugadorById);

// POST /api/jugadores (solo admin/delegado)
router.post("/", auth, requireAnyRole("admin", "delegado"), createJugador);

// PUT /api/jugadores/:id
// - admin/delegado: pueden actualizar (excepto EQUIPO/EQUIPO_ID por seguridad)
// - entrenador: SOLO MAIL, MOVIL, DORSAL, POSICION, ESTADO y solo si es su equipo
// - arbitro: SOLO ESTADO (para sanciones)
router.put("/:id", auth, requireAnyRole("admin", "administrador", "delegado", "entrenador", "arbitro"), updateJugador);

// DELETE /api/jugadores/:id (solo admin/delegado)
router.delete("/:id", auth, requireAnyRole("admin", "administrador", "delegado"), deleteJugador);

module.exports = router;
