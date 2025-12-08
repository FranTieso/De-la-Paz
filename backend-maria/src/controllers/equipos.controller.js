// src/controllers/equipos.controller.js

import {
  obtenerEquipos,
  obtenerEquipoPorId,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
} from '../services/equipos.service.js'

// GET /equipos
export function manejarObtenerEquipos (req, res) {
  const lista = obtenerEquipos()
  res.json(lista)
}

// GET /equipos/:id
export function manejarObtenerEquipoPorId (req, res) {
  const { id } = req.params
  const equipo = obtenerEquipoPorId(id)

  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' })
  }

  res.json(equipo)
}

// POST /equipos
export function manejarCrearEquipo (req, res) {
  const { nombre, categoria, ligaId } = req.body

  if (!nombre) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio' })
  }

  const nuevoEquipo = crearEquipo({ nombre, categoria, ligaId })
  res.status(201).json(nuevoEquipo)
}

// PUT /equipos/:id
export function manejarActualizarEquipo (req, res) {
  const { id } = req.params
  const datos = req.body

  const equipoActualizado = actualizarEquipo(id, datos)

  if (!equipoActualizado) {
    return res.status(404).json({ error: 'Equipo no encontrado' })
  }

  res.json(equipoActualizado)
}

// DELETE /equipos/:id
export function manejarEliminarEquipo (req, res) {
  const { id } = req.params

  const eliminado = eliminarEquipo(id)

  if (!eliminado) {
    return res.status(404).json({ error: 'Equipo no encontrado' })
  }

  res.status(204).send()
}
