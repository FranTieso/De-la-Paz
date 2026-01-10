// api/services/mensajes.service.js
const { db } = require('../config/firebase')

// Obtener todos los mensajes
async function obtenerMensajes() {
  try {
    const snapshot = await db.collection('mensajes').orderBy('fechaCreacion', 'desc').get()
    
    const mensajes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });
    
    return mensajes;
  } catch (error) {
    console.error('Error en obtenerMensajes:', error);
    throw error;
  }
}

// Obtener un mensaje por ID
async function obtenerMensajePorId(id) {
  const mensajeDoc = await db.collection('mensajes').doc(id).get()

  if (!mensajeDoc.exists) return null

  return { id: mensajeDoc.id, ...mensajeDoc.data() }
}

// Crear mensaje
async function crearMensaje(data) {
  const {
    nombre,
    email,
    asunto,
    mensaje,
    cookies
  } = data

  const nuevoMensaje = {
    nombre: nombre || '',
    email: email || '',
    asunto: asunto || '',
    mensaje: mensaje || '',
    cookies: cookies || false,
    fechaCreacion: new Date(),
    leido: false,
    estado: 'pendiente'
  }

  try {
    const docRef = await db.collection('mensajes').add(nuevoMensaje)

    return {
      id: docRef.id,
      ...nuevoMensaje
    }
  } catch (error) {
    console.error('Error en servicio crearMensaje:', error);
    throw error;
  }
}

// Marcar mensaje como leído
async function marcarComoLeido(id) {
  const ref = db.collection('mensajes').doc(id)
  const mensajeDoc = await ref.get()

  if (!mensajeDoc.exists) return null

  await ref.update({ 
    leido: true,
    fechaLectura: new Date()
  })
  return { id, leido: true, fechaLectura: new Date() }
}

// Eliminar mensaje
async function eliminarMensaje(id) {
  const ref = db.collection('mensajes').doc(id)
  const mensajeDoc = await ref.get()

  if (!mensajeDoc.exists) return null

  await ref.delete()
  return true
}

module.exports = {
  obtenerMensajes,
  obtenerMensajePorId,
  crearMensaje,
  marcarComoLeido,
  eliminarMensaje
}