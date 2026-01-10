// api/services/jugadores.service.js
const { db } = require("../config/firebase");

const JUGADORES = "JUGADORES";
const EQUIPOS = "EQUIPOS";

// Campos que permitimos a ENTRENADOR actualizar en un jugador
const CAMPOS_ENTRENADOR = ["MAIL", "MOVIL", "DORSAL", "POSICION", "ESTADO"];

// Función auxiliar para normalizar campos
function normalizeField(field) {
  if (!field || typeof field !== 'string') return field;
  return field.toUpperCase().trim();
}

// Helpers ------------------------------------------------

function isAdmin(user) {
  return user?.roles?.admin === true;
}

function isDelegado(user) {
  return !!user?.roles?.delegado?.equipoId;
}

function isEntrenador(user) {
  return !!user?.roles?.entrenador?.equipoId;
}

function pickAllowedFields(data, allowed) {
  const out = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, k)) out[k] = data[k];
  }
  return out;
}

async function getEquipoIdPorNombre(equipoNombre) {
  if (!equipoNombre) return null;

  const snap = await db
    .collection(EQUIPOS)
    .where("EQUIPO", "==", equipoNombre)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].id;
}

async function normalizeEquipoFields(data) {
  // Queremos guardar (siempre que podamos) EQUIPO y EQUIPO_ID:
  // - Si viene EQUIPO_ID pero no EQUIPO: lo dejamos así (EQUIPO puede quedar null)
  // - Si viene EQUIPO y no EQUIPO_ID: intentamos resolverlo por nombre
  const out = { ...data };

  if (!out.EQUIPO_ID && out.EQUIPO) {
    const id = await getEquipoIdPorNombre(out.EQUIPO);
    out.EQUIPO_ID = id ?? null;
  }

  // si no viene ninguno, lo dejamos tal cual
  return out;
}

async function assertEntrenadorPuedeTocarJugador(user, jugadorData) {
  if (isAdmin(user) || isDelegado(user)) return;

  if (!isEntrenador(user)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const equipoIdUser = user.roles.entrenador.equipoId;
  const equipoNombreUser = user.roles.entrenador.equipoNombre;

  // Intentamos comparar por EQUIPO_ID primero
  if (jugadorData.EQUIPO_ID) {
    if (jugadorData.EQUIPO_ID !== equipoIdUser) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    return;
  }

  // Si no existe EQUIPO_ID en jugador, vamos a comparar por nombre
  if (jugadorData.EQUIPO && equipoNombreUser) {
    if (jugadorData.EQUIPO !== equipoNombreUser) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    return;
  }

  // Último recurso: si el jugador solo tiene EQUIPO (nombre), resolvemos su EQUIPO_ID y comparamos
  if (jugadorData.EQUIPO) {
    const equipoIdJugador = await getEquipoIdPorNombre(jugadorData.EQUIPO);
    if (!equipoIdJugador || equipoIdJugador !== equipoIdUser) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    return;
  }

  const err = new Error("Forbidden");
  err.status = 403;
  throw err;
}

// Migración (obtener EQUIPO_ID) ---------------------------------

async function migrarEquipoId({ dryRun = true } = {}) {
  const jugadoresSnap = await db.collection('JUGADORES').get();

  let total = 0;
  let migrados = 0;
  let sinEquipo = 0;
  let sinMatch = 0;

  // cache por nombre de equipo para no consultar EQUIPOS mil veces
  const cache = new Map();

  // batch para escribir (máximo 500 ops por batch)
  let batch = db.batch();
  let ops = 0;

  for (const doc of jugadoresSnap.docs) {
    total++;
    const data = doc.data();

    const equipoNombre = data.EQUIPO;
    const equipoIdActual = data.EQUIPO_ID;

    if (!equipoNombre && !equipoIdActual) {
      sinEquipo++;
      continue;
    }

    // Si ya hay EQUIPO_ID, no tocamos
    if (equipoIdActual) continue;

    // Buscar id de EQUIPOS por nombre
    if (!cache.has(equipoNombre)) {
      const eqSnap = await db.collection('EQUIPOS')
        .where('EQUIPO', '==', equipoNombre)
        .limit(1)
        .get();

      cache.set(equipoNombre, eqSnap.empty ? null : eqSnap.docs[0].id);
    }

    const equipoId = cache.get(equipoNombre);

    if (!equipoId) {
      sinMatch++;
      continue;
    }

    migrados++;

    if (!dryRun) {
      batch.update(doc.ref, { EQUIPO_ID: equipoId });

      ops++;
      if (ops >= 450) { // margen de seguridad
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
  }

  if (!dryRun && ops > 0) await batch.commit();

  return { total, migrados, sinEquipo, sinMatch, dryRun };
}

// CRUD ---------------------------------------------------

async function getJugadores(user) {
  const snap = await db.collection(JUGADORES).get();
  const jugadores = snap.docs.map((d) => {
    const data = d.data();
    return { 
      id: d.id, 
      ...data,
      // Normalizar campos importantes a mayúsculas para consistencia
      CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
      SEXO: normalizeField(data.SEXO || data.sexo),
      POSICION: normalizeField(data.POSICION || data.posicion),
      ESTADO: normalizeField(data.ESTADO || data.estado)
    }
  });

  // Admin/Delegado -> todos
  if (isAdmin(user) || isDelegado(user)) return jugadores;

  // Entrenador -> solo los de su equipo
  if (isEntrenador(user)) {
    const { equipoId, equipoNombre } = user.roles.entrenador;

    return jugadores.filter((j) => {
      if (j.EQUIPO_ID) return j.EQUIPO_ID === equipoId;
      if (j.EQUIPO && equipoNombre) return j.EQUIPO === equipoNombre;
      return false;
    });
  }

  // Otros roles/no rol
  const err = new Error("Forbidden");
  err.status = 403;
  throw err;
}

async function getJugadorById(id, user) {
  const doc = await db.collection(JUGADORES).doc(id).get();
  if (!doc.exists) {
    const err = new Error("Jugador no encontrado");
    err.status = 404;
    throw err;
  }

  const data = doc.data();
  const jugador = { 
    id: doc.id, 
    ...data,
    // Normalizar campos importantes a mayúsculas para consistencia
    CATEGORIA: normalizeField(data.CATEGORIA || data.categoria),
    SEXO: normalizeField(data.SEXO || data.sexo),
    POSICION: normalizeField(data.POSICION || data.posicion),
    ESTADO: normalizeField(data.ESTADO || data.estado)
  };
  await assertEntrenadorPuedeTocarJugador(user, jugador);

  return jugador;
}

async function createJugador(data, user) {
  // Solo admin o delegado
  if (!(isAdmin(user) || isDelegado(user))) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const clean = await normalizeEquipoFields(data);

  // Aquí podríamos meter validaciones más duras si quisieramos!!
  const ref = await db.collection(JUGADORES).add(clean);
  return { id: ref.id };
}

async function updateJugador(id, updateData, user) {
  const ref = db.collection(JUGADORES).doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    const err = new Error("Jugador no encontrado");
    err.status = 404;
    throw err;
  }

  const jugadorActual = { id: doc.id, ...doc.data() };

  // Entrenador: solo si es su equipo y solo ciertos campos
  if (!(isAdmin(user) || isDelegado(user))) {
    await assertEntrenadorPuedeTocarJugador(user, jugadorActual);

    const permitido = pickAllowedFields(updateData, CAMPOS_ENTRENADOR);

    // Si no manda nada permitido, no hacemos update “vacío”
    if (Object.keys(permitido).length === 0) {
      const err = new Error("No hay campos permitidos para actualizar");
      err.status = 400;
      throw err;
    }

    await ref.update(permitido);
    return { id };
  }

  // Admin/Delegado: pueden actualizar más, pero evitamos que un update cambie “equipo” de forma accidental
  const { EQUIPO, EQUIPO_ID, ...rest } = updateData;
  const safe = await normalizeEquipoFields(rest);

  await ref.update(safe);
  return { id };
}

async function deleteJugador(id, user) {
  // Solo admin o delegado
  if (!(isAdmin(user) || isDelegado(user))) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const ref = db.collection(JUGADORES).doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    const err = new Error("Jugador no encontrado");
    err.status = 404;
    throw err;
  }

  await ref.delete();
  return { id };
}

module.exports = {
  migrarEquipoId,
  getJugadores,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador,
};
