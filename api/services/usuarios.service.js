// api/services/usuarios.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

// Helpers internos
function _sinPassword(doc) {
  const data = doc.data() || {};
  const safe = { ...data };
  delete safe.contra;
  delete safe.password; // por si alguien lo guardó mal alguna vez
  return { id: doc.id, ...safe };
}

async function obtenerUsuarios() {
  const snapshot = await db.collection('USUARIOS').get();
  return snapshot.docs.map(_sinPassword);
}

async function obtenerUsuarioPorId(id) {
  const doc = await db.collection('USUARIOS').doc(id).get();
  if (!doc.exists) return null;
  return _sinPassword(doc);
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
  // Por seguridad, no permitir actualizar el password desde aquí :contentReference[oaicite:2]{index=2}
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

  // rol del usuario
  let rol = 'Sin rol';
  if (usuarioData.roles && typeof usuarioData.roles === 'object') {
    const rolesKeys = Object.keys(usuarioData.roles);
    if (rolesKeys.length > 0) rol = rolesKeys[0];
  }
  
  // Antes de generar el JWT
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no definido en .env');
  }

  // Generar JWT
  const token = jwt.sign(
  {
    uid: usuarioDoc.id,
    mail: usuarioData.mail,
    roles: usuarioData.roles || {}
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
      rol,
      roles: usuarioData.roles
    }
  };

}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  existeEmail,
  existeNumeroDocumento,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario
};
