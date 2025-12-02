// Utilidades para la API

/**
 * Crea una respuesta exitosa estandarizada
 */
const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Crea una respuesta de error estandarizada
 */
const errorResponse = (res, message = 'Error en la operación', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    error: message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Valida que un objeto tenga los campos requeridos
 */
const validateRequiredFields = (obj, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Limpia un objeto eliminando campos undefined o null
 */
const cleanObject = (obj) => {
  const cleaned = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  }
  
  return cleaned;
};

module.exports = {
  successResponse,
  errorResponse,
  validateRequiredFields,
  cleanObject
};
