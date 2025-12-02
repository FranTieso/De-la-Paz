const { db } = require('../config/firebase');
const { sanitizeString } = require('../middlewares/validator');

// Obtener todos los equipos
const getEquipos = async (req, res, next) => {
  try {
    const equiposSnapshot = await db.collection('EQUIPOS').get();
    const equipos = equiposSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    res.status(200).json(equipos);
  } catch (error) {
    next(error);
  }
};

// Obtener un equipo por ID
const getEquipoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const equipoDoc = await db.collection('EQUIPOS').doc(id).get();
    
    if (!equipoDoc.exists) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.status(200).json({ id: equipoDoc.id, ...equipoDoc.data() });
  } catch (error) {
    next(error);
  }
};

// Obtener equipos por categoría
const getEquiposByCategoria = async (req, res, next) => {
  try {
    const { categoria } = req.params;
    const equiposSnapshot = await db.collection('EQUIPOS')
      .where('CATEGORIA', '==', categoria)
      .get();
    
    const equipos = equiposSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    res.status(200).json(equipos);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo equipo
const createEquipo = async (req, res, next) => {
  try {
    const { EQUIPO, CATEGORIA_ID } = req.body;
    
    if (!EQUIPO || !CATEGORIA_ID) {
      return res.status(400).json({ 
        error: 'Los campos EQUIPO y CATEGORIA_ID son obligatorios.' 
      });
    }

    const nombreEquipoNormalized = sanitizeString(EQUIPO);
    const categoriaId = sanitizeString(CATEGORIA_ID);

    // Verificar que la categoría existe
    const categoriaDoc = await db.collection('CATEGORIAS').doc(categoriaId).get();
    if (!categoriaDoc.exists) {
      return res.status(400).json({ 
        error: 'La categoría seleccionada no existe.' 
      });
    }

    const categoriaData = categoriaDoc.data() || {};
    const categoriaNombre = sanitizeString(categoriaData.CATEGORIA || categoriaData.NOMBRE);
    const categoriaTipo = sanitizeString(categoriaData.TIPO || categoriaData.tipo);

    // Verificar duplicados
    const duplicateQuery = await db.collection('EQUIPOS')
      .where('EQUIPO', '==', nombreEquipoNormalized)
      .where('CATEGORIA', '==', categoriaNombre)
      .get();
    
    if (!duplicateQuery.empty) {
      return res.status(409).json({ 
        error: 'Ya existe un equipo con ese nombre en la categoría seleccionada.' 
      });
    }

    // Crear el equipo
    const toSave = { 
      EQUIPO: nombreEquipoNormalized, 
      CATEGORIA: categoriaNombre, 
      TIPO: categoriaTipo 
    };
    
    const docRef = await db.collection('EQUIPOS').add(toSave);
    
    res.status(201).json({ 
      message: 'Equipo creado con éxito',
      id: docRef.id, 
      ...toSave 
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un equipo
const updateEquipo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const equipoDoc = await db.collection('EQUIPOS').doc(id).get();
    if (!equipoDoc.exists) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    await db.collection('EQUIPOS').doc(id).update(updateData);
    
    res.status(200).json({ 
      message: 'Equipo actualizado con éxito',
      id 
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un equipo
const deleteEquipo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const equipoDoc = await db.collection('EQUIPOS').doc(id).get();
    if (!equipoDoc.exists) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    await db.collection('EQUIPOS').doc(id).delete();
    
    res.status(200).json({ 
      message: 'Equipo eliminado con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipos,
  getEquipoById,
  getEquiposByCategoria,
  createEquipo,
  updateEquipo,
  deleteEquipo
};
