const mongoose = require('mongoose');

const HotelBookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    hotel_id: { type: String, required: true },
    hotel_name: { type: String, required: true },
    booking_data: { type: Object, required: true },
    payment_intent_id: { type: String, required: true },
    amount: { type: String, required: true },
    usd_amount: { type: String, required: true },
    payment_method: { type: String, required: true },
    usedCoinsPerBooking: { type: Number, default: 0 },
    getingCoinsPerBooking: { type: Number, default: 0 },
    payment_status: { type: String, default: 'pending' },
    booking_status: { type: String, default: 'pending' },
    booking_date_time: { type: Date },
    check_in_date: { type: String, required: true },
    check_out_date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('hotel_bookings', HotelBookingSchema);