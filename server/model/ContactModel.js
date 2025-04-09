const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    number: {
      type: String,
    },
    address: {
      type: String,
    },
    facebook_url: {
      type: String,
    },
    twitter_url: {
      type: String,
    },
    instagram_url: {
      type: String,
    },
    linkedin_url: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("contacts", contactSchema);
