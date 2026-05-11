'use strict';

const express    = require('express');
const router     = express.Router();
const { searchDossier, getDossierFormats } = require('../controllers/dossierController');
const { validateSearchRequest }            = require('../middleware/validateRequest');

// POST /api/dossier/search  — primary dossier lookup
router.post('/search', validateSearchRequest, searchDossier);

// GET  /api/dossier/formats — documentation on accepted formats
router.get('/formats', getDossierFormats);

module.exports = router;
