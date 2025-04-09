const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      // default: 0,
    },
    profile_pic: {
      type: String,
      default: "",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 1 /** 1 enable, 2 disable, 3 deleted */,
    },
    coins: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("users", UserSchema);
