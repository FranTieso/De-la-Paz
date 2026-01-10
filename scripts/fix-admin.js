// Script para crear correctamente el usuario administrador
require('dotenv').config();
const { db } = require('../api/config/firebase');
const bcrypt = require('bcrypt');

async function fixAdminUser() {
  console.log('🔧 Creando usuario administrador correctamente...\n');

  try {
    const adminEmail = 'admin@test.com';
    const adminPassword = '123456';

    // Verificar si ya existe
    console.log('🔍 Verificando si existe usuario administrador...');
    const existingUser = await db.collection('USUARIOS')
      .where('mail', '==', adminEmail)
      .get();

    if (!existingUser.empty) {
      console.log('⚠️  Usuario ya existe, eliminando para recrear...');
      const batch = db.batch();
      existingUser.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Usuario anterior eliminado');
    }

    // Crear usuario administrador con contraseña en texto plano para debug
    console.log('🔧 Creando nuevo usuario administrador...');
    
    const adminData = {
      mail: adminEmail,
      contra: adminPassword,        // Texto plano para debug
      password: adminPassword,      // Campo alternativo
      nombre: 'Administrador',
      apellido1: 'Sistema',
      apellido2: '',
      numeroDocumento: 'ADMIN001',
      movil: '000000000',
      roles: {
        admin: true,
        administrador: true
      },
      fechaCreacion: new Date(),
      activo: true
    };

    // Usar add() en lugar de set() para asegurar que se crea
    const docRef = await db.collection('USUARIOS').add(adminData);
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log(`   ID: ${docRef.id}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Contraseña: ${adminPassword} (texto plano para debug)`);
    console.log(`   Roles: admin, administrador`);

    // Verificar que se creó correctamente
    console.log('\n🔍 Verificando creación...');
    const verification = await db.collection('USUARIOS')
      .where('mail', '==', adminEmail)
      .get();

    if (verification.empty) {
      console.log('❌ ERROR: No se pudo crear el usuario');
    } else {
      console.log('✅ Verificación exitosa - Usuario creado correctamente');
      const userData = verification.docs[0].data();
      console.log(`   Datos: ${JSON.stringify({
        mail: userData.mail,
        nombre: userData.nombre,
        roles: userData.roles
      }, null, 2)}`);
    }

    console.log('\n🎉 ¡Ahora puedes hacer login!');
    console.log('   Email: admin@test.com');
    console.log('   Contraseña: 123456');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

fixAdminUser();