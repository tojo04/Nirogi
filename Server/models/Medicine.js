const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  pricing: [
    {
      pharmacy: String,
      price: Number,
      mrp: Number,
      discount_percent: Number,
      link: String
    }
  ]
});

module.exports = mongoose.model('Medicine', MedicineSchema);
