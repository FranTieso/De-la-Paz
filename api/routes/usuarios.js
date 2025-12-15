const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario
} = require('../controllers/usuariosController');

// POST /api/usuarios/login - Login de usuario
router.post('/login', loginUsuario);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', getUsuarios);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', getUsuarioById);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', auth, createUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', auth, updateUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', auth, deleteUsuario);

module.exports = router;
