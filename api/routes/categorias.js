const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} = require('../controllers/categoriasController');

// GET /api/categorias - Obtener todas las categorías
router.get('/', getCategorias);

// GET /api/categorias/:id - Obtener una categoría por ID
router.get('/:id', getCategoriaById);

// POST /api/categorias - Crear una nueva categoría
router.post('/', auth, createCategoria);

// PUT /api/categorias/:id - Actualizar una categoría
router.put('/:id', auth, updateCategoria);

// DELETE /api/categorias/:id - Eliminar una categoría
router.delete('/:id', auth, deleteCategoria);

module.exports = router;
