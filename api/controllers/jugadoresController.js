const { db } = require('../config/firebase');
const { sanitizeString } = require('../middlewares/validator');

// Obtener todos los jugadores
const getJugadores = async (req, res, next) => {
  try {
    const jugadoresSnapshot = await db.collection('JUGADORES').get();
    const jugadores = jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(jugadores);
  } catch (error) {
    next(error);
  }
};

// Obtener jugadores por equipo
const getJugadoresByEquipo = async (req, res, next) => {
  try {
    const { equipo } = req.params;
    const jugadoresSnapshot = await db.collection('JUGADORES')
      .where('EQUIPO', '==', equipo)
      .get();
    
    const jugadores = jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(jugadores);
  } catch (error) {
    next(error);
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
    const updateData = req.body;
    
    // Verificar que el jugador existe
    const jugadorDoc = await db.collection('JUGADORES').doc(id).get();
    if (!jugadorDoc.exists) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    // Si se actualiza el dorsal, verificar que no esté ocupado
    if (updateData.DORSAL && updateData.EQUIPO) {
      const existsDorsal = await db.collection('JUGADORES')
        .where('EQUIPO', '==', updateData.EQUIPO)
        .where('DORSAL', '==', parseInt(updateData.DORSAL))
        .get();
      
      // Verificar que no sea el mismo jugador
      const conflictingDocs = existsDorsal.docs.filter(doc => doc.id !== id);
      if (conflictingDocs.length > 0) {
        return res.status(409).json({ 
          error: `Ya existe un jugador con el dorsal ${updateData.DORSAL} en el equipo ${updateData.EQUIPO}.` 
        });
      }
    }

    // Sanitizar strings si están presentes
    if (updateData.NOMBRE) updateData.NOMBRE = sanitizeString(updateData.NOMBRE);
    if (updateData.APELLIDO1) updateData.APELLIDO1 = sanitizeString(updateData.APELLIDO1);
    if (updateData.APELLIDO2) updateData.APELLIDO2 = sanitizeString(updateData.APELLIDO2);
    if (updateData.DNI) updateData.DNI = sanitizeString(updateData.DNI);

    // Convertir dorsal a número si está presente
    if (updateData.DORSAL) updateData.DORSAL = parseInt(updateData.DORSAL);

    // Añadir fecha de modificación
    updateData.FECHA_MODIFICACION = new Date().toISOString();

    await db.collection('JUGADORES').doc(id).update(updateData);
    
    res.status(200).json({ 
      message: 'Jugador actualizado con éxito',
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

module.exports = {
  getJugadores,
  getJugadoresByEquipo,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador
};