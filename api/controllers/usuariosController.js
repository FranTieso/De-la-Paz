// api/controllers/usuariosController.js
const usuariosService = require('../services/usuarios.service');
const { sanitizeString } = require('../middlewares/validator');

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

    // Sanitizar numeroDocumento si viene
    const numeroDocumento = userData.numeroDocumento
      ? sanitizeString(userData.numeroDocumento)
      : null;

    if (numeroDocumento) {
      const existeDni = await usuariosService.existeNumeroDocumento(numeroDocumento);
      if (existeDni) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese número de documento.' });
      }
      userData.numeroDocumento = numeroDocumento;
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
    const updated = await usuariosService.actualizarUsuario(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({
      message: 'Usuario actualizado con éxito',
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

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario
};

