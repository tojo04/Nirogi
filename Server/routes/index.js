const express = require('express');
const router = express.Router();

const medicineRoutes = require('./medicineRoutes');

router.use('/medications', medicineRoutes);

module.exports = router;
