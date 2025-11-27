
const express = require('express');
const admin = require('firebase-admin');

// --- Conexión a Firebase con credenciales de administrador ---
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();
const app = express();

// --- Middlewares ---
app.use(express.static('public'));
app.use(express.json());

// --- API Endpoints ---

// Endpoint para OBTENER todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('USUARIOS').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error en el servidor al obtener los usuarios.' });
  }
});

// Endpoint para CREAR un nuevo usuario (Auth + Firestore)
app.post('/api/usuarios', async (req, res) => {
  const { mail, password, ...userData } = req.body;
  const numeroDocumento = (userData.numeroDocumento || '').toString().trim();

  if (!mail || !password) {
    return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
  }

  try {
    console.log('POST /api/usuarios - body:', JSON.stringify(req.body));
    // 0. Check for existing user by numeroDocumento in Firestore
    if (numeroDocumento) {
      const existsDNI = await db.collection('USUARIOS').where('numeroDocumento', '==', numeroDocumento).get();
      if (!existsDNI.empty) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese número de documento.' });
      }
    }
    // 0b. Check for existing user by email in Firebase Auth
    try {
      const existingAuth = await auth.getUserByEmail(mail);
      if (existingAuth) {
        return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
      }
    } catch (err) {
      // If the error is that the user is not found, we can continue. For other errors, log and fail.
      if (err.code && err.code === 'auth/user-not-found') {
        // Not found -> proceed
      } else {
        console.error('Error comprobando correo en Auth: ', err);
        return res.status(500).json({ message: 'Error en el servidor al comprobar el correo.' });
      }
    }

    // 1. Crear el usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email: mail,
      password: password,
      disabled: false
    });
    console.log('Firebase Auth created user: ', userRecord.uid, userRecord.email);

    // 2. Guardar los datos adicionales en Firestore usando el UID como ID del documento
    const toSave = { mail, ...userData };
    console.log('Saving Firestore USUARIOS doc %s => %o', userRecord.uid, toSave);
    // Incluimos explícitamente el correo electrónico en el documento
    await db.collection('USUARIOS').doc(userRecord.uid).set(toSave);

    res.status(201).json({ message: 'Usuario creado con éxito', uid: userRecord.uid });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    // Ofrecer un mensaje de error más específico
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
    }
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'El correo electrónico no es válido.' });
    }
    res.status(500).json({ message: error.message || 'Error en el servidor al crear el usuario.' });
  }
});

// Endpoint para OBTENER todos los equipos
app.get('/api/equipos', async (req, res) => {
  try {
    const equiposSnapshot = await db.collection('EQUIPOS').get();
    const equipos = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    res.status(500).json({ message: 'Error en el servidor al obtener los equipos.' });
  }
});

// Endpoint para CREAR un nuevo equipo (con validación de categoría)
app.post('/api/equipos', async (req, res) => {
  try {
    const nuevoEquipo = req.body;
    // Verificamos que tanto el nombre del equipo como el ID de la categoría existan
    if (!nuevoEquipo.EQUIPO || !nuevoEquipo.CATEGORIA_ID) {
        return res.status(400).json({ message: 'Los campos EQUIPO y CATEGORIA_ID son obligatorios.' });
    }
    // Normalizar valores
    const nombreEquipoNormalized = (nuevoEquipo.EQUIPO || '').trim();
    const categoriaId = (nuevoEquipo.CATEGORIA_ID || '').trim();

    // Verificamos que la categoría existe en la colección CATEGORIAS
    const categoriaDoc = await db.collection('CATEGORIAS').doc(categoriaId).get();
    if (!categoriaDoc.exists) {
      return res.status(400).json({ message: 'La categoría seleccionada no existe.' });
    }
    const categoriaData = categoriaDoc.data() || {};
    // Compatibilidad con nombres de campo que pueden ser 'CATEGORIA' o 'NOMBRE'
    const categoriaNombre = (categoriaData.CATEGORIA || categoriaData.NOMBRE || '').trim();
    const categoriaTipo = (categoriaData.TIPO || categoriaData.tipo || '').trim();

    // Verificar duplicados por nombre de equipo y nombre de categoría (no por ID)
    const duplicateQuery = await db.collection('EQUIPOS')
      .where('EQUIPO', '==', nombreEquipoNormalized)
      .where('CATEGORIA', '==', categoriaNombre)
      .get();
    if (!duplicateQuery.empty) {
      return res.status(409).json({ message: 'Ya existe un equipo con ese nombre en la categoría seleccionada.' });
    }
    // Guardamos los datos normalizados: guardamos CATEGORIA (nombre) y TIPO desde la colección de Categorías
    const toSave = { EQUIPO: nombreEquipoNormalized, CATEGORIA: categoriaNombre, TIPO: categoriaTipo };
    const docRef = await db.collection('EQUIPOS').add(toSave);
    res.status(201).json({ id: docRef.id, ...nuevoEquipo });
  } catch (error) {
    console.error("Error al crear equipo:", error);
    res.status(500).json({ message: 'Error en el servidor al crear el equipo.' });
  }
});

// Endpoint para OBTENER todas las categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const categoriasSnapshot = await db.collection('CATEGORIAS').get();
    const categorias = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: 'Error en el servidor al obtener las categorías.' });
  }
});

// Endpoint para CREAR una nueva categoría
app.post('/api/categorias', async (req, res) => {
  try {
    const nuevaCategoria = req.body;
    const docRef = await db.collection('CATEGORIAS').add(nuevaCategoria);
    res.status(201).json({ id: docRef.id, ...nuevaCategoria });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: 'Error en el servidor al crear la categoría.' });
  }
});

// Endpoint para CREAR una nueva liga
app.post('/api/ligas', async (req, res) => {
  try {
    const { NOMBRE, TEMPORADA, NUM_EQUIPOS } = req.body;

    // Validación básica en el servidor
    if (!NOMBRE || !TEMPORADA || !NUM_EQUIPOS) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const nuevaLiga = {
      NOMBRE,
      TEMPORADA,
      NUM_EQUIPOS
    };

    // Usamos add() para que Firestore genere el ID automáticamente
    const docRef = await db.collection('LIGAS').add(nuevaLiga);

    // Devolvemos el nuevo objeto junto con su ID generado
    res.status(201).json({ id: docRef.id, ...nuevaLiga });

  } catch (error) {
    console.error("Error al crear la liga:", error);
    res.status(500).json({ message: 'Error en el servidor al crear la liga.' });
  }
});


// --- Puerto de escucha ---
const PORT = process.env.PORT || 3001; // Cambiado a 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Accede a tu web en http://localhost:${PORT}`);
});
