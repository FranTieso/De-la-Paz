const { db } = require('../config/firebase');

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
        .orderBy('jornada', 'asc')
        .orderBy('fecha', 'asc') // Opcional, secundario
        .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Convertir Timestamps a fechas JS si es necesario para el return json
        return {
            id: doc.id,
            ...data,
            fecha: data.fecha && data.fecha.toDate ? data.fecha.toDate() : data.fecha
        };
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
    guardarPartidosBatch,
    obtenerPartidosPorLiga,
    eliminarPartidosPorLiga
};
