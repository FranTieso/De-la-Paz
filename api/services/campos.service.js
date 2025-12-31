const { db } = require('../config/firebase');

async function obtenerTodosCampos() {
    const snapshot = await db.collection('CAMPOS').get();
    
    if (snapshot.empty) return [];
    
    const campos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    return campos;
}

async function obtenerCampoPorId(campoId) {
    const doc = await db.collection('CAMPOS').doc(campoId).get();
    
    if (!doc.exists) {
        throw new Error('Campo no encontrado');
    }
    
    return {
        id: doc.id,
        ...doc.data()
    };
}

async function crearCampo(campoData) {
    // Verificar si ya existe un campo con el mismo nombre
    const existingSnapshot = await db.collection('CAMPOS')
        .where('CAMPO', '==', campoData.CAMPO)
        .get();
    
    if (!existingSnapshot.empty) {
        throw new Error('Ya existe un campo con ese nombre');
    }

    // Verificar si ya existe un campo con el mismo número
    const existingNumSnapshot = await db.collection('CAMPOS')
        .where('NUM', '==', campoData.NUM)
        .get();
    
    if (!existingNumSnapshot.empty) {
        throw new Error('Ya existe un campo con ese número');
    }

    const docRef = db.collection('CAMPOS').doc();
    
    const data = {
        CAMPO: campoData.CAMPO,
        NUM: campoData.NUM,
        AFORO: campoData.AFORO,
        fechaCreacion: new Date()
    };
    
    await docRef.set(data);
    
    return {
        id: docRef.id,
        ...data
    };
}

async function actualizarCampo(campoId, campoData) {
    const docRef = db.collection('CAMPOS').doc(campoId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
        throw new Error('Campo no encontrado');
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (campoData.CAMPO) {
        const existingSnapshot = await db.collection('CAMPOS')
            .where('CAMPO', '==', campoData.CAMPO)
            .get();
        
        const existingDocs = existingSnapshot.docs.filter(d => d.id !== campoId);
        if (existingDocs.length > 0) {
            throw new Error('Ya existe un campo con ese nombre');
        }
    }

    // Si se está cambiando el número, verificar que no exista otro con el mismo número
    if (campoData.NUM) {
        const existingNumSnapshot = await db.collection('CAMPOS')
            .where('NUM', '==', campoData.NUM)
            .get();
        
        const existingNumDocs = existingNumSnapshot.docs.filter(d => d.id !== campoId);
        if (existingNumDocs.length > 0) {
            throw new Error('Ya existe un campo con ese número');
        }
    }

    const updateData = {
        ...campoData,
        fechaActualizacion: new Date()
    };

    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    return {
        id: updatedDoc.id,
        ...updatedDoc.data()
    };
}

async function eliminarCampo(campoId) {
    const docRef = db.collection('CAMPOS').doc(campoId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
        throw new Error('Campo no encontrado');
    }

    await docRef.delete();
    return true;
}

module.exports = {
    obtenerTodosCampos,
    obtenerCampoPorId,
    crearCampo,
    actualizarCampo,
    eliminarCampo
};