// src/routes/categorias.routes.js

import { Router } from 'express'
import {
  manejarObtenerCategorias,
  manejarObtenerCategoriaPorId,
  manejarCrearCategoria,
  manejarActualizarCategoria,
  manejarEliminarCategoria
} from '../controllers/categorias.controller.js'

const router = Router()

router.get('/', manejarObtenerCategorias)
router.get('/:id', manejarObtenerCategoriaPorId)
router.post('/', manejarCrearCategoria)
router.put('/:id', manejarActualizarCategoria)
router.delete('/:id', manejarEliminarCategoria)

export default router
