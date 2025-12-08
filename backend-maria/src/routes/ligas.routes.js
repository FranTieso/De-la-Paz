// src/routes/ligas.routes.js

import { Router } from 'express'
import {
  manejarObtenerLigas,
  manejarObtenerLigaPorId,
  manejarCrearLiga,
  manejarActualizarLiga,
  manejarEliminarLiga
} from '../controllers/ligas.controller.js'

const router = Router()

// Rutas base: /ligas
router.get('/', manejarObtenerLigas)
router.get('/:id', manejarObtenerLigaPorId)
router.post('/', manejarCrearLiga)
router.put('/:id', manejarActualizarLiga)
router.delete('/:id', manejarEliminarLiga)

export default router
