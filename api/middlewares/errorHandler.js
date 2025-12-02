// Middleware para manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Errores de Firebase Auth
  if (err.code && err.code.startsWith('auth/')) {
    const authErrors = {
      'auth/email-already-exists': { status: 409, message: 'El correo electrónico ya está en uso.' },
      'auth/invalid-password': { status: 400, message: 'La contraseña debe tener al menos 6 caracteres.' },
      'auth/invalid-email': { status: 400, message: 'El correo electrónico no es válido.' },
      'auth/user-not-found': { status: 404, message: 'Usuario no encontrado.' }
    };
    
    const error = authErrors[err.code] || { status: 500, message: err.message };
    return res.status(error.status).json({ error: error.message });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
