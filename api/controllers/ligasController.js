// api/controllers/ligasController.js
const ligasService = require('../services/ligas.service')

// GET /api/ligas
const getLigas = async (req, res, next) => {
  try {
    const ligas = await ligasService.obtenerLigas()
    res.status(200).json(ligas)
  } catch (error) {
    next(error)
  }
}

// GET /api/ligas/:id
const getLigaById = async (req, res, next) => {
  try {
    const { id } = req.params
    const liga = await ligasService.obtenerLigaPorId(id)

    if (!liga) {
      return res.status(404).json({ error: 'Liga no encontrada' })
    }

    res.status(200).json(liga)
  } catch (error) {
    next(error)
  }
}

// POST /api/ligas
const createLiga = async (req, res, next) => {
  try {
    const { NOMBRE, TEMPORADA } = req.body

    if (!NOMBRE || !TEMPORADA) {
      return res.status(400).json({
        error: 'Los campos NOMBRE y TEMPORADA son obligatorios.'
      })
    }

    const nuevaLiga = await ligasService.crearLiga(req.body)

    res.status(201).json({
      message: 'Liga creada con éxito',
      ...nuevaLiga
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/ligas/:id
const updateLiga = async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await ligasService.actualizarLiga(id, req.body)

    if (!updated) {
      return res.status(404).json({ error: 'Liga no encontrada' })
    }

    res.status(200).json({
      message: 'Liga actualizada con éxito',
      id
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/ligas/:id
const deleteLiga = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await ligasService.eliminarLiga(id)

    if (!deleted) {
      return res.status(404).json({ error: 'Liga no encontrada' })
    }

    res.status(200).json({
      message: 'Liga eliminada con éxito'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getLigas,
  getLigaById,
  createLiga,
  updateLiga,
  deleteLiga
}

