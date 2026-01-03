// Script para probar la conexión con Firebase
require('dotenv').config();
const { db, auth } = require('../api/config/firebase');

async function testConnection() {
  console.log('🔍 Probando conexión con Firebase...\n');

  try {
    // Test 1: Firestore
    console.log('1️⃣ Probando Firestore...');
    const testCollection = await db.collection('USUARIOS').limit(1).get();
    console.log('✅ Firestore conectado correctamente');
    console.log(`   Documentos en USUARIOS: ${testCollection.size}\n`);

    // Test 2: Auth
    console.log('2️⃣ Probando Firebase Auth...');
    const usersList = await auth.listUsers(1);
    console.log('✅ Firebase Auth conectado correctamente');
    console.log(`   Usuarios registrados: ${usersList.users.length}\n`);

    // Test 3: Colecciones disponibles
    console.log('3️⃣ Verificando colecciones...');
    const collections = ['USUARIOS', 'EQUIPOS', 'CATEGORIAS', 'LIGAS'];

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      const status = snapshot.empty ? '⚠️  Vacía' : '✅ Con datos';
      console.log(`   ${status} - ${collectionName}`);
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✨ Tu API está lista para usar\n');

  } catch (error) {
    console.error('❌ Error en la conexión:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('   1. El archivo firebase-adminsdk.json existe');
    console.error('   2. Las credenciales son correctas');
    console.error('   3. Tienes acceso a internet\n');
    process.exit(1);
  }
}

testConnection();
