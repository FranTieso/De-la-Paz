// api/controllers/equiposController.js
const equiposService = require('../services/equipos.service')
const { sanitizeString } = require('../middlewares/validator')

// GET /api/equipos
const getEquipos = async (req, res, next) => {
  try {
    const equipos = await equiposService.obtenerEquipos()
    res.status(200).json(equipos)
  } catch (error) {
    next(error)
  }
}

// GET /api/equipos/:id
const getEquipoById = async (req, res, next) => {
  try {
    const { id } = req.params
    const equipo = await equiposService.obtenerEquipoPorId(id)

    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' })
    }

    res.status(200).json(equipo)
  } catch (error) {
    next(error)
  }
}

// GET /api/equipos/categoria/:categoria
const getEquiposByCategoria = async (req, res, next) => {
  try {
    const categoriaParam = req.params.categoria
    const categoria = sanitizeString
      ? sanitizeString(categoriaParam)
      : categoriaParam

    const equipos = await equiposService.obtenerEquiposPorCategoria(categoria)
    res.status(200).json(equipos)
  } catch (error) {
    next(error)
  }
}

// POST /api/equipos
const createEquipo = async (req, res, next) => {
  try {
    const { EQUIPO } = req.body

    // En el modelo actual, el nombre del equipo es EQUIPO, no NOMBRE
    if (!EQUIPO) {
      return res
        .status(400)
        .json({ error: 'El campo EQUIPO es obligatorio.' })
    }

    const nuevoEquipo = await equiposService.crearEquipo(req.body)

    res.status(201).json({
      message: 'Equipo creado con éxito',
      ...nuevoEquipo
    })
  } catch (error) {
    next(error)
  }
}

// PUT /api/equipos/:id
const updateEquipo = async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await equiposService.actualizarEquipo(id, req.body)

    if (!updated) {
      return res.status(404).json({ error: 'Equipo no encontrado' })
    }

    res.status(200).json({
      message: 'Equipo actualizado con éxito',
      id
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/equipos/:id
const deleteEquipo = async (req, res, next) => {
  try {
    const { id } = req.params
    const eliminado = await equiposService.eliminarEquipo(id)

    if (!eliminado) {
      return res.status(404).json({ error: 'Equipo no encontrado' })
    }

    res.status(200).json({ message: 'Equipo eliminado con éxito' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getEquipos,
  getEquipoById,
  getEquiposByCategoria,
  createEquipo,
  updateEquipo,
  deleteEquipo
}


