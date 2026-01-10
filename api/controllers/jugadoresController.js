const { db } = require('../config/firebase');
const { sanitizeString } = require('../middlewares/validator');
const jugadoresService = require('../services/jugadores.service');

// Campos que un entrenador puede actualizar
const CAMPOS_ENTRENADOR = ['MAIL', 'MOVIL', 'DORSAL', 'POSICION', 'ESTADO'];

// Función auxiliar para verificar si un entrenador puede tocar un jugador
async function assertEntrenadorPuedeTocarJugador(user, jugadorData) {
  const entrenadorEquipoId = user.roles?.entrenador?.equipoId;
  const entrenadorEquipoNombre = user.roles?.entrenador?.equipoNombre;

  if (!entrenadorEquipoId && !entrenadorEquipoNombre) {
    const err = new Error("Entrenador sin equipo asignado");
    err.status = 403;
    throw err;
  }

  // Verificar si el jugador pertenece al equipo del entrenador (con fallback legacy)
  const jugadorEquipoId = jugadorData.EQUIPO_ID || jugadorData.equipoId || jugadorData.equipo_id;
  const jugadorEquipoNombre = jugadorData.EQUIPO || jugadorData.equipo || jugadorData.equipoNombre;


  const perteneceAlEquipo = 
    (entrenadorEquipoId && jugadorEquipoId === entrenadorEquipoId) ||
    (entrenadorEquipoNombre && jugadorEquipoNombre === entrenadorEquipoNombre);

  if (!perteneceAlEquipo) {
    const err = new Error("Solo puedes modificar jugadores de tu propio equipo");
    err.status = 403;
    throw err;
  }
}

// Función auxiliar para filtrar campos permitidos
function pickAllowedFields(data, allowedFields) {
  const result = {};
  allowedFields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      result[field] = data[field];
    }
  });
  return result;
}

// Obtener todos los jugadores
const getJugadores = async (req, res, next) => {
  try {
    const isAdmin = req.user?.roles?.admin === true || req.user?.roles?.administrador === true;
    const isDelegado = req.user?.roles?.delegado;
    const isEntrenador = req.user?.roles?.entrenador;

    // Admin/Delegado: pueden ver todos los jugadores
    if (isAdmin || isDelegado) {
      const jugadoresSnapshot = await db.collection('JUGADORES').get();
      const jugadores = jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(jugadores);
    }

    // Entrenador: solo puede ver jugadores de su equipo
    if (isEntrenador) {
      const entrenadorEquipoId = req.user.roles.entrenador.equipoId;
      const entrenadorEquipoNombre = req.user.roles.entrenador.equipoNombre;

      if (!entrenadorEquipoId && !entrenadorEquipoNombre) {
        return res.status(403).json({ error: 'No tienes un equipo asignado' });
      }

      const results = [];
      const seen = new Set();

      // Buscar por EQUIPO_ID (preferente)
      if (entrenadorEquipoId) {
        const snapById = await db.collection('JUGADORES')
          .where('EQUIPO_ID', '==', entrenadorEquipoId)
          .get();

        snapById.forEach(d => {
          if (!seen.has(d.id)) {
            seen.add(d.id);
            results.push({ id: d.id, ...d.data() });
          }
        });
      }

      // Buscar por EQUIPO (nombre) como fallback
      if (entrenadorEquipoNombre) {
        const snapByName = await db.collection('JUGADORES')
          .where('EQUIPO', '==', entrenadorEquipoNombre)
          .get();

        snapByName.forEach(d => {
          if (!seen.has(d.id)) {
            seen.add(d.id);
            results.push({ id: d.id, ...d.data() });
          }
        });
      }

      return res.status(200).json(results);
    }

    // Si no es ningún rol permitido
    return res.status(403).json({ error: 'No tienes permisos para ver jugadores' });
  } catch (error) {
    next(error);
  }
};

// Función auxiliar para normalizar campos
function normalizeField(field) {
  if (!field || typeof field !== 'string') return field;
  return field.toUpperCase().trim();
}

// Obtener jugadores por equipo (por EQUIPO_ID preferente, o por nombre si no existe)
const getJugadoresByEquipo = async (req, res) => {
  try {
    const equipoParam = (req.params.equipo || '').trim();

    // Si no hay usuario autenticado, permitir consulta pública (para árbitros)
    const isAdmin = req.user?.roles?.admin === true;
    const entrenadorEquipoId = req.user?.roles?.entrenador?.equipoId;
    const delegadoEquipoId = req.user?.roles?.delegado?.equipoId;

    // Intentamos resolver (equipoParam) a: { equipoId, equipoNombre }
    let resolvedEquipoId = null;
    let resolvedEquipoNombre = null;

    // Si equipoParam parece ID, probamos a cargar EQUIPOS/{id}
    const maybeIdDoc = await db.collection('EQUIPOS').doc(equipoParam).get();
    if (maybeIdDoc.exists) {
      resolvedEquipoId = equipoParam;
      resolvedEquipoNombre = maybeIdDoc.data()?.EQUIPO ?? null;
    } else {
      // Si no es ID, lo tratamos como NOMBRE y buscamos el equipo por campo EQUIPO
      const snap = await db.collection('EQUIPOS').where('EQUIPO', '==', equipoParam).limit(1).get();
      if (!snap.empty) {
        const doc = snap.docs[0];
        resolvedEquipoId = doc.id;
        resolvedEquipoNombre = doc.data()?.EQUIPO ?? equipoParam;
      } else {
        // No existe equipo con ese nombre
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }
    }

    // Permisos: admin todo; si no admin, solo su propio equipo (entrenador/delegado)
    // Si no hay usuario (consulta pública), permitir acceso
    if (req.user && !isAdmin) {
      const allowed = [entrenadorEquipoId, delegadoEquipoId].filter(Boolean);
      if (allowed.length === 0) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (!allowed.includes(resolvedEquipoId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Query jugadores: algunos están por EQUIPO_ID y otros por EQUIPO (nombre)
    const results = [];
    const seen = new Set();

    // Por EQUIPO_ID (preferente)
    const snapById = await db.collection('JUGADORES')
      .where('EQUIPO_ID', '==', resolvedEquipoId)
      .get();

    snapById.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        const data = d.data();
        results.push({ 
          id: d.id, 
          ...data,
          // Normalizar campos importantes a mayúsculas para consistencia
          // Buscar tanto en mayúsculas como minúsculas para los nombres de campo
          CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
          SEXO: normalizeField(data.SEXO || data.sexo),
          POSICION: normalizeField(data.POSICION || data.posicion),
          ESTADO: normalizeField(data.ESTADO || data.estado)
        });
      }
    });

    // Por EQUIPO (nombre)
    if (resolvedEquipoNombre) {
      const snapByName = await db.collection('JUGADORES')
        .where('EQUIPO', '==', resolvedEquipoNombre)
        .get();

      snapByName.forEach(d => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          const data = d.data();
          results.push({ 
            id: d.id, 
            ...data,
            // Normalizar campos importantes a mayúsculas para consistencia
            // Buscar tanto en mayúsculas como minúsculas para los nombres de campo
            CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
            SEXO: normalizeField(data.SEXO || data.sexo),
            POSICION: normalizeField(data.POSICION || data.posicion),
            ESTADO: normalizeField(data.ESTADO || data.estado)
          });
        }
      });
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
};

// Obtener jugadores por categoría (busca en CATEGORIA y categoria)
const getJugadoresByCategoria = async (req, res) => {
  try {
    const categoria = req.params.categoria;
    const results = [];
    const seen = new Set();

    // Buscar en campo CATEGORIA (mayúsculas)
    const snapMayus = await db.collection('JUGADORES')
      .where('CATEGORIA', '==', categoria)
      .get();

    snapMayus.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        const data = d.data();
        results.push({
          id: d.id,
          ...data,
          CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
          SEXO: normalizeField(data.SEXO || data.sexo),
          POSICION: normalizeField(data.POSICION || data.posicion),
          ESTADO: normalizeField(data.ESTADO || data.estado)
        });
      }
    });

    // Buscar en campo categoria (minúsculas)
    const snapMinus = await db.collection('JUGADORES')
      .where('categoria', '==', categoria)
      .get();

    snapMinus.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        const data = d.data();
        results.push({
          id: d.id,
          ...data,
          CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
          SEXO: normalizeField(data.SEXO || data.sexo),
          POSICION: normalizeField(data.POSICION || data.posicion),
          ESTADO: normalizeField(data.ESTADO || data.estado)
        });
      }
    });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
};

// Obtener jugadores por sexo (busca en SEXO y sexo)
const getJugadoresBySexo = async (req, res) => {
  try {
    const sexo = req.params.sexo;
    const results = [];
    const seen = new Set();

    // Buscar en campo SEXO (mayúsculas)
    const snapMayus = await db.collection('JUGADORES')
      .where('SEXO', '==', sexo)
      .get();

    snapMayus.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        const data = d.data();
        results.push({
          id: d.id,
          ...data,
          CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
          SEXO: normalizeField(data.SEXO || data.sexo),
          POSICION: normalizeField(data.POSICION || data.posicion),
          ESTADO: normalizeField(data.ESTADO || data.estado)
        });
      }
    });

    // Buscar en campo sexo (minúsculas)
    const snapMinus = await db.collection('JUGADORES')
      .where('sexo', '==', sexo)
      .get();

    snapMinus.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        const data = d.data();
        results.push({
          id: d.id,
          ...data,
          CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
          SEXO: normalizeField(data.SEXO || data.sexo),
          POSICION: normalizeField(data.POSICION || data.posicion),
          ESTADO: normalizeField(data.ESTADO || data.estado)
        });
      }
    });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
};

// Obtener un jugador por ID
const getJugadorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jugadorDoc = await db.collection('JUGADORES').doc(id).get();
    
    if (!jugadorDoc.exists) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    res.status(200).json({ id: jugadorDoc.id, ...jugadorDoc.data() });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo jugador
const createJugador = async (req, res, next) => {
  try {
    const {
      NOMBRE,
      APELLIDO1,
      APELLIDO2,
      ALIAS,
      DOCUMENTO,
      MOVIL,
      MAIL,
      CATEGORIA,
      DORSAL,
      EQUIPO,
      ESTADO,
      FECHA_NACIMIENTO,
      POSICION,
      SEXO
    } = req.body;
    
    // Validar campos obligatorios
    if (!NOMBRE || !APELLIDO1 || !DOCUMENTO || !EQUIPO || !DORSAL || !FECHA_NACIMIENTO) {
      return res.status(400).json({ 
        error: 'Los campos NOMBRE, APELLIDO1, DOCUMENTO, EQUIPO, DORSAL y FECHA_NACIMIENTO son obligatorios.' 
      });
    }

    // Sanitizar strings
    const nombreSanitized = sanitizeString(NOMBRE);
    const apellido1Sanitized = sanitizeString(APELLIDO1);
    const apellido2Sanitized = sanitizeString(APELLIDO2);
    const aliasSanitized = sanitizeString(ALIAS);
    const documentoSanitized = sanitizeString(DOCUMENTO);

    // Verificar si ya existe un jugador con ese documento
    const existsDocumento = await db.collection('JUGADORES')
      .where('DOCUMENTO', '==', documentoSanitized)
      .get();
    
    if (!existsDocumento.empty) {
      return res.status(409).json({ 
        error: 'Ya existe un jugador con ese documento.' 
      });
    }

    // Verificar si ya existe un jugador con ese dorsal en el mismo equipo
    const existsDorsal = await db.collection('JUGADORES')
      .where('EQUIPO', '==', EQUIPO)
      .where('DORSAL', '==', parseInt(DORSAL))
      .get();
    
    if (!existsDorsal.empty) {
      return res.status(409).json({ 
        error: `Ya existe un jugador con el dorsal ${DORSAL} en el equipo ${EQUIPO}.` 
      });
    }

    // Obtener datos del equipo para heredar categoría y sexo
    let equipoCategoria = CATEGORIA || '';
    let equipoSexo = SEXO || '';
    
    try {
      const equiposSnapshot = await db.collection('EQUIPOS')
        .where('EQUIPO', '==', EQUIPO)
        .limit(1)
        .get();
      
      if (!equiposSnapshot.empty) {
        const equipoData = equiposSnapshot.docs[0].data();
        equipoCategoria = equipoData.CATEGORIA || CATEGORIA || '';
        equipoSexo = equipoData.TIPO || SEXO || '';
      }
    } catch (equipoError) {
      console.warn('No se pudieron obtener datos del equipo:', equipoError);
    }

    // Crear jugador con nueva estructura completa
    const jugadorData = {
      NOMBRE: nombreSanitized,
      APELLIDO1: apellido1Sanitized,
      APELLIDO2: apellido2Sanitized || '',
      ALIAS: aliasSanitized || '',
      DOCUMENTO: documentoSanitized,  // Obligatorio
      MOVIL: MOVIL || '',             // Voluntario
      MAIL: MAIL || '',               // Voluntario
      CATEGORIA: equipoCategoria,     // Heredado del equipo
      DORSAL: parseInt(DORSAL),
      EQUIPO: EQUIPO,
      ESTADO: ESTADO || 'Activo',
      FECHA_NACIMIENTO: FECHA_NACIMIENTO,  // Con hora 10:00:00 desde frontend
      POSICION: POSICION || '',
      SEXO: equipoSexo               // Heredado del equipo (TIPO del equipo)
    };

    const docRef = await db.collection('JUGADORES').add(jugadorData);

    res.status(201).json({ 
      message: 'Jugador creado con éxito', 
      id: docRef.id,
      jugador: jugadorData
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un jugador
const updateJugador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const jugadorRef = db.collection('JUGADORES').doc(id);
    const jugadorDoc = await jugadorRef.get();

    if (!jugadorDoc.exists) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const jugadorActual = jugadorDoc.data();

    // Verificar permisos según el rol
    const isAdmin = req.user?.roles?.admin === true || req.user?.roles?.administrador === true;
    const isDelegado = req.user?.roles?.delegado;
    const isEntrenador = req.user?.roles?.entrenador;
    const isArbitro = req.user?.roles?.arbitro === true;

    // Árbitro: solo puede actualizar ESTADO
    if (isArbitro && !isAdmin) {
      const permitido = ['ESTADO'];
      const camposEnviados = Object.keys(updateData);
      const camposNoPermitidos = camposEnviados.filter(campo => !permitido.includes(campo));
      
      if (camposNoPermitidos.length > 0) {
        return res.status(403).json({ 
          error: `Los árbitros solo pueden actualizar el estado de los jugadores. Campos no permitidos: ${camposNoPermitidos.join(', ')}` 
        });
      }
    }
    // Entrenador: solo ciertos campos y solo si es su equipo
    else if (isEntrenador && !isAdmin && !isDelegado) {
      await assertEntrenadorPuedeTocarJugador(req.user, jugadorActual);

      const permitido = pickAllowedFields(updateData, CAMPOS_ENTRENADOR);

      if (Object.keys(permitido).length === 0) {
        const err = new Error("No hay campos permitidos para actualizar");
        err.status = 400;
        throw err;
      }

      Object.keys(updateData).forEach(key => {
        if (!CAMPOS_ENTRENADOR.includes(key)) {
          delete updateData[key];
        }
      });

      // Sanitización entrenador (solo campos permitidos)
      ["MAIL", "MOVIL", "POSICION", "ESTADO"].forEach((campo) => {
        if (updateData[campo] !== undefined) {
          updateData[campo] = String(updateData[campo]).trim();
        }
      });

      // Dorsal numérico
      if (updateData.DORSAL !== undefined) {
        updateData.DORSAL = parseInt(updateData.DORSAL, 10);
        if (isNaN(updateData.DORSAL)) {
          return res.status(400).json({ error: "DORSAL debe ser numérico" });
        }
      }

    }
    // Admin/Delegado: pueden actualizar más campos
    else if (isAdmin || isDelegado) {
      // Sanitización de campos
      const camposString = [
        'NOMBRE',
        'APELLIDO1',
        'APELLIDO2',
        'ALIAS',
        'POSICION',
        'ESTADO',
        'MAIL',
        'MOVIL'
      ];

      camposString.forEach(campo => {
        if (updateData[campo] !== undefined) {
          updateData[campo] = String(updateData[campo]).trim();
        }
      });

      if (updateData.DOCUMENTO !== undefined) {
        updateData.DOCUMENTO = String(updateData.DOCUMENTO).trim();
      }

      if (updateData.DORSAL !== undefined) {
        updateData.DORSAL = parseInt(updateData.DORSAL, 10);
        if (isNaN(updateData.DORSAL)) {
          return res.status(400).json({ error: 'DORSAL debe ser numérico' });
        }
      }

      // Validación dorsal único en el mismo equipo
      if (updateData.DORSAL !== undefined) {
        const equipoId = updateData.EQUIPO_ID || jugadorActual.EQUIPO_ID;

        if (equipoId) {
          const snap = await db
            .collection('JUGADORES')
            .where('EQUIPO_ID', '==', equipoId)
            .where('DORSAL', '==', updateData.DORSAL)
            .get();

          const dorsalOcupado = snap.docs.some(doc => doc.id !== id);

          if (dorsalOcupado) {
            return res
              .status(400)
              .json({ error: 'Ya existe un jugador con ese dorsal en el equipo' });
          }
        }
      }
    } else {
      return res.status(403).json({ error: 'No tienes permisos para actualizar jugadores' });
    }

    // Actualización final  
    updateData.updatedAt = new Date();

    await jugadorRef.update(updateData);

    res.json({
      message: 'Jugador actualizado correctamente',
      id
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un jugador
const deleteJugador = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el jugador existe
    const jugadorDoc = await db.collection('JUGADORES').doc(id).get();
    if (!jugadorDoc.exists) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    await db.collection('JUGADORES').doc(id).delete();
    
    res.status(200).json({ 
      message: 'Jugador eliminado con éxito' 
    });
  } catch (error) {
    next(error);
  }
};

const migrarEquipoId = async (req, res, next) => {
  try {
    const dryRun = String(req.query.dryRun).toLowerCase() !== 'false';
    const result = await jugadoresService.migrarEquipoId({ dryRun });
    res.status(200).json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJugadores,
  getJugadoresByEquipo,
  getJugadoresByCategoria,
  getJugadoresBySexo,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador, 
  migrarEquipoId
};