const express = require('express');
const auth = require('../middlewares/auth');
const { requireAnyRole } = require("../middlewares/permissions");
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  migrarRolesEquipos, 
  updateUsuarioContacto
} = require('../controllers/usuariosController');

// POST /api/usuarios/login - Login de usuario
router.post('/login', loginUsuario);

// PATCH /api/usuarios/:id/contacto - Editar solo mail/movil (admin o entrenador/delegado de su equipo)
router.patch('/:id/contacto', auth, requireAnyRole("admin", "entrenador", "delegado"), updateUsuarioContacto);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', auth, getUsuarios);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', auth, getUsuarioById);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', auth, requireAnyRole("admin"), createUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', auth, requireAnyRole("admin"), updateUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', auth, requireAnyRole("admin"), deleteUsuario);

// POST /api/usuarios/migracion/roles-equipos - Migrar roles de equipos a usuarios (endpoint temporal de mantenimiento)
router.post('/migracion/roles-equipos', auth, requireAnyRole('admin'), migrarRolesEquipos);

module.exports = router;
