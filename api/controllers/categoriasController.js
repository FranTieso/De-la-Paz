// api/controllers/categoriasController.js
const categoriasService = require('../services/categorias.service')

// GET /api/categorias
const getCategorias = async (req, res, next) => {
  try {
    const categorias = await categoriasService.obtenerCategorias()
    res.status(200).json(categorias)
  } catch (error) {
    next(error)
  }
}

// GET /api/categorias/:id
const getCategoriaById = async (req, res, next) => {
  try {
    const { id } = req.params
    const categoria = await categoriasService.obtenerCategoriaPorId(id)

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    res.status(200).json(categoria)
  } catch (error) {
    next(error)
  }
}

// POST /api/categorias
const createCategoria = async (req, res, next) => {
  try {
    const { NOMBRE } = req.body

    if (!NOMBRE) {
      return res.status(400).json({
        error: 'El campo NOMBRE es obligatorio.'
      })
    }

    const nuevaCategoria = await categoriasService.crearCategoria(req.body)

    res.status(201).json({
      message: 'Categoría creada con éxito',
      ...nuevaCategoria
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/categorias/:id
const updateCategoria = async (req, res, next) => {
  try {
    const { id } = req.params

    const updated = await categoriasService.actualizarCategoria(id, req.body)

    if (!updated) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    res.status(200).json({ message: 'Categoría actualizada con éxito', id })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/categorias/:id
const deleteCategoria = async (req, res, next) => {
  try {
    const { id } = req.params

    const deleted = await categoriasService.eliminarCategoria(id)

    if (!deleted) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    res.status(200).json({ message: 'Categoría eliminada con éxito' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
}

