const express = require('express');
const router = express.Router();

const medicineRoutes = require('./medicineRoutes');

const priceRoutes = require('./priceRoutes');


router.use('/medications', medicineRoutes);
router.use('/prices', priceRoutes);

const adminRoutes = require('./adminRoutes');






// Basic status endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Nirogi API v1' });
});

module.exports = router;
