const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number], // [long, lat]
    required: true,
  },
});

const TopSightsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    destination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "destinations",
    },
    images: [
      {
        type: String,
      },
    ],
    // title: {
    //   type: String,
    //   default: "",
    // },
    // description: {
    //   type: String,
    //   required: true,
    // },
    // general_info: {
    //   type: Object,
    //   required: true,
    // },
    location: {
      type: pointSchema,
    },
    status: {
      type: Number,
      required: true,
      default: 1, // * 1 Actived 2 Deactived
    },
  },
  { timestamps: true }
);

TopSightsSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("topsights", TopSightsSchema);
