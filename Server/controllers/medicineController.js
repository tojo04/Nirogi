const Medicine = require('../models/Medicine');

// GET /api/v1/medications/search?q=paracetamol&limit=5
exports.searchMedicines = async (req, res, next) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const query = q
      ? { name: { $regex: q, $options: 'i' } }
      : {};

    const medicines = await Medicine.find(query).limit(Number(limit));
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};
