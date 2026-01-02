// api/services/equipos.service.js
const { db } = require('../config/firebase')

// Obtener todos los equipos
async function obtenerEquipos() {
  const snapshot = await db.collection('EQUIPOS').get()
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Obtener un equipo por ID
async function obtenerEquipoPorId(id) {
  const equipoDoc = await db.collection('EQUIPOS').doc(id).get()

  if (!equipoDoc.exists) return null

  return { id: equipoDoc.id, ...equipoDoc.data() }
}

// Obtener un equipo por nombre (para la migración del id al rol de usuario)
async function obtenerEquipoPorNombre(nombre) {
  const snap = await db
    .collection('EQUIPOS')
    .where('EQUIPO', '==', nombre)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Obtener equipos por categoría
async function obtenerEquiposPorCategoria (categoria) {
  const snapshot = await db
    .collection('EQUIPOS')
    .where('CATEGORIA', '==', categoria)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Crear equipo
async function crearEquipo (data) {
  const {
    EQUIPO,
    CATEGORIA,
    CATEGORIA_ID,
    LIGA,
    LIGA_ID,
    TIPO,
    ENTRENADOR,
    ENTRENADOR_ID,
    ENTRENADOR_NOMBRE,
    JUGADORES = []
  } = data

  const nuevoEquipo = {
    EQUIPO,
    CATEGORIA: CATEGORIA ?? null,
    CATEGORIA_ID: CATEGORIA_ID ?? null,
    LIGA: LIGA ?? null,
    LIGA_ID: LIGA_ID ?? null,
    TIPO: TIPO ?? null,
    ENTRENADOR: ENTRENADOR ?? null,
    ENTRENADOR_ID: ENTRENADOR_ID ?? null,
    ENTRENADOR_NOMBRE: ENTRENADOR_NOMBRE ?? null,
    JUGADORES: Array.isArray(JUGADORES) ? JUGADORES : []
  }

  // Validar existencia de entrenador si hay ENTRENADOR_ID
  if (ENTRENADOR_ID) {
    const userDoc = await db.collection('USUARIOS').doc(ENTRENADOR_ID).get();
    if (!userDoc.exists) {
      const error = new Error('El ENTRENADOR_ID no corresponde a ningún usuario.');
      error.status = 400;
      throw error;
    }
  }

  // Validar existencia de categoría si hay ID
  if (CATEGORIA_ID) {
    const categoriaDoc = await db
      .collection('CATEGORIAS')
      .doc(CATEGORIA_ID)
      .get()

    if (!categoriaDoc.exists) {
      const error = new Error('La categoría seleccionada no existe.')
      error.status = 400
      throw error
    }
  }

  // Validar existencia de liga si hay LIGA_ID (opcional)
  if (LIGA_ID) {
    const ligaDoc = await db.collection('LIGAS').doc(LIGA_ID).get()
    if (!ligaDoc.exists) {
      const error = new Error('La liga seleccionada no existe.')
      error.status = 400
      throw error
    }
  }

  const docRef = await db.collection('EQUIPOS').add(nuevoEquipo)

  return {
    id: docRef.id,
    ...nuevoEquipo
  }
}

// Actualizar equipo
async function actualizarEquipo (id, updateData, user) {
  const ref = db.collection('EQUIPOS').doc(id)
  const equipoDoc = await ref.get()

  if (!equipoDoc.exists) return null

  // --- Whitelist de campos por rol --- (antes de integridad)
  const roles = (user && user.roles && typeof user.roles === "object") ? user.roles : {};
  const isAdmin = roles.admin === true;

  // Delegado (ownTeam ya lo valida la route): solo puede modificar JUGADORES
  if (!isAdmin) {
    const allowed = new Set(["JUGADORES"]);

    const forbidden = Object.keys(updateData).filter((k) => !allowed.has(k));
    if (forbidden.length > 0) {
      const error = new Error(
        `Campos no permitidos para tu rol: ${forbidden.join(", ")}`
      );
      error.status = 403;
      throw error;
    }

    // Normaliza JUGADORES por seguridad
    if ("JUGADORES" in updateData) {
      updateData.JUGADORES = Array.isArray(updateData.JUGADORES) ? updateData.JUGADORES : [];
    }
  }

  // --- Integridad ENTRENADOR_ID ---
  if (updateData.ENTRENADOR_ID) {
    const userDoc = await db.collection('USUARIOS').doc(updateData.ENTRENADOR_ID).get();
    if (!userDoc.exists) {
      const error = new Error('El ENTRENADOR_ID no corresponde a ningún usuario.');
      error.status = 400;
      throw error;
    }

    const userData = userDoc.data();
    const roles = userData.roles || {};

    const esAdmin = roles.admin === true;
    const esEntrenador = !!roles.entrenador;

    if (!esAdmin && !esEntrenador) {
      const error = new Error('El usuario asignado como ENTRENADOR debe tener rol entrenador o admin.');
      error.status = 400;
      throw error;
    }
    // Forzar nombre desde usuario real
    const nombre = [userData.nombre, userData.apellido1, userData.apellido2].filter(Boolean).join(' ').trim();
    updateData.ENTRENADOR_NOMBRE = nombre || userData.mail || 'Entrenador';
    updateData.ENTRENADOR = updateData.ENTRENADOR_NOMBRE;
  }

  // Si intentan cambiar el nombre a mano sin ENTRENADOR_ID, se bloquea
  if (!updateData.ENTRENADOR_ID && (updateData.ENTRENADOR || updateData.ENTRENADOR_NOMBRE)) {
    const error = new Error('No puedes modificar ENTRENADOR/ENTRENADOR_NOMBRE sin ENTRENADOR_ID.');
    error.status = 400;
    throw error;
  }
  // --- Integridad CATEGORIA_ID ---
  if (updateData.CATEGORIA_ID) {
    const categoriaDoc = await db
      .collection('CATEGORIAS')
      .doc(updateData.CATEGORIA_ID)
      .get()  
    if (!categoriaDoc.exists) {
      const error = new Error('La categoría seleccionada no existe.');
      error.status = 400;
      throw error;
    }
    const categoriaData = categoriaDoc.data();
    updateData.CATEGORIA = categoriaData.CATEGORIA ?? null;
  }
  // --- Integridad LIGA_ID ---
  if (updateData.LIGA_ID) {
    const ligaDoc = await db.collection('LIGAS').doc(updateData.LIGA_ID).get()
    if (!ligaDoc.exists) {
      const error = new Error('La liga seleccionada no existe.');
      error.status = 400;
      throw error;
    }
    const ligaData = ligaDoc.data();
    updateData.LIGA = ligaData.LIGA ?? null;
  }

  // Si actualizan CATEGORIA_ID o LIGA_ID, podríamos validar aquí también,
  // pero por ahora lo dejamos simple para no complicar la demo.
  await ref.update(updateData)

  return { id, ...updateData }
}

// Eliminar equipo
async function eliminarEquipo (id) {
  const ref = db.collection('EQUIPOS').doc(id)
  const equipoDoc = await ref.get()

  if (!equipoDoc.exists) return null

  await ref.delete()
  return true
}

module.exports = {
  obtenerEquipos,
  obtenerEquipoPorId,
  obtenerEquipoPorNombre,
  obtenerEquiposPorCategoria,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
}