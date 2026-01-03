const camposService = require('../services/campos.service');

// GET /api/campos - Obtener todos los campos
const getCampos = async (req, res, next) => {
    try {
        const campos = await camposService.obtenerTodosCampos();
        res.status(200).json(campos);
    } catch (error) {
        next(error);
    }
};

// GET /api/campos/:id - Obtener campo por ID
const getCampoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campo = await camposService.obtenerCampoPorId(id);
        res.status(200).json(campo);
    } catch (error) {
        next(error);
    }
};

// POST /api/campos - Crear nuevo campo
const createCampo = async (req, res, next) => {
    try {
        const campoData = req.body;

        // Validaciones básicas
        if (!campoData.CAMPO || !campoData.NUM || !campoData.AFORO) {
            return res.status(400).json({ 
                error: 'Se requieren los campos CAMPO, NUM y AFORO' 
            });
        }

        const nuevoCampo = await camposService.crearCampo(campoData);
        res.status(201).json(nuevoCampo);
    } catch (error) {
        next(error);
    }
};

// PUT /api/campos/:id - Actualizar campo
const updateCampo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campoData = req.body;

        const campoActualizado = await camposService.actualizarCampo(id, campoData);
        res.status(200).json(campoActualizado);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/campos/:id - Eliminar campo
const deleteCampo = async (req, res, next) => {
    try {
        const { id } = req.params;
        await camposService.eliminarCampo(id);
        res.status(200).json({ message: 'Campo eliminado correctamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCampos,
    getCampoById,
    createCampo,
    updateCampo,
    deleteCampo
};