const calendarioService = require('../services/calendario.service');

// GET /api/calendario/liga/:ligaId
const getCalendarioByLiga = async (req, res, next) => {
  try {
    const { ligaId } = req.params;
    if (!ligaId) return res.status(400).json({ error: 'ID de liga requerido' });

    const rounds = await calendarioService.obtenerCalendarioPorLiga(ligaId);
    res.status(200).json(rounds);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCalendarioByLiga };
