// api/services/equipos.service.js
const { db } = require('../config/firebase')

// Obtener todos los equipos
async function obtenerEquipos() {
  const snapshot = await db.collection('EQUIPOS').get()
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Obtener un equipo por ID
async function obtenerEquipoPorId(id) {
  const equipoDoc = await db.collection('EQUIPOS').doc(id).get()

  if (!equipoDoc.exists) return null

  return { id: equipoDoc.id, ...equipoDoc.data() }
}

// Obtener equipos por categoría (usando el campo de texto CATEGORIA)
async function obtenerEquiposPorCategoria (categoria) {
  const snapshot = await db
    .collection('EQUIPOS')
    .where('CATEGORIA', '==', categoria)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Crear equipo
async function crearEquipo (data) {
  const {
    EQUIPO,
    CATEGORIA,
    CATEGORIA_ID,
    LIGA_ID,
    TIPO,
    ENTRENADOR,
    JUGADORES = []
  } = data

  const nuevoEquipo = {
    EQUIPO,
    CATEGORIA: CATEGORIA ?? null,
    CATEGORIA_ID: CATEGORIA_ID ?? null,
    LIGA_ID: LIGA_ID ?? null,
    TIPO: TIPO ?? null,
    ENTRENADOR: ENTRENADOR ?? null,
    JUGADORES: Array.isArray(JUGADORES) ? JUGADORES : []
  }

  // Validar existencia de categoría si hay ID
  if (CATEGORIA_ID) {
    const categoriaDoc = await db
      .collection('CATEGORIAS')
      .doc(CATEGORIA_ID)
      .get()

    if (!categoriaDoc.exists) {
      const error = new Error('La categoría seleccionada no existe.')
      error.status = 400
      throw error
    }
  }

  // Validar existencia de liga si hay LIGA_ID (opcional)
  if (LIGA_ID) {
    const ligaDoc = await db.collection('LIGAS').doc(LIGA_ID).get()
    if (!ligaDoc.exists) {
      const error = new Error('La liga seleccionada no existe.')
      error.status = 400
      throw error
    }
  }

  const docRef = await db.collection('EQUIPOS').add(nuevoEquipo)

  return {
    id: docRef.id,
    ...nuevoEquipo
  }
}

// Actualizar equipo
async function actualizarEquipo (id, updateData) {
  const ref = db.collection('EQUIPOS').doc(id)
  const equipoDoc = await ref.get()

  if (!equipoDoc.exists) return null

  // Si actualizan CATEGORIA_ID o LIGA_ID, podríamos validar aquí también,
  // pero por ahora lo dejamos simple para no complicar la demo.
  await ref.update(updateData)

  return { id, ...updateData }
}

// Eliminar equipo
async function eliminarEquipo (id) {
  const ref = db.collection('EQUIPOS').doc(id)
  const equipoDoc = await ref.get()

  if (!equipoDoc.exists) return null

  await ref.delete()
  return true
}

module.exports = {
  obtenerEquipos,
  obtenerEquipoPorId,
  obtenerEquiposPorCategoria,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
}