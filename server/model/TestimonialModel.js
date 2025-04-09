const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let TestimonialsSchema = new mongoose.Schema(
  {
    
    user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
    
    user_name:{
      type:String,
      required:true,
    },
    profile_pic:{
      type:String,
    default:null

    },
    user_mobile:{
      type:String,
      required:true
    },
    user_email:{
      type:String,
      required:true
    },
    feedback: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0 /**0 new, 1 approved, 2 rejected, 3 deleted */,
    },
  },
  { timestamps: true }
);

TestimonialsSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("testimonials", TestimonialsSchema);
