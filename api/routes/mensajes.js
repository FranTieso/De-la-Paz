const express = require('express');
const auth = require('../middlewares/auth');
const { requireAnyRole } = require("../middlewares/permissions");
const router = express.Router();
const {
  getMensajes,
  getMensajeById,
  createMensaje,
  marcarComoLeido,
  deleteMensaje
} = require('../controllers/mensajesController');

// GET /api/mensajes - Obtener todos los mensajes (solo admin)
router.get('/', auth, requireAnyRole("admin"), getMensajes);

// GET /api/mensajes/:id - Obtener un mensaje por ID (solo admin)
router.get('/:id', auth, requireAnyRole("admin"), getMensajeById);

// POST /api/mensajes - Crear un nuevo mensaje (sin autenticación)
router.post('/', createMensaje);

// Endpoint de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'API de mensajes funcionando correctamente' });
});

// PUT /api/mensajes/:id/leido - Marcar mensaje como leído (solo admin)
router.put('/:id/leido', auth, requireAnyRole("admin"), marcarComoLeido);

// DELETE /api/mensajes/:id - Eliminar un mensaje (solo admin)
router.delete('/:id', auth, requireAnyRole("admin"), deleteMensaje);

module.exports = router;