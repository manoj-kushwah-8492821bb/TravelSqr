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

const DestinationsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    title: {
      type: String,
      default: "",
      //   required: true,
    },
    description: {
      type: String,
      required: true,
    },
    general_info: {
      type: Object,
      required: true,
    },
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

DestinationsSchema.plugin(aggregatePaginate);
DestinationsSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("destinations", DestinationsSchema);
