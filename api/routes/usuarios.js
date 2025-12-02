const express = require('express');
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
} = require('../controllers/usuariosController');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', getUsuarios);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', getUsuarioById);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', createUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', updateUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', deleteUsuario);

module.exports = router;
