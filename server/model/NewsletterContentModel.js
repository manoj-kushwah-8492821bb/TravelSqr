const mongoose = require("mongoose");

const NewsletterContentSchema = new mongoose.Schema(
    {
      subject: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  );

module.exports = mongoose.model("NewsletterContent", NewsletterContentSchema)
