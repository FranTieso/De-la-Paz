// api/controllers/mensajesController.js
const mensajesService = require('../services/mensajes.service')
const { sanitizeString } = require('../middlewares/validator')

// GET /api/mensajes
const getMensajes = async (req, res, next) => {
  try {
    console.log('Controlador getMensajes: Iniciando obtención de mensajes...');
    const mensajes = await mensajesService.obtenerMensajes()
    console.log('Controlador getMensajes: Mensajes obtenidos:', mensajes.length);
    res.status(200).json(mensajes)
  } catch (error) {
    console.error('Error en controlador getMensajes:', error);
    next(error)
  }
}

// GET /api/mensajes/:id
const getMensajeById = async (req, res, next) => {
  try {
    const { id } = req.params
    const mensaje = await mensajesService.obtenerMensajePorId(id)

    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' })
    }

    res.status(200).json(mensaje)
  } catch (error) {
    next(error)
  }
}

// POST /api/mensajes
const createMensaje = async (req, res, next) => {
  try {
    console.log('Recibiendo datos:', req.body);
    
    const { nombre, email, asunto, mensaje } = req.body

    // Validaciones básicas
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios: nombre, email, asunto, mensaje' 
      })
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'El formato del email no es válido' 
      })
    }

    // Sanitizar datos si existe la función
    const datosLimpios = {
      nombre: sanitizeString ? sanitizeString(nombre) : nombre,
      email: sanitizeString ? sanitizeString(email) : email,
      asunto: sanitizeString ? sanitizeString(asunto) : asunto,
      mensaje: sanitizeString ? sanitizeString(mensaje) : mensaje
    }

    console.log('Datos limpios:', datosLimpios);

    const nuevoMensaje = await mensajesService.crearMensaje(datosLimpios)

    console.log('Mensaje creado:', nuevoMensaje);

    res.status(201).json({
      message: 'Mensaje enviado con éxito',
      ...nuevoMensaje
    })
  } catch (error) {
    console.error('Error en createMensaje:', error);
    next(error)
  }
}

// PUT /api/mensajes/:id/leido
const marcarComoLeido = async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await mensajesService.marcarComoLeido(id)

    if (!updated) {
      return res.status(404).json({ error: 'Mensaje no encontrado' })
    }

    res.status(200).json({
      message: 'Mensaje marcado como leído',
      id
    })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/mensajes/:id
const deleteMensaje = async (req, res, next) => {
  try {
    const { id } = req.params
    const eliminado = await mensajesService.eliminarMensaje(id)

    if (!eliminado) {
      return res.status(404).json({ error: 'Mensaje no encontrado' })
    }

    res.status(200).json({ message: 'Mensaje eliminado con éxito' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMensajes,
  getMensajeById,
  createMensaje,
  marcarComoLeido,
  deleteMensaje
}