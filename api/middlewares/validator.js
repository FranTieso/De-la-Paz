// Middleware para validación de datos
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

const sanitizeString = (str) => {
  return (str || '').toString().trim();
};

module.exports = { validateRequired, sanitizeString };
