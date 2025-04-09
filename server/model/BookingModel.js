const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    passengers_info: {
      type: Array,
    },
    // Flight Details from Amadeus
    seat_number: {
      type: String,
      default: "",
    },

    // Flight Information
    flight_details: {
      type: Object,
      required: true,
    },
    amount: {
      type: String,
      default: "",
    },
    usd_amount: {
      type: String,
      required: true,
    },

    // You can customize this section based on your payment requirements
    payment_intent_id: {
      type: String,
      required: true,
    },
    transaction_id: {
      type: String,
      default: "",
    },
    payment_method: {
      type: String,
      enum: ["card", "paypal", "other"], // Example payment methods
    },
    payment_status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
        "refund_in_progress",
        "refunded",
      ], // Example payment statuses
    },
    refund_details: {
      type: Object,
    },
    booking_status: {
      type: String,
      enum: ["pending", "confirmed", "refund_in_progress", "completed", "canceled"], // Example payment statuses
    },
    getingCoinsPerBooking: {
      type: Number,
      default: 0
    },
    usedCoinsPerBooking: {
      type: Number,
      default: 0
    },
    booking_date_time: {
      type: Date,
      // required: true,
    },
    depart_date:{
      type:Date,
      required:false
    },
    booking_data: {
      type: Object,
    },
  },
  { timestamps: true }
);
bookingSchema.plugin(aggregatePaginate);
// Create a Mongoose model for the booking schema
module.exports = mongoose.model("Booking", bookingSchema);
