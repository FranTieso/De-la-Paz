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

        // Manejar la fecha de forma más robusta
        let fechaPartido;
        if (partidoData.FECHA) {
            try {
                // Si viene como string ISO, mantenerlo así
                if (typeof partidoData.FECHA === 'string') {
                    // Verificar que es una fecha válida
                    const testDate = new Date(partidoData.FECHA);
                    if (!isNaN(testDate.getTime())) {
                        fechaPartido = partidoData.FECHA; // Mantener como string ISO
                    } else {
                        console.warn('Fecha inválida recibida:', partidoData.FECHA);
                        fechaPartido = new Date().toISOString();
                    }
                } else {
                    // Si viene como objeto Date, convertir a ISO
                    fechaPartido = new Date(partidoData.FECHA).toISOString();
                }
            } catch (error) {
                console.warn('Error parseando fecha:', partidoData.FECHA, error);
                fechaPartido = new Date().toISOString();
            }
        } else {
            fechaPartido = new Date().toISOString();
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
            FECHA: fechaPartido, // Almacenar como string ISO para consistencia
            FECHA_FORMATEADA: partidoData.FECHA_FORMATEADA || null, // Campo adicional para mostrar
            GOLESLOCAL: partidoData.GOLESLOCAL || 0,
            GOLESVISITANTE: partidoData.GOLESVISITANTE || 0,
            JORNADA: partidoData.JORNADA || 1,
            LIGA: partidoData.LIGA,
            LOCAL: partidoData.LOCAL,
            ROJASLOCAL: partidoData.ROJASLOCAL || 0,
            ROJASVISITANTE: partidoData.ROJASVISITANTE || 0,
            TIEMPOJUEGO: partidoData.TIEMPOJUEGO || 0,
            VISITANTE: partidoData.VISITANTE,
            estado: partidoData.estado || 'programado' // Incluir estado explícitamente
        };

        const resultado = await partidosService.guardarPartido(partido);
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en crearPartido:', error);
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
        console.error('❌ Error en getPartidosByLiga:', error);
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
        res.status(200).json(partidos);
    } catch (error) {
        console.error('❌ Error en getPartidosByNombreLiga:', error);
        next(error);
    }
};

// GET /api/partidos/:id
const getPartidoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'ID de partido requerido' });
        }

        const partido = await partidosService.obtenerPartidoPorId(id);
        res.status(200).json(partido);
    } catch (error) {
        next(error);
    }
};

// GET /api/partidos/arbitro/:arbitroId
const getPartidosByArbitro = async (req, res, next) => {
    try {
        const { arbitroId } = req.params;
        if (!arbitroId) {
            return res.status(400).json({ error: 'ID de árbitro requerido' });
        }

        const partidos = await partidosService.obtenerPartidosPorArbitro(arbitroId);
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

        // Verificar permisos básicos
        const isAdmin = req.user?.roles?.admin === true || req.user?.roles?.administrador === true;
        const isArbitro = req.user?.roles?.arbitro === true;
        
        if (!isAdmin && !isArbitro) {
            return res.status(403).json({ error: 'No tienes permisos para actualizar partidos' });
        }

        // Permitir edición para administradores y árbitros
        const resultado = await partidosService.actualizarPartido(id, updateData);
        res.status(200).json(resultado);
        
    } catch (error) {
        console.error('Error en updatePartido:', error);
        next(error);
    }
};

module.exports = {
    crearPartido,
    crearPartidosBatch,
    getPartidosByLiga,
    getPartidosByNombreLiga,
    getPartidoById,
    getPartidosByArbitro,
    deletePartidosByLiga,
    updatePartido
};
