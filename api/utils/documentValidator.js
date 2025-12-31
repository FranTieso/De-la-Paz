// api/utils/documentValidator.js
const { db } = require('../config/firebase');

/**
 * Valida el formato de un documento español (DNI/NIE)
 * @param {string} documento - El documento a validar
 * @returns {Object} - { isValid: boolean, error: string, normalized: string }
 */
function validateDocumentFormat(documento) {
  if (!documento || typeof documento !== 'string') {
    return { isValid: false, error: 'El documento es obligatorio' };
  }

  // Limpiar y normalizar
  const cleanDoc = documento.trim().toUpperCase().replace(/[-\s]/g, '');
  
  // Validar longitud
  if (cleanDoc.length < 8 || cleanDoc.length > 9) {
    return { isValid: false, error: 'El documento debe tener entre 8 y 9 caracteres' };
  }

  // Patrones para DNI y NIE
  const dniPattern = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  const niePattern = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

  if (!dniPattern.test(cleanDoc) && !niePattern.test(cleanDoc)) {
    return { 
      isValid: false, 
      error: 'Formato de documento inválido. Debe ser un DNI (12345678A) o NIE (X1234567A)' 
    };
  }

  // Validar dígito de control
  const isValidCheckDigit = validateCheckDigit(cleanDoc);
  if (!isValidCheckDigit) {
    return { 
      isValid: false, 
      error: 'El dígito de control del documento no es válido' 
    };
  }

  return { 
    isValid: true, 
    error: null, 
    normalized: cleanDoc 
  };
}

/**
 * Valida el dígito de control de un DNI/NIE
 * @param {string} documento - Documento normalizado
 * @returns {boolean}
 */
function validateCheckDigit(documento) {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  let numbers;

  if (documento.startsWith('X')) {
    numbers = '0' + documento.substring(1, 8);
  } else if (documento.startsWith('Y')) {
    numbers = '1' + documento.substring(1, 8);
  } else if (documento.startsWith('Z')) {
    numbers = '2' + documento.substring(1, 8);
  } else {
    numbers = documento.substring(0, 8);
  }

  const expectedLetter = letters[parseInt(numbers) % 23];
  const actualLetter = documento.charAt(documento.length - 1);

  return expectedLetter === actualLetter;
}

/**
 * Verifica si un documento ya existe en las colecciones USUARIOS y JUGADORES
 * @param {string} documento - Documento normalizado a verificar
 * @param {string} excludeUserId - ID de usuario a excluir (para actualizaciones)
 * @returns {Promise<Object>} - { exists: boolean, collection: string, error: string }
 */
async function checkDocumentExists(documento, excludeUserId = null) {
  try {
    // Verificar en colección USUARIOS
    let usuariosQuery = db.collection('USUARIOS').where('numeroDocumento', '==', documento);
    if (excludeUserId) {
      // Para actualizaciones, excluir el usuario actual
      usuariosQuery = usuariosQuery.where(db.FieldPath.documentId(), '!=', excludeUserId);
    }
    
    const usuariosSnap = await usuariosQuery.limit(1).get();
    
    if (!usuariosSnap.empty) {
      return { 
        exists: true, 
        collection: 'USUARIOS', 
        error: 'Este documento ya está registrado por otro usuario' 
      };
    }

    // Verificar en colección JUGADORES
    const jugadoresSnap = await db.collection('JUGADORES')
      .where('numeroDocumento', '==', documento)
      .limit(1)
      .get();
    
    if (!jugadoresSnap.empty) {
      return { 
        exists: true, 
        collection: 'JUGADORES', 
        error: 'Este documento ya está registrado como jugador' 
      };
    }

    return { exists: false, collection: null, error: null };

  } catch (error) {
    console.error('Error verificando documento:', error);
    return { 
      exists: false, 
      collection: null, 
      error: 'Error al verificar el documento en la base de datos' 
    };
  }
}

/**
 * Validación completa de documento (formato + unicidad)
 * @param {string} documento - Documento a validar
 * @param {string} excludeUserId - ID de usuario a excluir (opcional)
 * @returns {Promise<Object>} - { isValid: boolean, error: string, normalized: string }
 */
async function validateDocument(documento, excludeUserId = null) {
  // 1. Validar formato
  const formatValidation = validateDocumentFormat(documento);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  // 2. Verificar unicidad
  const existsCheck = await checkDocumentExists(formatValidation.normalized, excludeUserId);
  if (existsCheck.error && existsCheck.exists) {
    return { 
      isValid: false, 
      error: existsCheck.error, 
      normalized: formatValidation.normalized 
    };
  }

  return { 
    isValid: true, 
    error: null, 
    normalized: formatValidation.normalized 
  };
}

module.exports = {
  validateDocumentFormat,
  checkDocumentExists,
  validateDocument
};