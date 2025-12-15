// api/services/ligas.service.js
const { db } = require('../config/firebase')

// Obtener todas las ligas
async function obtenerLigas () {
  const snapshot = await db.collection('LIGAS').get()
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Obtener una liga por ID
async function obtenerLigaPorId (id) {
  const ligaDoc = await db.collection('LIGAS').doc(id).get()

  if (!ligaDoc.exists) return null

  return { id: ligaDoc.id, ...ligaDoc.data() }
}

// Crear una nueva liga
async function crearLiga (data) {
  const {
    NOMBRE,
    CATEGORIA,
    CATEGORIA_ID,
    TIPO,
    TEMPORADA,
    FECHA_INICIO,
    FECHA_FIN,
    NUM_EQUIPOS,
    EQUIPOS
  } = data

  // Validar que la categoría existe si se proporciona CATEGORIA_ID
  if (CATEGORIA_ID) {
    const categoriaDoc = await db.collection('CATEGORIAS').doc(CATEGORIA_ID).get()
    if (!categoriaDoc.exists) {
      const error = new Error('La categoría seleccionada no existe.')
      error.status = 400
      throw error
    }
  }

  const nuevaLiga = { NOMBRE, TEMPORADA }

  if (CATEGORIA) nuevaLiga.CATEGORIA = CATEGORIA
  if (CATEGORIA_ID) nuevaLiga.CATEGORIA_ID = CATEGORIA_ID
  if (TIPO) nuevaLiga.TIPO = TIPO
  if (FECHA_INICIO) nuevaLiga.FECHA_INICIO = FECHA_INICIO
  if (FECHA_FIN) nuevaLiga.FECHA_FIN = FECHA_FIN

  if (EQUIPOS && Array.isArray(EQUIPOS)) {
    nuevaLiga.EQUIPOS = EQUIPOS
    nuevaLiga.NUM_EQUIPOS = EQUIPOS.length
  } else {
    nuevaLiga.NUM_EQUIPOS = NUM_EQUIPOS ? parseInt(NUM_EQUIPOS, 10) : 0
    nuevaLiga.EQUIPOS = []
  }

  const docRef = await db.collection('LIGAS').add(nuevaLiga)

  return {
    id: docRef.id,
    ...nuevaLiga
  }
}

// Actualizar liga
async function actualizarLiga (id, updateData) {
  const ligaRef = db.collection('LIGAS').doc(id)
  const ligaDoc = await ligaRef.get()

  if (!ligaDoc.exists) return null

  await ligaRef.update(updateData)

  return { id, ...updateData }
}

// Eliminar liga
async function eliminarLiga (id) {
  const ligaRef = db.collection('LIGAS').doc(id)
  const ligaDoc = await ligaRef.get()

  if (!ligaDoc.exists) return null

  await ligaRef.delete()
  return true
}

module.exports = {
  obtenerLigas,
  obtenerLigaPorId,
  crearLiga,
  actualizarLiga,
  eliminarLiga
}
