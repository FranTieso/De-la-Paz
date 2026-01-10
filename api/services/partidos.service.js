const { db } = require('../config/firebase');

async function guardarPartido(partido) {
    try {
        const docRef = db.collection('PARTIDOS').doc(); // Auto-ID
        
        const data = {
            ...partido,
            fechaCreacion: new Date(),
            estado: partido.estado || 'programado' // programado, finalizado, suspendido
        };
        
        await docRef.set(data);
        return { 
            id: docRef.id,
            message: 'Partido guardado correctamente',
            partido: data
        };
    } catch (error) {
        console.error('Error en guardarPartido:', error);
        throw new Error(`Error al guardar partido: ${error.message}`);
    }
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
        const partidos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Mantener el campo FECHA exactamente como está en la base de datos
                FECHA: data.FECHA
            };
        });
        return partidos;
    }

    
    // 2. Fallback: buscar por nombre de liga (formato legacy)
    const ligaDoc = await db.collection('LIGAS').doc(ligaId).get();
    if (!ligaDoc.exists) {
        return [];
    }

    const ligaNombre = ligaDoc.data().NOMBRE;
    
    if (!ligaNombre) {
        return [];
    }

    const legacySnap = await db.collection('PARTIDOS')
        .where('LIGA', '==', ligaNombre)
        .get();

    if (legacySnap.empty) {
        return [];
    }

    const partidos = legacySnap.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Mantener el campo FECHA exactamente como está en la base de datos
            FECHA: data.FECHA
        };
    });
    
    return partidos;
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
            // Mantener el campo FECHA exactamente como está en la base de datos
            FECHA: data.FECHA
        };
    });

    // Ordenar por fecha usando solo el campo FECHA
    return partidos.sort((a, b) => {
        if (!a.FECHA && !b.FECHA) return 0;
        if (!a.FECHA) return 1;
        if (!b.FECHA) return -1;
        
        // Comparar como strings si no se pueden convertir a fechas
        return String(a.FECHA).localeCompare(String(b.FECHA));
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
            FECHA: updatedData.FECHA
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
        FECHA: data.FECHA
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
            FECHA: data.FECHA
        };
    });

    // Ordenar por fecha usando solo el campo FECHA
    return partidos.sort((a, b) => {
        if (!a.FECHA && !b.FECHA) return 0;
        if (!a.FECHA) return 1;
        if (!b.FECHA) return -1;
        
        // Comparar como strings si no se pueden convertir a fechas
        return String(a.FECHA).localeCompare(String(b.FECHA));
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
