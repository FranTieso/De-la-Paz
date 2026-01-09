const { db } = require('../config/firebase');

async function guardarPartido(partido) {
    const docRef = db.collection('PARTIDOS').doc(); // Auto-ID
    
    const data = {
        ...partido,
        fechaCreacion: new Date(),
        estado: 'programado' // programado, finalizado, suspendido
    };
    
    await docRef.set(data);
    return { 
        id: docRef.id,
        message: 'Partido guardado correctamente',
        partido: data
    };
}

async function guardarPartidosBatch(partidos) {
    const batch = db.batch();

    partidos.forEach(partido => {
        const docRef = db.collection('PARTIDOS').doc(); // Auto-ID
        // Asegurar fechas
        const data = {
            ...partido,
            fechaCreacion: new Date(),
            estado: 'programado', // programado, finalizado, suspendido
            // Si la fecha viene como string ISO, convertir a Date de Firestore si se desea, 
            // pero Firestore SDK suele manejar Date objects. Nos aseguramos en el controller.
        };
        batch.set(docRef, data);
    });

    await batch.commit();
    return { message: `${partidos.length} partidos guardados correctamente.` };
}

async function obtenerPartidosPorLiga(ligaId) {
    const snapshot = await db.collection('PARTIDOS')
        .where('ligaId', '==', ligaId)
        .get();

    if (snapshot.empty) return [];

    if (snapshot.empty) {
        // Fallback legacy: partidos guardados con campo LIGA (nombre) en vez de ligaId
        const ligaDoc = await db.collection('LIGAS').doc(ligaId).get();
        if (!ligaDoc.exists) return [];

        const ligaNombre = ligaDoc.data().NOMBRE;
        if (!ligaNombre) return [];

        const legacySnap = await db.collection('PARTIDOS')
            .where('LIGA', '==', ligaNombre)
            .get();

        if (legacySnap.empty) return [];

        return legacySnap.docs.map(doc => {
        const data = doc.data();
          return {
            id: doc.id,
            ...data,
          // normalizamos fecha para el json
          fecha: data.FECHA && data.FECHA.toDate ? data.FECHA.toDate() : (data.fecha?.toDate ? data.fecha.toDate() : data.FECHA || data.fecha),
          };
       });
    }

    // Mapear resultados
    const partidos = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convertir Timestamps a fechas JS si es necesario para el return json
        return {
            id: doc.id,
            ...data,
            fecha: data.fecha && data.fecha.toDate ? data.fecha.toDate() : data.fecha
        };
    });

    // Ordenar en JavaScript en lugar de Firestore para evitar índices compuestos
    return partidos.sort((a, b) => {
        // Primero por jornada
        if (a.jornada !== b.jornada) {
            return (a.jornada || 0) - (b.jornada || 0);
        }
        // Luego por fecha
        const fechaA = new Date(a.fecha);
        const fechaB = new Date(b.fecha);
        return fechaA - fechaB;
    });
}

async function obtenerPartidosPorNombreLiga(nombreLiga) {
    const snapshot = await db.collection('PARTIDOS')
        .where('LIGA', '==', nombreLiga)
        .get();

    if (snapshot.empty) return [];

    const partidos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            fecha: data.fecha && data.fecha.toDate ? data.fecha.toDate() : data.fecha
        };
    });

    // Ordenar por fecha
    return partidos.sort((a, b) => {
        const fechaA = new Date(a.fecha);
        const fechaB = new Date(b.fecha);
        return fechaA - fechaB;
    });
}

async function eliminarPartidosPorLiga(ligaId) {
    // Firestore no permite delete de collection query en batch grande de una sola vez sin iterar, 
    // pero para tamaños razonables podemos hacerlo.
    const snapshot = await db.collection('PARTIDOS').where('ligaId', '==', ligaId).get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
}

module.exports = {
    guardarPartido,
    guardarPartidosBatch,
    obtenerPartidosPorLiga,
    obtenerPartidosPorNombreLiga,
    eliminarPartidosPorLiga
};
