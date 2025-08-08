const express = require('express');
const router = express.Router();
const { searchMedicines } = require('../controllers/medicineController');

// GET /api/v1/medications/search
router.get('/search', searchMedicines);

module.exports = router;
