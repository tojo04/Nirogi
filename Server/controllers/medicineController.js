const Medicine = require('../models/Medicine');

// GET /api/v1/medications/search?q=paracetamol&limit=5
exports.searchMedicines = async (req, res, next) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const query = q
      ? { name: { $regex: q, $options: 'i' } }
      : {};

    const medicines = await Medicine.find(query).limit(Number(limit));
    res.json({ data: medicines });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/medications/:id
exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ data: medicine });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/medications/class/:drugClass
exports.getByClass = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ drugClass: req.params.drugClass });
    res.json({ data: medicines });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/medications/popular
exports.getPopular = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const medicines = await Medicine.find()
      .sort({ popularity: -1 })
      .limit(Number(limit));
    res.json({ data: medicines });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/medications
exports.createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ data: medicine });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/medications/:id
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ data: medicine });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/medications/:id
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
