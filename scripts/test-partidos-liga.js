// Script para probar la obtención de partidos por liga
require('dotenv').config();
const partidosService = require('../api/services/partidos.service');

async function testPartidosLiga() {
  console.log('🔍 Probando obtención de partidos por liga...\n');

  try {
    // Primero buscar la liga "Pruebas"
    const { db } = require('../api/config/firebase');
    
    console.log('🔍 Buscando liga "Pruebas"...');
    const ligasSnap = await db.collection('LIGAS')
      .where('NOMBRE', '==', 'Pruebas')
      .get();
    
    if (ligasSnap.empty) {
      console.log('❌ No se encontró la liga "Pruebas"');
      
      // Mostrar todas las ligas disponibles
      const allLigas = await db.collection('LIGAS').get();
      console.log('\n📋 Ligas disponibles:');
      allLigas.docs.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, NOMBRE: "${data.NOMBRE}"`);
      });
      return;
    }
    
    const ligaDoc = ligasSnap.docs[0];
    const ligaData = ligaDoc.data();
    const ligaId = ligaDoc.id;
    
    console.log(`✅ Liga encontrada:`);
    console.log(`   ID: ${ligaId}`);
    console.log(`   NOMBRE: "${ligaData.NOMBRE}"`);
    
    console.log(`\n📡 Buscando partidos para liga: ${ligaId}`);
    
    const partidos = await partidosService.obtenerPartidosPorLiga(ligaId);
    
    console.log(`✅ Partidos encontrados: ${partidos.length}`);
    
    if (partidos.length > 0) {
      console.log('\n📋 Todos los partidos encontrados:');
      partidos.forEach((partido, index) => {
        console.log(`${index + 1}. ${partido.LOCAL || partido.local} vs ${partido.VISITANTE || partido.visitante}`);
        console.log(`   Estado: ${partido.estado || partido.ESTADO || 'sin estado'}`);
        console.log(`   Goles: ${partido.GOLESLOCAL || 0} - ${partido.GOLESVISITANTE || 0}`);
        console.log(`   Liga: ${partido.LIGA || partido.liga || partido.ligaId || 'sin liga'}`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron partidos para esta liga');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testPartidosLiga();