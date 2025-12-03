const { db } = require('../config/firebase');
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

    // Verificar si el email ya existe en Firestore
    const existingEmail = await db.collection('USUARIOS')
      .where('mail', '==', mail)
      .get();
    
    if (!existingEmail.empty) {
      return res.status(409).json({ 
        error: 'El correo electrónico ya está en uso.' 
      });
    }

    // Guardar usuario en Firestore con contraseña en campo "contra"
    const toSave = { 
      mail, 
      contra: password,  // Guardar contraseña para login
      ...userData 
    };
    
    const docRef = await db.collection('USUARIOS').add(toSave);

    res.status(201).json({ 
      message: 'Usuario creado con éxito', 
      uid: docRef.id 
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
    
    // Eliminar de Firestore
    await db.collection('USUARIOS').doc(id).delete();
    
    res.status(200).json({ 
      message: 'Usuario eliminado con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuario (validación simple sin Firebase Auth)
const loginUsuario = async (req, res, next) => {
  try {
    const { mail, password } = req.body;

    // Validar que se proporcionen ambos campos
    if (!mail || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'El email y la contraseña son obligatorios.' 
      });
    }

    // Buscar usuario por email en Firestore
    const usuariosSnapshot = await db.collection('USUARIOS')
      .where('mail', '==', mail)
      .limit(1)
      .get();

    // Verificar si el usuario existe
    if (usuariosSnapshot.empty) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales incorrectas.' 
      });
    }

    // Obtener el documento del usuario
    const usuarioDoc = usuariosSnapshot.docs[0];
    const usuarioData = usuarioDoc.data();

    // Verificar la contraseña contra el campo "contra"
    if (usuarioData.contra !== password) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales incorrectas.' 
      });
    }

    // Extraer el rol del usuario
    let rol = 'Sin rol';
    if (usuarioData.roles && typeof usuarioData.roles === 'object') {
      const rolesKeys = Object.keys(usuarioData.roles);
      if (rolesKeys.length > 0) {
        rol = rolesKeys[0]; // Tomar el primer rol
      }
    }

    // Login exitoso
    res.status(200).json({ 
      success: true,
      message: 'Login exitoso',
      usuario: {
        id: usuarioDoc.id,
        mail: usuarioData.mail,
        nombre: usuarioData.nombre,
        apellido1: usuarioData.apellido1,
        apellido2: usuarioData.apellido2,
        rol: rol,
        roles: usuarioData.roles
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    next(error);
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario
};
