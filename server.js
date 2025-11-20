
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

// Endpoint para obtener todos los usuarios
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

// Endpoint para obtener todos los equipos
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


// --- Puerto de escucha ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Accede a tu web en http://localhost:${PORT}`);
});

