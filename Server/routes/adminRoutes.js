const express = require('express');
const { importPricing } = require('../services/medicineService');

const router = express.Router();

router.post('/pricing/import', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'query required' });
    }
    const results = await importPricing(query);
    res.json({ imported: results.length, results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

