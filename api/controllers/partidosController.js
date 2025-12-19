const partidosService = require('../services/partidos.service');

// POST /api/partidos/batch
const crearPartidosBatch = async (req, res, next) => {
    try {
        const { partidos } = req.body;

        if (!partidos || !Array.isArray(partidos) || partidos.length === 0) {
            return res.status(400).json({ error: 'Se requiere una lista de partidos válida.' });
        }

        // Validaciones básicas de estructura
        // Asumimos que el frontend envía { ligaId, jornada, fecha, local, visitante, ... }
        const partidosLimpios = partidos.map(p => ({
            ligaId: p.ligaId,
            jornada: parseInt(p.jornada),
            local: p.local,
            visitante: p.visitante,
            fecha: new Date(p.fecha), // Convertir string a Date
            temporada: p.temporada || 'N/A'
        }));

        const resultado = await partidosService.guardarPartidosBatch(partidosLimpios);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
};

// GET /api/partidos/liga/:ligaId
const getPartidosByLiga = async (req, res, next) => {
    try {
        const { ligaId } = req.params;
        if (!ligaId) {
            return res.status(400).json({ error: 'ID de liga requerido' });
        }

        const partidos = await partidosService.obtenerPartidosPorLiga(ligaId);
        res.status(200).json(partidos);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/partidos/liga/:ligaId
const deletePartidosByLiga = async (req, res, next) => {
    try {
        const { ligaId } = req.params;
        const count = await partidosService.eliminarPartidosPorLiga(ligaId);
        res.status(200).json({ message: `Se eliminaron ${count} partidos de la liga ${ligaId}` });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    crearPartidosBatch,
    getPartidosByLiga,
    deletePartidosByLiga
};
