const resultadosService = require('../services/resultados.service');

// GET /api/resultados?ligaId=...&limit=...
const getResultados = async (req, res, next) => {
  try {
    const { ligaId, limit } = req.query;
    const data = await resultadosService.obtenerResultados({ ligaId: ligaId || null, limit: limit || null });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// GET /api/resultados/liga/:ligaId?limit=...
const getResultadosByLiga = async (req, res, next) => {
  try {
    const { ligaId } = req.params;
    const { limit } = req.query;
    const data = await resultadosService.obtenerResultados({ ligaId, limit: limit || null });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResultados,
  getResultadosByLiga
};



