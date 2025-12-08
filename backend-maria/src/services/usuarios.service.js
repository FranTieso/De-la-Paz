// src/services/usuarios.service.js
import { db } from '../config/firebase.js'

const COLLECTION = 'usuarios'

// =====================
// FUNCIONES PÚBLICAS
// =====================

// Devuelve todos los usuarios
export async function obtenerUsuarios () {
  const snapshot = await db.collection(COLLECTION).get()

  const usuarios = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol ?? 'jugador',
      equipoId: data.equipoId ?? null
    }
  })

  return usuarios
}

// Devuelve un usuario por su ID o null si no existe
export async function obtenerUsuarioPorId (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return null

  const data = doc.data()

  return {
    id: doc.id,
    nombre: data.nombre,
    email: data.email,
    rol: data.rol ?? 'jugador',
    equipoId: data.equipoId ?? null
  }
}

// ====================================
// FUNCIONES INTERNAS
// ====================================

// Busca un usuario por email en Firestore
async function buscarUsuarioPorEmail (email) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  }
}

// ====================================
// CRUD - CREAR, ACTUALIZAR, ELIMINAR
// ====================================

// Crea un usuario nuevo
export async function crearUsuario (datos) {
  const existente = await buscarUsuarioPorEmail(datos.email)

  if (existente) {
    const error = new Error('Ya existe un usuario con ese email')
    error.code = 'EMAIL_DUPLICADO'
    throw error
  }

  const nuevoUsuario = {
    nombre: datos.nombre,
    email: datos.email,
    rol: datos.rol ?? 'jugador',
    equipoId: datos.equipoId ?? null
  }

  const ref = await db.collection(COLLECTION).add(nuevoUsuario)

  return {
    id: ref.id,
    ...nuevoUsuario
  }
}

// Actualiza un usuario existente
export async function actualizarUsuario (id, datos) {
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

// Elimina un usuario por ID
export async function eliminarUsuario (id) {
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()

  if (!doc.exists) return false

  await ref.delete()
  return true
}

