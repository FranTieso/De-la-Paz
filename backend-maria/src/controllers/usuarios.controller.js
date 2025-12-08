// src/controllers/usuarios.controller.js

import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../services/usuarios.service.js'

// GET /usuarios
export function manejarObtenerUsuarios (req, res) {
  const lista = obtenerUsuarios()
  res.json(lista)
}

// GET /usuarios/:id
export function manejarObtenerUsuarioPorId (req, res) {
  const { id } = req.params
  const usuario = obtenerUsuarioPorId(id)

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.json(usuario)
}

// POST /usuarios
export function manejarCrearUsuario (req, res) {
  const { nombre, email, rol, equipoId } = req.body

  // Validamos campos obligatorios
  if (!nombre || !email) {
    return res
      .status(400)
      .json({ error: 'Los campos "nombre" y "email" son obligatorios' })
  }

  // Validación básica para formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' })
  }

  try {
    // Llamamos al service. Si el email está duplicado, lanzará un error.
    const nuevoUsuario = crearUsuario({ nombre, email, rol, equipoId })
    res.status(201).json(nuevoUsuario)
  } catch (error) {
    // Interpretamos el error que lanzó el service
    if (error.code === 'EMAIL_DUPLICADO') {
      return res.status(409).json({ error: error.message })
    }

    console.error(error)
    res.status(500).json({ error: 'Error al crear el usuario' })
  }
}

// PUT /usuarios/:id
export function manejarActualizarUsuario (req, res) {
  const { id } = req.params
  const datos = req.body

  const usuarioActualizado = actualizarUsuario(id, datos)

  if (!usuarioActualizado) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.json(usuarioActualizado)
}

// DELETE /usuarios/:id
export function manejarEliminarUsuario (req, res) {
  const { id } = req.params

  const eliminado = eliminarUsuario(id)

  if (!eliminado) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.status(204).send()
}
