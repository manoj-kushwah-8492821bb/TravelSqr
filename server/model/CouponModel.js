const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2"); // Import Plugin

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// ✅ Add Pagination Plugin
couponSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Coupon", couponSchema);
