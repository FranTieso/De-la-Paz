
const express = require('express');
const admin = require('firebase-admin');

// --- Conexión a Firebase con credenciales de administrador ---
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// --- Middlewares ---
// Servir archivos estáticos desde la carpeta 'public' (tu frontend)
app.use(express.static('public'));
// Permitir que el servidor entienda peticiones con cuerpo en formato JSON
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
    res.status(500).send('Error en el servidor al obtener los usuarios.');
  }
});

// Endpoint para CREAR un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    // Aquí no creamos el usuario en Firebase Auth, solo en la colección Firestore.
    const nuevoUsuario = req.body;

    // Validación básica
    if (!nuevoUsuario.mail || !nuevoUsuario.nombre || !nuevoUsuario.contra) {
      return res.status(400).send('Faltan campos obligatorios (email, nombre, contraseña).');
    }

    const docRef = await db.collection('USUARIOS').add(nuevoUsuario);
    res.status(201).json({ id: docRef.id, ...nuevoUsuario });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).send('Error en el servidor al crear el usuario.');
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
    res.status(500).send('Error en el servidor al obtener los equipos.');
  }
});

// Endpoint para CREAR un nuevo equipo
app.post('/api/equipos', async (req, res) => {
  try {
    const nuevoEquipo = req.body;
    if (!nuevoEquipo.EQUIPO) {
        return res.status(400).send('El campo EQUIPO es obligatorio.');
    }
    const docRef = await db.collection('EQUIPOS').add(nuevoEquipo);
    res.status(201).json({ id: docRef.id, ...nuevoEquipo });
  } catch (error) {
    console.error("Error al crear equipo:", error);
    res.status(500).send('Error en el servidor al crear el equipo.');
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
    res.status(500).send('Error en el servidor al obtener las categorías.');
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
    res.status(500).send('Error en el servidor al crear la categoría.');
  }
});


// --- Puerto de escucha ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Accede a tu web en http://localhost:${PORT}`);
});
