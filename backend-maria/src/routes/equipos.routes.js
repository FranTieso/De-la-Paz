// src/routes/equipos.routes.js

import { Router } from 'express'
import {
  manejarObtenerEquipos,
  manejarObtenerEquipoPorId,
  manejarCrearEquipo,
  manejarActualizarEquipo,
  manejarEliminarEquipo
} from '../controllers/equipos.controller.js'

const router = Router()

router.get('/', manejarObtenerEquipos)
router.get('/:id', manejarObtenerEquipoPorId)
router.post('/', manejarCrearEquipo)
router.put('/:id', manejarActualizarEquipo)
router.delete('/:id', manejarEliminarEquipo)

export default router
