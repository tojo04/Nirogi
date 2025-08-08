const mongoose = require('mongoose');

const priceCacheSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now, expires: 3600 }
  },
  { timestamps: false }
);

module.exports = mongoose.model('PriceCache', priceCacheSchema);
