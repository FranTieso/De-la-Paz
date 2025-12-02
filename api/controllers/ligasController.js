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
    const { NOMBRE, TEMPORADA, NUM_EQUIPOS } = req.body;

    if (!NOMBRE || !TEMPORADA || !NUM_EQUIPOS) {
      return res.status(400).json({ 
        error: 'Los campos NOMBRE, TEMPORADA y NUM_EQUIPOS son obligatorios.' 
      });
    }

    const nuevaLiga = { NOMBRE, TEMPORADA, NUM_EQUIPOS };
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
