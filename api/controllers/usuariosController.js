const { db, auth } = require('../config/firebase');
const { sanitizeString } = require('../middlewares/validator');

// Obtener todos los usuarios
const getUsuarios = async (req, res, next) => {
  try {
    const usersSnapshot = await db.collection('USUARIOS').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('USUARIOS').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.status(200).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo usuario
const createUsuario = async (req, res, next) => {
  try {
    const { mail, password, ...userData } = req.body;
    
    // Validar campos obligatorios
    if (!mail || !password) {
      return res.status(400).json({ 
        error: 'El email y la contraseña son obligatorios.' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres.' 
      });
    }

    const numeroDocumento = sanitizeString(userData.numeroDocumento);

    // Verificar si ya existe el número de documento
    if (numeroDocumento) {
      const existsDNI = await db.collection('USUARIOS')
        .where('numeroDocumento', '==', numeroDocumento)
        .get();
      
      if (!existsDNI.empty) {
        return res.status(409).json({ 
          error: 'Ya existe un usuario con ese número de documento.' 
        });
      }
    }

    // Verificar si el email ya existe en Auth
    try {
      const existingAuth = await auth.getUserByEmail(mail);
      if (existingAuth) {
        return res.status(409).json({ 
          error: 'El correo electrónico ya está en uso.' 
        });
      }
    } catch (err) {
      if (err.code !== 'auth/user-not-found') {
        throw err;
      }
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email: mail,
      password: password,
      disabled: false
    });

    // Guardar datos adicionales en Firestore
    const toSave = { mail, ...userData };
    await db.collection('USUARIOS').doc(userRecord.uid).set(toSave);

    res.status(201).json({ 
      message: 'Usuario creado con éxito', 
      uid: userRecord.uid 
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario
const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // No permitir actualizar el password desde aquí
    delete updateData.password;
    
    const userDoc = await db.collection('USUARIOS').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await db.collection('USUARIOS').doc(id).update(updateData);
    
    res.status(200).json({ 
      message: 'Usuario actualizado con éxito',
      id 
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario
const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Eliminar de Auth
    try {
      await auth.deleteUser(id);
    } catch (authError) {
      console.warn('Usuario no encontrado en Auth:', authError.message);
    }
    
    // Eliminar de Firestore
    await db.collection('USUARIOS').doc(id).delete();
    
    res.status(200).json({ 
      message: 'Usuario eliminado con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
