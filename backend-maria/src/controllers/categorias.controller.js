// src/controllers/categorias.controller.js

import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../services/categorias.service.js'

// GET /categorias
export function manejarObtenerCategorias (req, res) {
  const lista = obtenerCategorias()
  res.json(lista)
}

// GET /categorias/:id
export function manejarObtenerCategoriaPorId (req, res) {
  const { id } = req.params
  const categoria = obtenerCategoriaPorId(id)

  if (!categoria) {
    return res.status(404).json({ error: 'Categoría no encontrada' })
  }

  res.json(categoria)
}

// POST /categorias
export function manejarCrearCategoria (req, res) {
  const { nombre, tipo } = req.body

  if (!nombre) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio' })
  }

  const nuevaCategoria = crearCategoria({ nombre, tipo })
  res.status(201).json(nuevaCategoria)
}

// PUT /categorias/:id
export function manejarActualizarCategoria (req, res) {
  const { id } = req.params
  const datos = req.body

  const categoriaActualizada = actualizarCategoria(id, datos)

  if (!categoriaActualizada) {
    return res.status(404).json({ error: 'Categoría no encontrada' })
  }

  res.json(categoriaActualizada)
}

// DELETE /categorias/:id
export function manejarEliminarCategoria (req, res) {
  const { id } = req.params

  const eliminada = eliminarCategoria(id)

  if (!eliminada) {
    return res.status(404).json({ error: 'Categoría no encontrada' })
  }

  res.status(204).send()
}
