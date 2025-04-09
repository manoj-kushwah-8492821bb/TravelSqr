const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
   
  },
  { timestamps: true }
);

faqSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("faq", faqSchema);
