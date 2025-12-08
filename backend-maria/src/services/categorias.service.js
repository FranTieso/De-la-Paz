// src/services/categorias.service.js
import { db } from '../config/firebase.js'

const COLLECTION = 'categorias'

// Obtener todas las categorías
export async function obtenerCategorias () {
  const snapshot = await db.collection(COLLECTION).get()

  const categorias = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      nombre: data.nombre,
      tipo: data.tipo ?? null
    }
  })

  return categorias
}

// Obtener una categoría por ID
export async function obtenerCategoriaPorId (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return null

  const data = doc.data()

  return {
    id: doc.id,
    nombre: data.nombre,
    tipo: data.tipo ?? null
  }
}

// Crear nueva categoría
export async function crearCategoria (datos) {
  const nuevaCategoria = {
    nombre: datos.nombre,
    tipo: datos.tipo ?? null
  }

  const ref = await db.collection(COLLECTION).add(nuevaCategoria)

  return {
    id: ref.id,
    ...nuevaCategoria
  }
}

// Actualizar categoría existente
export async function actualizarCategoria (id, datos) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return null

  const dataActual = doc.data()

  const datosActualizados = {
    ...dataActual,
    ...datos
  }

  await ref.set(datosActualizados, { merge: true })

  return {
    id,
    ...datosActualizados
  }
}

// Eliminar categoría
export async function eliminarCategoria (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return false

  await ref.delete()
  return true
}

