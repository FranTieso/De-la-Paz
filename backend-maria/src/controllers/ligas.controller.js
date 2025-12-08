// src/controllers/ligas.controller.js

import {
  obtenerLigas,
  obtenerLigaPorId,
  crearLiga,
  actualizarLiga,
  eliminarLiga
} from '../services/ligas.service.js'

// GET /ligas
export async function manejarObtenerLigas (req, res) {
  try {
    const lista = await obtenerLigas()
    res.json(lista)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

// GET /ligas/:id
export async function manejarObtenerLigaPorId (req, res) {
  const { id } = req.params

  try {
    const liga = await obtenerLigaPorId(id)

    if (!liga) {
      return res.status(404).json({ error: 'Liga no encontrada' })
    }

    res.json(liga)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener las ligas' })
  }
}

// POST /ligas
export async function manejarCrearLiga (req, res) {
  const { nombre, temporada, deporte, estado } = req.body

  if (!nombre) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio' })
  }

  try {
    const nuevaLiga = await crearLiga({ nombre, temporada, deporte, estado })
    res.status(201).json(nuevaLiga)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear la liga' })
  }
}

// PUT /ligas/:id
export async function manejarActualizarLiga (req, res) {
  const { id } = req.params
  const datos = req.body

  try {
    const ligaActualizada = await actualizarLiga(id, datos)

    if (!ligaActualizada) {
      return res.status(404).json({ error: 'Liga no encontrada' })
    }

    res.json(ligaActualizada)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar la liga' })
  }
}

// DELETE /ligas/:id
export async function manejarEliminarLiga (req, res) {
  const { id } = req.params

  try {
    const eliminada = await eliminarLiga(id)

    if (!eliminada) {
      return res.status(404).json({ error: 'Liga no encontrada' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar la liga' })
  }
}

