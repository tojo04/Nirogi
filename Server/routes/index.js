const express = require('express');

const medicineRoutes = require('./medicineRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/medications', medicineRoutes);
router.use('/admin', adminRoutes);

// Basic status endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Nirogi API v1' });
});

module.exports = router;


