const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const AirportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      //   required: true,
    },
    city: {
      type: String,
      //   required: true,
    },
    code: {
      type: String,
      // required: true,
    },
    countryCode: {
      type: String,
      // required: true,
    },
    status: {
      type: Number,
      required: true,
      default: 1, // * 1 Actived 2 Deactived
    },
  },
  { timestamps: true }
);

AirportSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("airports", AirportSchema);
