const partidosService = require('../services/partidos.service');

// POST /api/partidos - Crear un partido individual
const crearPartido = async (req, res, next) => {
    try {
        const partidoData = req.body;

        // Validaciones básicas
        if (!partidoData.LOCAL || !partidoData.VISITANTE || !partidoData.LIGA) {
            return res.status(400).json({ 
                error: 'Se requieren los campos LOCAL, VISITANTE y LIGA' 
            });
        }

        // Estructura del partido según los campos requeridos
        const partido = {
            AMARILLASLOCAL: partidoData.AMARILLASLOCAL || 0,
            AMARILLASVISITANTES: partidoData.AMARILLASVISITANTES || 0,
            ARBITRO: partidoData.ARBITRO || null,
            CAMPO: partidoData.CAMPO || null,
            CORNERLOCAL: partidoData.CORNERLOCAL || 0,
            CORNERVISITANTE: partidoData.CORNERVISITANTE || 0,
            FALTASLOCAL: partidoData.FALTASLOCAL || 0,
            FALTASVISITANTE: partidoData.FALTASVISITANTE || 0,
            FECHA: partidoData.FECHA ? new Date(partidoData.FECHA) : new Date(),
            GOLESLOCAL: partidoData.GOLESLOCAL || 0,
            GOLESVISITANTE: partidoData.GOLESVISITANTE || 0,
            JORNADA: partidoData.JORNADA || 1,
            LIGA: partidoData.LIGA,
            LOCAL: partidoData.LOCAL,
            ROJASLOCAL: partidoData.ROJASLOCAL || 0,
            ROJASVISITANTE: partidoData.ROJASVISITANTE || 0,
            TIEMPOJUEGO: partidoData.TIEMPOJUEGO || 0,
            VISITANTE: partidoData.VISITANTE
        };

        const resultado = await partidosService.guardarPartido(partido);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
};

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

// GET /api/partidos/nombre/:nombreLiga
const getPartidosByNombreLiga = async (req, res, next) => {
    try {
        const { nombreLiga } = req.params;
        if (!nombreLiga) {
            return res.status(400).json({ error: 'Nombre de liga requerido' });
        }

        const partidos = await partidosService.obtenerPartidosPorNombreLiga(decodeURIComponent(nombreLiga));
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

// PUT /api/partidos/:id - Actualizar un partido
const updatePartido = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID de partido requerido' });
        }

        // Validar que hay datos para actualizar
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
        }

        const resultado = await partidosService.actualizarPartido(id, updateData);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    crearPartido,
    crearPartidosBatch,
    getPartidosByLiga,
    getPartidosByNombreLiga,
    deletePartidosByLiga,
    updatePartido
};
