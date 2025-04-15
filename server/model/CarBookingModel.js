// const mongoose = require("mongoose");

// const CarBookingSchema = new mongoose.Schema({
//   user_id: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "users", 
//     required: true 
//   },
//   car_offer: { type: Object, required: true },
//   driver_info: { type: Object, required: true },
//   payment_intent_id: { type: String, required: true },
//   amount: { type: String, required: true },
//   usd_amount: { type: String, required: true },
//   payment_method: { type: String, required: true },
//   usedCoinsPerBooking: { type: Number, default: 0 },
//   getingCoinsPerBooking: { type: Number, default: 0 },
//   payment_status: { 
//     type: String, 
//     enum: ["pending", "completed", "failed", "refunded"],
//     default: "pending" 
//   },
//   booking_status: { 
//     type: String, 
//     enum: ["pending", "confirmed", "canceled"],
//     default: "pending" 
//   },
//   booking_date_time: { type: Date },
//   pick_up_date: { type: String, required: true },
//   drop_off_date: { type: String, required: true },
//   transaction_id: { type: String },
//   booking_data: { type: Object },
//   refund_details: { type: Object },
// }, { timestamps: true });

// module.exports = mongoose.model("car_bookings", CarBookingSchema);