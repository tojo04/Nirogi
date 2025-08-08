const express = require('express');

const medicineRoutes = require('./medicineRoutes');

router.use('/medications', medicineRoutes);




const router = express.Router();

// Basic status endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Nirogi API v1' });
});

module.exports = router;


