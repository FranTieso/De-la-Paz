// src/services/ligas.service.js
import { db } from '../config/firebase.js'

const COLLECTION = 'ligas'

// Obtener todas las ligas
export async function obtenerLigas () {
  const snapshot = await db.collection(COLLECTION).get()

  const ligas = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      nombre: data.nombre,
      temporada: data.temporada ?? null,
      deporte: data.deporte ?? null,
      estado: data.estado ?? null
    }
  })

  return ligas
}

// Obtener una liga por ID
export async function obtenerLigaPorId (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return null

  const data = doc.data()

  return {
    id: doc.id,
    nombre: data.nombre,
    temporada: data.temporada ?? null,
    deporte: data.deporte ?? null,
    estado: data.estado ?? null
  }
}

// Crear nueva liga
export async function crearLiga (datos) {
  const nuevaLiga = {
    nombre: datos.nombre,
    temporada: datos.temporada ?? null,
    deporte: datos.deporte ?? null,
    estado: datos.estado ?? 'activa'
  }

  const ref = await db.collection(COLLECTION).add(nuevaLiga)

  return {
    id: ref.id,
    ...nuevaLiga
  }
}

// Actualizar liga existente
export async function actualizarLiga (id, datos) {
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

// Eliminar liga
export async function eliminarLiga (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return false

  await ref.delete()
  return true
}

