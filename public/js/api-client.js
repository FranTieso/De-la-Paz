/**
 * Cliente JavaScript para la API de Asociación de la Paz
 * Incluye funciones helper para todas las operaciones CRUD
 */

const API_BASE_URL = '/api';

// ============================================
// UTILIDADES GENERALES
// ============================================

// Realiza una petición HTTP a la API
async function apiRequest(endpoint, method = 'GET', data = null, requireAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  // Añadir token de autenticación si existe y se requiere
  if (requireAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = options.headers || {};
      options.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      // Si es error 401 y tenemos token, podría estar expirado
      if (response.status === 401 && localStorage.getItem('token')) {
        console.warn('Token posiblemente expirado, limpiando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('userSession');
        // No redirigir automáticamente, dejar que la aplicación maneje el error
      }
      throw new Error(`Error ${response.status}: ${result.error || 'Error en la petición'}`);
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
  delete: async (id) => {
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
   * Obtener partidos de una liga (Calendario) - público
   */
  getByLiga: async (ligaId) => {
    return await apiRequest(`/partidos/liga/${ligaId}`, 'GET', null, false);
  },

  /**
   * Obtener un partido por ID - público
   */
  getById: async (partidoId) => {
    return await apiRequest(`/partidos/${partidoId}`, 'GET', null, false);
  },

  /**
   * Obtener partidos de un árbitro - público
   */
  getByArbitro: async (arbitroId) => {
    return await apiRequest(`/partidos/arbitro/${arbitroId}`, 'GET', null, false);
  },

  /**
   * Actualizar un partido
   */
  update: async (partidoId, data) => {
    return await apiRequest(`/partidos/${partidoId}`, 'PUT', data);
  },

  /**
   * Eliminar calendario de una liga
   */
  deleteByLiga: async (ligaId) => {
    return await apiRequest(`/partidos/liga/${ligaId}`, 'DELETE');
  }
};

// ============================================
// JUGADORES
// ============================================

const Jugadores = {
  /**
   * Obtener todos los jugadores
   */
  getAll: async () => {
    return await apiRequest('/jugadores');
  },

  /**
   * Obtener jugadores por equipo (público para árbitros)
   */
  getByEquipo: async (equipoNombre) => {
    return await apiRequest(`/jugadores/equipo/${encodeURIComponent(equipoNombre)}`, 'GET', null, false);
  },

  /**
   * Obtener un jugador por ID
   */
  getById: async (jugadorId) => {
    return await apiRequest(`/jugadores/${jugadorId}`);
  },

  /**
   * Crear un nuevo jugador
   */
  create: async (jugadorData) => {
    return await apiRequest('/jugadores', 'POST', jugadorData);
  },

  /**
   * Actualizar un jugador
   */
  update: async (jugadorId, updateData) => {
    return await apiRequest(`/jugadores/${jugadorId}`, 'PUT', updateData);
  },

  /**
   * Eliminar un jugador
   */
  delete: async (jugadorId) => {
    return await apiRequest(`/jugadores/${jugadorId}`, 'DELETE');
  }
};

// ============================================
// RESULTADOS/CLASIFICACIONES
// ============================================

const Resultados = {
  /**
   * Obtener resultados (opcionalmente filtrados por ligaId y limit)
   * GET /api/resultados?ligaId=...&limit=...
   */
  get: async ({ ligaId = null, limit = null } = {}) => {
    const params = new URLSearchParams();
    if (ligaId) params.set('ligaId', ligaId);
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return await apiRequest(`/resultados${qs ? `?${qs}` : ''}`);
  },

  /**
   * Obtener resultados por liga
   * GET /api/resultados/liga/:ligaId
   */
  getByLiga: async (ligaId, { limit = null } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return await apiRequest(`/resultados/liga/${ligaId}${qs ? `?${qs}` : ''}`);
  }
};

const Clasificaciones = {
  /**
   * Obtener clasificación por liga
   * GET /api/clasificaciones/liga/:ligaId
   */
  getByLiga: async (ligaId) => {
    return await apiRequest(`/clasificaciones/liga/${ligaId}`);
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
