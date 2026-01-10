// Script para debuggear el proceso de login
require('dotenv').config();
const { db } = require('../api/config/firebase');
const bcrypt = require('bcrypt');

async function debugLogin() {
  console.log('🔍 Debuggeando proceso de login...\n');

  try {
    const testEmail = 'raulito@gmail.com'; // Email corregido
    const testPassword = '123456'; // Vamos a probar diferentes contraseñas

    console.log('📧 Buscando usuario con email:', testEmail);
    
    // Paso 1: Buscar usuario
    const snap = await db.collection('USUARIOS')
      .where('mail', '==', testEmail)
      .limit(1)
      .get();

    if (snap.empty) {
      console.log('❌ Usuario NO encontrado en la base de datos');
      console.log('   Verificando todos los usuarios...');
      
      const allUsers = await db.collection('USUARIOS').get();
      console.log(`   Total usuarios en BD: ${allUsers.size}`);
      
      allUsers.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.mail} (${data.nombre})`);
      });
      return;
    }

    console.log('✅ Usuario encontrado!');
    
    // Paso 2: Obtener datos del usuario
    const usuarioDoc = snap.docs[0];
    const usuarioData = usuarioDoc.data();
    
    console.log('📋 Datos del usuario:');
    console.log(`   ID: ${usuarioDoc.id}`);
    console.log(`   Email: ${usuarioData.mail}`);
    console.log(`   Nombre: ${usuarioData.nombre} ${usuarioData.apellido1}`);
    console.log(`   Roles: ${JSON.stringify(usuarioData.roles)}`);
    
    // Paso 3: Verificar contraseña
    const stored = usuarioData.contra || usuarioData.password;
    console.log(`\n🔐 Verificando contraseña:`);
    console.log(`   Campo 'contra': ${usuarioData.contra ? 'SÍ' : 'NO'}`);
    console.log(`   Campo 'password': ${usuarioData.password ? 'SÍ' : 'NO'}`);
    console.log(`   Contraseña almacenada: ${stored ? stored.substring(0, 20) + '...' : 'NO ENCONTRADA'}`);
    
    if (!stored) {
      console.log('❌ No hay contraseña almacenada');
      return;
    }

    // Paso 4: Detectar tipo de contraseña
    const esHash = typeof stored === 'string' && 
                   (stored.startsWith('$2a') || 
                    stored.startsWith('$2b') || 
                    stored.startsWith('$2y'));
    
    console.log(`   Tipo: ${esHash ? 'Hash bcrypt' : 'Texto plano'}`);
    
    // Paso 5: Probar validación
    let passwordCorrecta = false;
    
    if (esHash) {
      console.log(`   Comparando con bcrypt...`);
      passwordCorrecta = await bcrypt.compare(testPassword, stored);
    } else {
      console.log(`   Comparando texto plano...`);
      passwordCorrecta = stored === testPassword;
    }
    
    console.log(`   Resultado: ${passwordCorrecta ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
    
    if (!passwordCorrecta) {
      console.log('\n🔧 Intentando soluciones:');
      
      // Probar diferentes comparaciones
      console.log(`   Comparación directa: ${stored === testPassword}`);
      
      if (esHash) {
        console.log(`   Probando bcrypt con diferentes inputs...`);
        const variations = ['123456', ' 123456', '123456 ', 'admin123'];
        for (const variation of variations) {
          const result = await bcrypt.compare(variation, stored);
          console.log(`     "${variation}": ${result ? '✅' : '❌'}`);
        }
      }
    }

    // Paso 6: Verificar JWT_SECRET
    console.log(`\n🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'DEFINIDO' : '❌ NO DEFINIDO'}`);

  } catch (error) {
    console.error('❌ Error en debug:', error.message);
    console.error(error.stack);
  }
}

debugLogin();