const mongoose = require("mongoose");

const cmsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
      default: 1, // * 1 Actived 2 Deactived
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cms", cmsSchema);
