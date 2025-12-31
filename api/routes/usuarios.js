const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario
} = require('../controllers/usuariosController');

// POST /api/usuarios/login - Login de usuario
router.post('/login', loginUsuario);

// POST /api/usuarios/register - Registro público de usuario
router.post('/register', createUsuario);

// POST /api/usuarios/validate-document - Validar documento en tiempo real
router.post('/validate-document', async (req, res) => {
  try {
    const { documento } = req.body;
    
    if (!documento) {
      return res.status(400).json({ error: 'Documento es requerido' });
    }
    
    const { validateDocument } = require('../utils/documentValidator');
    const validation = await validateDocument(documento);
    
    res.json({
      isValid: validation.isValid,
      error: validation.error,
      normalized: validation.normalized
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Error al validar documento' });
  }
});

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', getUsuarios);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', getUsuarioById);

// POST /api/usuarios - Crear un nuevo usuario (requiere autenticación)
router.post('/', auth, createUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', auth, updateUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', auth, deleteUsuario);

module.exports = router;
