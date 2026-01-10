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
    // 1. Intentar buscar por ligaId (nuevo formato)
    const snapshot = await db.collection('PARTIDOS')
        .where('ligaId', '==', ligaId)
        .get();

    if (!snapshot.empty) {
        // Encontrados por ligaId
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                fecha: data.fecha && data.fecha.toDate ? data.fecha.toDate() : data.fecha
            };
        });
    }

    // 2. Fallback: buscar por nombre de liga (formato legacy)
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
    // Primero obtener el nombre de la liga usando el ID
    const ligaSnapshot = await db.collection('LIGAS').doc(ligaId).get();
    
    if (!ligaSnapshot.exists) {
        throw new Error('Liga no encontrada');
    }
    
    const ligaData = ligaSnapshot.data();
    const nombreLiga = ligaData.NOMBRE;
    
    if (!nombreLiga) {
        throw new Error('Liga sin nombre válido');
    }
    
    // Ahora buscar partidos por el nombre de la liga
    const snapshot = await db.collection('PARTIDOS').where('LIGA', '==', nombreLiga).get();

    if (snapshot.empty) return 0;

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
}

async function actualizarPartido(partidoId, updateData) {
    const docRef = db.collection('PARTIDOS').doc(partidoId);
    
    // Verificar que el partido existe
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error('Partido no encontrado');
    }

    // Preparar datos de actualización
    const dataToUpdate = {
        ...updateData,
        fechaModificacion: new Date()
    };

    // Actualizar el documento
    await docRef.update(dataToUpdate);
    
    // Obtener el documento actualizado
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();
    
    return {
        id: partidoId,
        message: 'Partido actualizado correctamente',
        partido: {
            id: partidoId,
            ...updatedData,
            fecha: updatedData.fecha && updatedData.fecha.toDate ? updatedData.fecha.toDate() : updatedData.fecha
        }
    };
}

async function obtenerPartidoPorId(partidoId) {
    const docRef = db.collection('PARTIDOS').doc(partidoId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
        throw new Error('Partido no encontrado');
    }
    
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        fecha: data.fecha && data.fecha.toDate ? data.fecha.toDate() : data.fecha,
        FECHA: data.FECHA && data.FECHA.toDate ? data.FECHA.toDate() : data.FECHA
    };
}

async function obtenerPartidosPorArbitro(arbitroId) {
    const snapshot = await db.collection('PARTIDOS')
        .where('ARBITRO', '==', arbitroId)
        .get();

    if (snapshot.empty) return [];

    const partidos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            fecha: data.fecha && data.fecha.toDate ? data.fecha.toDate() : data.fecha,
            FECHA: data.FECHA && data.FECHA.toDate ? data.FECHA.toDate() : data.FECHA
        };
    });

    // Ordenar por fecha
    return partidos.sort((a, b) => {
        const fechaA = new Date(a.fecha || a.FECHA);
        const fechaB = new Date(b.fecha || b.FECHA);
        return fechaA - fechaB;
    });
}

module.exports = {
    guardarPartido,
    guardarPartidosBatch,
    obtenerPartidosPorLiga,
    obtenerPartidosPorNombreLiga,
    eliminarPartidosPorLiga,
    actualizarPartido,
    obtenerPartidoPorId,
    obtenerPartidosPorArbitro
};
