const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    strength: {
      type: Number
    },
    unit: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true
    },
    pharmacyOffers: {
      type: [
        {
          pharmacy: {
            type: String,
            required: true,
            trim: true
          },
          price: {
            type: Number,
            required: true
          },
          mrp: {
            type: Number
          },
          discountPercent: {
            type: Number
          },
          link: {
            type: String,
            trim: true
          },
          lastUpdated: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },
    drugClass: {
      type: String,
      trim: true,
      index: true
    }
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

  { timestamps: true }
);


module.exports = mongoose.model('Medicine', MedicineSchema);
