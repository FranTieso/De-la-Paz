const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no válido'
      });
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario tenga rol de administrador
    if (!decoded.rol || decoded.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }
    
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Error en autenticación de administrador:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

module.exports = adminAuthMiddleware;