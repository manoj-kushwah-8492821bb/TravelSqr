const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    blogId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Blog" },
    email: { type: String, required: true },
    review: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
