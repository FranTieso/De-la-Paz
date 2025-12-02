const { db } = require('../config/firebase');

// Obtener todas las ligas
const getLigas = async (req, res, next) => {
  try {
    const ligasSnapshot = await db.collection('LIGAS').get();
    const ligas = ligasSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    res.status(200).json(ligas);
  } catch (error) {
    next(error);
  }
};

// Obtener una liga por ID
const getLigaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ligaDoc = await db.collection('LIGAS').doc(id).get();
    
    if (!ligaDoc.exists) {
      return res.status(404).json({ error: 'Liga no encontrada' });
    }
    
    res.status(200).json({ id: ligaDoc.id, ...ligaDoc.data() });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva liga
const createLiga = async (req, res, next) => {
  try {
    const { NOMBRE, CATEGORIA, CATEGORIA_ID, TIPO, TEMPORADA, FECHA_INICIO, FECHA_FIN, NUM_EQUIPOS, EQUIPOS } = req.body;

    // Validar campos obligatorios
    if (!NOMBRE || !TEMPORADA) {
      return res.status(400).json({ 
        error: 'Los campos NOMBRE y TEMPORADA son obligatorios.' 
      });
    }

    // Validar fechas si se proporcionan
    if (FECHA_INICIO && FECHA_FIN) {
      const fechaInicio = new Date(FECHA_INICIO);
      const fechaFin = new Date(FECHA_FIN);
      
      if (fechaFin < fechaInicio) {
        return res.status(400).json({ 
          error: 'La fecha de fin debe ser posterior a la fecha de inicio.' 
        });
      }
    }

    // Validar que la categoría existe si se proporciona CATEGORIA_ID
    if (CATEGORIA_ID) {
      const categoriaDoc = await db.collection('CATEGORIAS').doc(CATEGORIA_ID).get();
      if (!categoriaDoc.exists) {
        return res.status(400).json({ 
          error: 'La categoría seleccionada no existe.' 
        });
      }
    }

    // Preparar datos de la liga
    const nuevaLiga = { 
      NOMBRE, 
      TEMPORADA
    };

    // Añadir campos opcionales si existen
    if (CATEGORIA) nuevaLiga.CATEGORIA = CATEGORIA;
    if (CATEGORIA_ID) nuevaLiga.CATEGORIA_ID = CATEGORIA_ID;
    if (TIPO) nuevaLiga.TIPO = TIPO;
    if (FECHA_INICIO) nuevaLiga.FECHA_INICIO = FECHA_INICIO;
    if (FECHA_FIN) nuevaLiga.FECHA_FIN = FECHA_FIN;
    
    // Añadir equipos si se proporcionan
    if (EQUIPOS && Array.isArray(EQUIPOS)) {
      nuevaLiga.EQUIPOS = EQUIPOS;
      nuevaLiga.NUM_EQUIPOS = EQUIPOS.length;
    } else {
      nuevaLiga.NUM_EQUIPOS = NUM_EQUIPOS ? parseInt(NUM_EQUIPOS, 10) : 0;
      nuevaLiga.EQUIPOS = [];
    }

    const docRef = await db.collection('LIGAS').add(nuevaLiga);

    res.status(201).json({ 
      message: 'Liga creada con éxito',
      id: docRef.id, 
      ...nuevaLiga 
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una liga
const updateLiga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const ligaDoc = await db.collection('LIGAS').doc(id).get();
    if (!ligaDoc.exists) {
      return res.status(404).json({ error: 'Liga no encontrada' });
    }

    await db.collection('LIGAS').doc(id).update(updateData);
    
    res.status(200).json({ 
      message: 'Liga actualizada con éxito',
      id 
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una liga
const deleteLiga = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ligaDoc = await db.collection('LIGAS').doc(id).get();
    if (!ligaDoc.exists) {
      return res.status(404).json({ error: 'Liga no encontrada' });
    }

    await db.collection('LIGAS').doc(id).delete();
    
    res.status(200).json({ 
      message: 'Liga eliminada con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLigas,
  getLigaById,
  createLiga,
  updateLiga,
  deleteLiga
};
