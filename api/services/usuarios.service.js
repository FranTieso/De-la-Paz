// api/services/usuarios.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const equiposService = require('./equipos.service');

// Para borrar campos en Firestore (migración para incluir equipoId en usuarios)
const { FieldValue } = require('firebase-admin').firestore;

// Helpers internos
function _sinPassword(doc) {
  const data = doc.data() || {};
  const safe = { ...data };
  delete safe.contra;
  delete safe.password; // por si alguien lo guardó mal alguna vez
  return { id: doc.id, ...safe };
}

async function obtenerUsuarios() {
  const snapshot = await db.collection('USUARIOS').orderBy('nombre').get();
  return snapshot.docs.map(_sinPassword);
}

async function obtenerUsuarioPorId(id) {
  const doc = await db.collection('USUARIOS').doc(id).get();
  if (!doc.exists) return null;
  return _sinPassword(doc);
}

async function obtenerUsuariosPorArbitro() {
  const snapshot = await db.collection('USUARIOS')
    .where('roles.arbitro', '==', true)
    .get();
  return snapshot.docs.map(_sinPassword);
}

async function existeEmail(mail) {
  const snap = await db.collection('USUARIOS').where('mail', '==', mail).limit(1).get();
  return !snap.empty;
}

async function existeNumeroDocumento(numeroDocumento) {
  const snap = await db.collection('USUARIOS')
    .where('numeroDocumento', '==', numeroDocumento)
    .limit(1)
    .get();
  return !snap.empty;
}

async function crearUsuario({ mail, password, userData = {} }) {

  // 1) Garantizar unicidad de email
  const mailExists = await existeEmail(mail);
  if (mailExists) {
    const error = new Error('El correo electrónico ya está en uso.');
    error.status = 409;
    error.code = 'EMAIL_DUPLICADO';
    throw error;
  }

  // 2) Garantizar unicidad de numeroDocumento (DNI) si viene
  const numeroDocumento = userData?.numeroDocumento;
  if (numeroDocumento) {
    const dniExists = await existeNumeroDocumento(numeroDocumento);
    if (dniExists) {
      const error = new Error('Ya existe un usuario con ese número de documento.');
      error.status = 409;
      error.code = 'DNI_DUPLICADO';
      throw error;
    }
  }

  // 3) Lo pasamos a bcrypt
  const hash = await bcrypt.hash(password, 10);

  const toSave = {
    mail,
    contra: hash,
    ...userData
};


  const docRef = await db.collection('USUARIOS').add(toSave);

  const createdDoc = await db.collection('USUARIOS').doc(docRef.id).get();
  return _sinPassword(createdDoc);
}


async function actualizarUsuario(id, updateData) {
  // Por seguridad, no permitir actualizar el password desde aquí
  delete updateData.password;
  delete updateData.contra;

  const ref = db.collection('USUARIOS').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;

  await ref.update(updateData);

  const updatedDoc = await ref.get();
  return _sinPassword(updatedDoc);
}

async function eliminarUsuario(id) {
  const ref = db.collection('USUARIOS').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;

  await ref.delete();
  return true;
}

async function loginUsuario({ mail, password }) {
  const snap = await db.collection('USUARIOS')
    .where('mail', '==', mail)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const usuarioDoc = snap.docs[0];
  const usuarioData = usuarioDoc.data();
  const stored = usuarioData.contra || usuarioData.password;
  if (!stored) return null;

  // Obtener la contraseña almacenada
  const esHash =
    typeof stored === 'string' &&
    (stored.startsWith('$2a$') ||
     stored.startsWith('$2b$') ||
     stored.startsWith('$2y$'));

  let passwordCorrecta = false;

  // Comparar contraseñas
  if (esHash) {
    passwordCorrecta = await bcrypt.compare(password, stored);
  } else {
    // compatibilidad con usuarios antiguos
    passwordCorrecta = stored === password;
  }

  if (!passwordCorrecta) return null;
  
  // Antes de generar el JWT
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no definido en .env');
  }

  // Obtener equipoId del usuario (si tiene rol delegado o entrenador)
  const equipoIdFromRoles =
  usuarioData?.roles?.delegado?.equipoId ||
  usuarioData?.roles?.entrenador?.equipoId ||
  null;

  // Generar JWT
  const token = jwt.sign(
  {
    uid: usuarioDoc.id,
    mail: usuarioData.mail,
    roles: usuarioData.roles || {},
    equipoId: equipoIdFromRoles
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
);

  // Respuesta de login sin contraseña
  return {
    token,
    usuario: {
      id: usuarioDoc.id,
      mail: usuarioData.mail,
      nombre: usuarioData.nombre,
      apellido1: usuarioData.apellido1,
      apellido2: usuarioData.apellido2,
      roles: usuarioData.roles || {},
    }
  };
}

async function migrarRolesEquipo({ dryRun = true } = {}) {
  const snapshot = await db.collection('USUARIOS').get();

  let total = 0;
  let migrados = 0;
  let sinEquipo = 0;
  let sinMatch = 0;

  for (const doc of snapshot.docs) {
    total++;

    const data = doc.data() || {};
    const updates = {};

    // MIGRAR ADMINISTRADOR (legacy) -> ADMIN
    if (data?.roles?.administrador === true && !data?.roles?.admin) {
      updates['roles.admin'] = true;
      updates['roles.administrador'] = FieldValue.delete();
      migrados++;
    }

    const roles = data.roles || {};
    // Caso antiguo: roles.delegado.equipo (NOMBRE)
    const delegadoNombre = roles?.delegado?.equipo;
    const entrenadorNombre = roles?.entrenador?.equipo;

    // si no hay nada que migrar, saltamos
    if (!delegadoNombre && !entrenadorNombre && Object.keys(updates).length === 0) continue;

    // MIGRAR DELEGADO
    if (delegadoNombre) {
      const eq = await equiposService.obtenerEquipoPorNombre(delegadoNombre);
      if (!eq) {
        sinMatch++;
      } else {
        updates['roles.delegado.equipoId'] = eq.id;
        updates['roles.delegado.equipoNombre'] = delegadoNombre;
        updates['roles.delegado.equipo'] = FieldValue.delete(); // borrar antiguo
        migrados++;
      }
    }

    // MIGRAR ENTRENADOR
    if (entrenadorNombre) {
      const eq = await equiposService.obtenerEquipoPorNombre(entrenadorNombre);
      if (!eq) {
        sinMatch++;
      } else {
        updates['roles.entrenador.equipoId'] = eq.id;
        updates['roles.entrenador.equipoNombre'] = entrenadorNombre;
        updates['roles.entrenador.equipo'] = FieldValue.delete();
        migrados++;
      }
    }

    if (Object.keys(updates).length === 0) {
      sinEquipo++;
      continue;
    }

    // Si hay updates...
    if (!dryRun && Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
    }
  }
  return { total, migrados, sinEquipo, sinMatch, dryRun };
}

async function actualizarContactoUsuario(userId, payload, actorUser) {
  const userRef = db.collection('USUARIOS').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return null;

  const targetData = userDoc.data();
  const actorRoles = (actorUser && actorUser.roles && typeof actorUser.roles === "object") ? actorUser.roles : {};
  const isAdmin = actorRoles.admin === true;

  if (!isAdmin) {
    const actorTeamIds = [];
    if (actorRoles.entrenador?.equipoId) actorTeamIds.push(actorRoles.entrenador.equipoId);
    if (actorRoles.delegado?.equipoId) actorTeamIds.push(actorRoles.delegado.equipoId);

    const targetTeamId = targetData?.roles?.jugador?.equipoId;

    if (!targetTeamId || !actorTeamIds.includes(targetTeamId)) {
      const err = new Error('No tienes permisos para editar el contacto de este jugador.');
      err.status = 403;
      throw err;
    }
  }

  // Aplicar update
  await userRef.update(payload);

  // devolver usuario actualizado (sin contra si tu servicio ya la oculta; si no, la quitamos)
  const updatedDoc = await userRef.get();
  const updated = { id: updatedDoc.id, ...updatedDoc.data() };
  delete updated.contra;

  return updated;
}


module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuariosPorArbitro,
  existeEmail,
  existeNumeroDocumento,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
  migrarRolesEquipo,
  actualizarContactoUsuario
};
