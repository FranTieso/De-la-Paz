const clasificacionesService = require('../services/clasificaciones.service');

// GET /api/clasificaciones/liga/:ligaId
const getClasificacionByLiga = async (req, res, next) => {
  try {
    const { ligaId } = req.params;
    const data = await clasificacionesService.obtenerClasificacionPorLiga(ligaId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasificacionByLiga
};
