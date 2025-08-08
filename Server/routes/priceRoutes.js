const express = require('express');
const router = express.Router();
const { getPrices } = require('../controllers/priceController');

router.get('/:medicine', getPrices);

module.exports = router;
