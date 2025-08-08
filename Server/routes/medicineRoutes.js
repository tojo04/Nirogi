const express = require('express');
const router = express.Router();
const {
  searchMedicines,
  getMedicineById,
  getByClass,
  getPopular,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');

// Middleware and validation
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const medicineSchema = require('../validators/medicineSchema');

// Fallbacks in case middleware is not implemented
const auth =
  typeof authMiddleware === 'function'
    ? authMiddleware
    : (req, res, next) => next();
const validateRequest =
  typeof validate === 'function'
    ? validate(medicineSchema)
    : (req, res, next) => next();

// GET /api/v1/medications/search
router.get('/search', searchMedicines);

// GET /api/v1/medications/class/:drugClass
router.get('/class/:drugClass', getByClass);

// GET /api/v1/medications/popular
router.get('/popular', getPopular);

// GET /api/v1/medications/:id
router.get('/:id', getMedicineById);

// POST /api/v1/medications
router.post('/', auth, validateRequest, createMedicine);

// PUT /api/v1/medications/:id
router.put('/:id', auth, validateRequest, updateMedicine);

// DELETE /api/v1/medications/:id
router.delete('/:id', auth, deleteMedicine);

module.exports = router;
