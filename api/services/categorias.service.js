// api/services/categorias.service.js
const { db } = require('../config/firebase')

// Obtener todas las categorías
async function obtenerCategorias() {
  const snapshot = await db.collection('CATEGORIAS').get()
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Obtener una categoría por ID
async function obtenerCategoriaPorId(id) {
  const categoriaDoc = await db.collection('CATEGORIAS').doc(id).get()

  if (!categoriaDoc.exists) return null

  return { id: categoriaDoc.id, ...categoriaDoc.data() }
}

// Crear una categoría nueva
async function crearCategoria(data) {
  const { NOMBRE, EdadMin, EdadMax, TIPO, DenominacionINT, ano1, ano2 } = data

  const nuevaCategoria = {
    NOMBRE,
    EdadMin,
    EdadMax,
    TIPO,
    DenominacionINT,
    ano1,
    ano2
  }

  const docRef = await db.collection('CATEGORIAS').add(nuevaCategoria)

  return {
    id: docRef.id,
    ...nuevaCategoria
  }
}

// Actualizar categoría
async function actualizarCategoria(id, updateData) {
  const ref = db.collection('CATEGORIAS').doc(id)
  const categoriaDoc = await ref.get()

  if (!categoriaDoc.exists) return null

  await ref.update(updateData)

  return { id, ...updateData }
}

// Eliminar categoría
async function eliminarCategoria(id) {
  const ref = db.collection('CATEGORIAS').doc(id)
  const categoriaDoc = await ref.get()

  if (!categoriaDoc.exists) return null

  await ref.delete()
  return true
}

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
}
