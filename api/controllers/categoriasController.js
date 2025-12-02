const { db } = require('../config/firebase');

// Obtener todas las categorías
const getCategorias = async (req, res, next) => {
  try {
    const categoriasSnapshot = await db.collection('CATEGORIAS').get();
    const categorias = categoriasSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    res.status(200).json(categorias);
  } catch (error) {
    next(error);
  }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoriaDoc = await db.collection('CATEGORIAS').doc(id).get();
    
    if (!categoriaDoc.exists) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.status(200).json({ id: categoriaDoc.id, ...categoriaDoc.data() });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva categoría
const createCategoria = async (req, res, next) => {
  try {
    const nuevaCategoria = req.body;
    
    if (!nuevaCategoria.CATEGORIA && !nuevaCategoria.NOMBRE) {
      return res.status(400).json({ 
        error: 'El campo CATEGORIA o NOMBRE es obligatorio.' 
      });
    }

    const docRef = await db.collection('CATEGORIAS').add(nuevaCategoria);
    
    res.status(201).json({ 
      message: 'Categoría creada con éxito',
      id: docRef.id, 
      ...nuevaCategoria 
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una categoría
const updateCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const categoriaDoc = await db.collection('CATEGORIAS').doc(id).get();
    if (!categoriaDoc.exists) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await db.collection('CATEGORIAS').doc(id).update(updateData);
    
    res.status(200).json({ 
      message: 'Categoría actualizada con éxito',
      id 
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una categoría
const deleteCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const categoriaDoc = await db.collection('CATEGORIAS').doc(id).get();
    if (!categoriaDoc.exists) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si hay equipos usando esta categoría
    const equiposSnapshot = await db.collection('EQUIPOS')
      .where('CATEGORIA', '==', categoriaDoc.data().CATEGORIA || categoriaDoc.data().NOMBRE)
      .get();
    
    if (!equiposSnapshot.empty) {
      return res.status(409).json({ 
        error: 'No se puede eliminar la categoría porque tiene equipos asociados.' 
      });
    }

    await db.collection('CATEGORIAS').doc(id).delete();
    
    res.status(200).json({ 
      message: 'Categoría eliminada con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
