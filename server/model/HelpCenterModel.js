const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const HelpCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

HelpCenterSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("helpcenters", HelpCenterSchema);
