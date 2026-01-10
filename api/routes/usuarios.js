const express = require('express');
const auth = require('../middlewares/auth');
const { requireAnyRole } = require("../middlewares/permissions");
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  getUsuariosByArbitro,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  migrarRolesEquipos, 
  updateUsuarioContacto
} = require('../controllers/usuariosController');

// POST /api/usuarios/login - Login de usuario
router.post('/login', loginUsuario);

// PATCH /api/usuarios/:id/contacto - Editar solo mail/movil (admin o entrenador/delegado de su equipo)
router.patch('/:id/contacto', auth, requireAnyRole("admin", "entrenador", "delegado"), updateUsuarioContacto);

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
router.get('/', auth, getUsuarios);

// GET /api/usuarios/arbitros - Obtener usuarios con rol árbitro
router.get('/arbitros', auth, getUsuariosByArbitro);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', auth, getUsuarioById);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', auth, requireAnyRole("admin"), createUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', auth, requireAnyRole("admin"), updateUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', auth, requireAnyRole("admin"), deleteUsuario);

// POST /api/usuarios/migracion/roles-equipos - Migrar roles de equipos a usuarios (endpoint temporal de mantenimiento)
router.post('/migracion/roles-equipos', auth, requireAnyRole('admin'), migrarRolesEquipos);

module.exports = router;
