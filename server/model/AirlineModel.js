const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const AirlinesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    common_name: {
      type: String,
      default: "",
      //   required: true,
    },
    code: {
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

AirlinesSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("airlines", AirlinesSchema);
