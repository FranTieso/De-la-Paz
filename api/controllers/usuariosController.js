// api/controllers/usuariosController.js
const usuariosService = require('../services/usuarios.service');
const { sanitizeString } = require('../middlewares/validator');
const { validateDocument } = require('../utils/documentValidator');

// GET /api/usuarios

const getUsuarios = async (req, res, next) => { 
  try { 
    const users = await usuariosService.obtenerUsuarios(); res.status(200).json(users); 
  } catch (error) { 
    next(error); 
  } 
};

// GET /api/usuarios/:id
const getUsuarioById = async (req, res, next) => {
  try {
    const user = await usuariosService.obtenerUsuarioPorId(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/usuarios
const createUsuario = async (req, res, next) => {
  try {
    const { mail, password, userData = {} } = req.body;

    if (!mail || !password) {
      return res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Validar y sanitizar numeroDocumento si viene
    if (userData.numeroDocumento) {
      const documentValidation = await validateDocument(userData.numeroDocumento);
      
      if (!documentValidation.isValid) {
        return res.status(400).json({ error: documentValidation.error });
      }
      
      // Usar el documento normalizado
      userData.numeroDocumento = documentValidation.normalized;
    }

    const existeMail = await usuariosService.existeEmail(mail);
    if (existeMail) {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
    }

    const nuevo = await usuariosService.crearUsuario({ mail, password, userData });

    res.status(201).json({
      message: 'Usuario creado con éxito',
      uid: nuevo.id,
      usuario: nuevo
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/usuarios/:id
const updateUsuario = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body };
    
    // Validar documento si se está actualizando
    if (updateData.numeroDocumento) {
      const documentValidation = await validateDocument(updateData.numeroDocumento, userId);
      
      if (!documentValidation.isValid) {
        return res.status(400).json({ error: documentValidation.error });
      }
      
      // Usar el documento normalizado
      updateData.numeroDocumento = documentValidation.normalized;
    }
    
    const updated = await usuariosService.actualizarUsuario(userId, updateData);
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({
      message: 'Usuario actualizado con éxito',
      id: userId,
      usuario: updated
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/usuarios/:id/contacto
const updateUsuarioContacto = async (req, res, next) => {
  try {
    const { mail, movil } = req.body;

    // Whitelist estricta
    const payload = {};
    if (typeof mail === "string") payload.mail = sanitizeString(mail);
    if (typeof movil === "string") payload.movil = sanitizeString(movil);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Solo se permite actualizar mail y/o movil.' });
    }

    const updated = await usuariosService.actualizarContactoUsuario(req.params.id, payload, req.user);

    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({
      message: 'Contacto actualizado con éxito',
      id: req.params.id,
      usuario: updated
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/usuarios/:id
const deleteUsuario = async (req, res, next) => {
  try {
    const deleted = await usuariosService.eliminarUsuario(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};

// POST /api/usuarios/login
const loginUsuario = async (req, res, next) => {
  try {
    const { mail, password } = req.body;

    if (!mail || !password) {
      return res.status(400).json({
        success: false,
        error: 'El email y la contraseña son obligatorios.'
      });
    }

    const result = await usuariosService.loginUsuario({ mail, password });

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token: result.token,
      usuario: result.usuario
    });

  } catch (error) {
    next(error);
  }
};

// MIGRACION roles equipos api/controllers/usuariosController.js
const migrarRolesEquipos = async (req, res, next) => {
  try {
    const dryRun = req.query.dryRun !== 'false'; // por defecto true
    const result = await usuariosService.migrarRolesEquipo({ dryRun });
    res.status(200).json({ success: true, result });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  migrarRolesEquipos,
  updateUsuarioContacto
};

