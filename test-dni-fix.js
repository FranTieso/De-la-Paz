// Script para probar el fix del bug de validación DNI
// Ejecutar con: node test-dni-fix.js

const fetch = require('node-fetch'); // npm install node-fetch si no lo tienes

const BASE_URL = 'http://localhost:3002/api';

async function testDNIFix() {
  console.log('🧪 Iniciando test del fix de validación DNI...\n');

  try {
    // 1. Login como admin
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await fetch(`${BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mail: 'admin@example.com', // Cambia por tu email de admin
        password: 'tu_password'    // Cambia por tu password
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso\n');

    // 2. Obtener lista de usuarios para encontrar uno para probar
    console.log('2️⃣ Obteniendo usuarios...');
    const usersResponse = await fetch(`${BASE_URL}/usuarios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const users = await usersResponse.json();
    const testUser = users.find(u => u.numeroDocumento); // Buscar usuario con DNI

    if (!testUser) {
      console.log('❌ No se encontró usuario con DNI para probar');
      return;
    }

    console.log(`✅ Usuario de prueba encontrado: ${testUser.mail} (DNI: ${testUser.numeroDocumento})\n`);

    // 3. Test 1: Actualizar con el mismo DNI (debería funcionar)
    console.log('3️⃣ Test 1: Actualizar usuario con su propio DNI...');
    const sameDocResponse = await fetch(`${BASE_URL}/usuarios/${testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        numeroDocumento: testUser.numeroDocumento,
        nombre: testUser.nombre + ' (Actualizado)'
      })
    });

    if (sameDocResponse.ok) {
      console.log('✅ Test 1 PASÓ: Usuario puede actualizar con su propio DNI');
    } else {
      const error = await sameDocResponse.json();
      console.log('❌ Test 1 FALLÓ:', error.error);
    }

    // 4. Test 2: Actualizar con DNI nuevo válido
    console.log('\n4️⃣ Test 2: Actualizar con DNI nuevo válido...');
    const newValidDNI = '12345678Z'; // DNI válido de prueba
    
    const newDocResponse = await fetch(`${BASE_URL}/usuarios/${testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        numeroDocumento: newValidDNI
      })
    });

    if (newDocResponse.ok) {
      console.log('✅ Test 2 PASÓ: Usuario puede actualizar con DNI nuevo válido');
    } else {
      const error = await newDocResponse.json();
      console.log('❌ Test 2 FALLÓ:', error.error);
    }

    // 5. Test 3: Revertir al DNI original
    console.log('\n5️⃣ Test 3: Revirtiendo al DNI original...');
    const revertResponse = await fetch(`${BASE_URL}/usuarios/${testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        numeroDocumento: testUser.numeroDocumento
      })
    });

    if (revertResponse.ok) {
      console.log('✅ Test 3 PASÓ: DNI revertido correctamente');
    } else {
      const error = await revertResponse.json();
      console.log('❌ Test 3 FALLÓ:', error.error);
    }

    console.log('\n🎉 Tests completados!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar tests
testDNIFix();