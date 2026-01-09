const express = require('express');
const router = express.Router();

const calendarioController = require('../controllers/calendarioController');

// Público (solo lectura)
router.get('/liga/:ligaId', calendarioController.getCalendarioByLiga);

module.exports = router;
