// src/routes/usuarios.routes.js

import { Router } from 'express'
import {
  manejarObtenerUsuarios,
  manejarObtenerUsuarioPorId,
  manejarCrearUsuario,
  manejarActualizarUsuario,
  manejarEliminarUsuario
} from '../controllers/usuarios.controller.js'

const router = Router()

router.get('/', manejarObtenerUsuarios)
router.get('/:id', manejarObtenerUsuarioPorId)
router.post('/', manejarCrearUsuario)
router.put('/:id', manejarActualizarUsuario)
router.delete('/:id', manejarEliminarUsuario)

export default router
