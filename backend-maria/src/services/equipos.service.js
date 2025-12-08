// src/services/equipos.service.js
import { db } from '../config/firebase.js'

const COLLECTION = 'equipos'

// Obtener todos los equipos
export async function obtenerEquipos () {
  const snapshot = await db.collection(COLLECTION).get()

  const equipos = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      nombre: data.nombre,
      categoria: data.categoria ?? null,
      ligaId: data.ligaId ?? null
    }
  })

  return equipos
}

// Obtener un equipo por ID
export async function obtenerEquipoPorId (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return null

  const data = doc.data()

  return {
    id: doc.id,
    nombre: data.nombre,
    categoria: data.categoria ?? null,
    ligaId: data.ligaId ?? null
  }
}

// Crear un equipo nuevo
export async function crearEquipo (datos) {
  const nuevoEquipo = {
    nombre: datos.nombre,
    categoria: datos.categoria ?? null,
    ligaId: datos.ligaId ?? null
  }

  const ref = await db.collection(COLLECTION).add(nuevoEquipo)

  return {
    id: ref.id,
    ...nuevoEquipo
  }
}

// Actualizar un equipo
export async function actualizarEquipo (id, datos) {
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

// Eliminar un equipo
export async function eliminarEquipo (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return false

  await ref.delete()
  return true
}

