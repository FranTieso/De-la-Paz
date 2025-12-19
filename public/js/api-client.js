/**
 * Cliente JavaScript para la API de Asociación de la Paz
 * Incluye funciones helper para todas las operaciones CRUD
 */

const API_BASE_URL = '/api';

// ============================================
// UTILIDADES GENERALES
// ============================================

/**
 * Realiza una petición HTTP a la API
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error en la petición');
    }

    return result;
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error);
    throw error;
  }
}

// ============================================
// USUARIOS
// ============================================

const Usuarios = {
  /**
   * Obtener todos los usuarios
   */
  getAll: async () => {
    return await apiRequest('/usuarios');
  },

  /**
   * Obtener un usuario por ID
   */
  getById: async (id) => {
    return await apiRequest(`/usuarios/${id}`);
  },

  /**
   * Crear un nuevo usuario
   */
  create: async (userData) => {
    return await apiRequest('/usuarios', 'POST', userData);
  },

  /**
   * Actualizar un usuario
   */
  update: async (id, userData) => {
    return await apiRequest(`/usuarios/${id}`, 'PUT', userData);
  },

  /**
   * Eliminar un usuario
   */
  delete: async (id) => {
    return await apiRequest(`/usuarios/${id}`, 'DELETE');
  }
};

// ============================================
// EQUIPOS
// ============================================

const Equipos = {
  /**
   * Obtener todos los equipos
   */
  getAll: async () => {
    return await apiRequest('/equipos');
  },

  /**
   * Obtener un equipo por ID
   */
  getById: async (id) => {
    return await apiRequest(`/equipos/${id}`);
  },

  /**
   * Obtener equipos por categoría
   */
  getByCategoria: async (categoria) => {
    return await apiRequest(`/equipos/categoria/${categoria}`);
  },

  /**
   * Crear un nuevo equipo
   */
  create: async (equipoData) => {
    return await apiRequest('/equipos', 'POST', equipoData);
  },

  /**
   * Actualizar un equipo
   */
  update: async (id, equipoData) => {
    return await apiRequest(`/equipos/${id}`, 'PUT', equipoData);
  },

  /**
   * Eliminar un equipo
   */
  delete: async (id) => {
    return await apiRequest(`/equipos/${id}`, 'DELETE');
  }
};

// ============================================
// CATEGORÍAS
// ============================================

const Categorias = {
  /**
   * Obtener todas las categorías
   */
  getAll: async () => {
    return await apiRequest('/categorias');
  },

  /**
   * Obtener una categoría por ID
   */
  getById: async (id) => {
    return await apiRequest(`/categorias/${id}`);
  },

  /**
   * Crear una nueva categoría
   */
  create: async (categoriaData) => {
    return await apiRequest('/categorias', 'POST', categoriaData);
  },

  /**
   * Actualizar una categoría
   */
  update: async (id, categoriaData) => {
    return await apiRequest(`/categorias/${id}`, 'PUT', categoriaData);
  },

  /**
   * Eliminar una categoría
   */
  delete: async (id) => {
    return await apiRequest(`/categorias/${id}`, 'DELETE');
  }
};

// ============================================
// LIGAS
// ============================================

const Ligas = {
  /**
   * Obtener todas las ligas
   */
  getAll: async () => {
    return await apiRequest('/ligas');
  },

  /**
   * Obtener una liga por ID
   */
  getById: async (id) => {
    return await apiRequest(`/ligas/${id}`);
  },

  /**
   * Crear una nueva liga
   */
  create: async (ligaData) => {
    return await apiRequest('/ligas', 'POST', ligaData);
  },

  /**
   * Actualizar una liga
   */
  update: async (id, ligaData) => {
    return await apiRequest(`/ligas/${id}`, 'PUT', ligaData);
  },

  /**
   * Eliminar una liga
   */
  return await apiRequest(`/ligas/${id}`, 'DELETE');
}
};

// ============================================
// PARTIDOS / CALENDARIO
// ============================================

const Partidos = {
  /**
   * Guardar múltiples partidos (ej: calendario completo)
   */
  createBatch: async (partidos) => {
    return await apiRequest('/partidos/batch', 'POST', { partidos });
  },

  /**
   * Obtener partidos de una liga (Calendario)
   */
  getByLiga: async (ligaId) => {
    return await apiRequest(`/partidos/liga/${ligaId}`);
  },

  /**
   * Eliminar calendario de una liga
   */
  deleteByLiga: async (ligaId) => {
    return await apiRequest(`/partidos/liga/${ligaId}`, 'DELETE');
  }
};

// ============================================
// EJEMPLOS DE USO
// ============================================

/*

// Ejemplo 1: Obtener todos los equipos
const equipos = await Equipos.getAll();
console.log(equipos);

// Ejemplo 2: Crear un nuevo usuario
const nuevoUsuario = await Usuarios.create({
  mail: 'usuario@example.com',
  password: 'password123',
  nombre: 'Juan',
  apellido1: 'Pérez',
  numeroDocumento: '12345678A',
  movil: '600123456'
});

// Ejemplo 3: Obtener equipos de una categoría
const equiposSenior = await Equipos.getByCategoria('Senior');

// Ejemplo 4: Actualizar un equipo
await Equipos.update('equipo123', {
  EQUIPO: 'Nuevo Nombre del Equipo'
});

// Ejemplo 5: Eliminar una liga
await Ligas.delete('liga123');

// Ejemplo 6: Manejo de errores
try {
  const usuario = await Usuarios.getById('id_inexistente');
} catch (error) {
  console.error('Error:', error.message);
  // Mostrar mensaje al usuario
}

*/
