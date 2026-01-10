// Script para crear usuario administrador
require('dotenv').config();
const { db } = require('../api/config/firebase');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  console.log('🔍 Verificando usuario administrador...\n');

  try {
    const adminEmail = 'admin@test.com';
    const adminPassword = '123456';

    // Verificar si ya existe
    const existingUser = await db.collection('USUARIOS')
      .where('mail', '==', adminEmail)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      console.log('✅ Usuario administrador ya existe');
      const userData = existingUser.docs[0].data();
      console.log(`   Email: ${userData.mail}`);
      console.log(`   Nombre: ${userData.nombre} ${userData.apellido1}`);
      console.log(`   Roles: ${JSON.stringify(userData.roles)}\n`);
      return;
    }

    // Crear usuario administrador
    console.log('🔧 Creando usuario administrador...');
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminData = {
      mail: adminEmail,
      contra: hashedPassword, // Contraseña hasheada
      password: hashedPassword, // Campo alternativo
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

    const docRef = await db.collection('USUARIOS').add(adminData);
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log(`   ID: ${docRef.id}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Contraseña: ${adminPassword}`);
    console.log(`   Roles: admin, administrador\n`);

    console.log('🎉 ¡Ya puedes hacer login como administrador!');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    process.exit(1);
  }
}

createAdminUser();