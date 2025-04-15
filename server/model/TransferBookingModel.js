const mongoose = require("mongoose");

const TransferBookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    transfer_offer: {
        id: { type: String, required: true },
        startLocationCode: { type: String },
        endAddressLine: { type: String },
        endCityName: { type: String },
        endZipCode: { type: String },
        endCountryCode: { type: String },
        endName: { type: String },
        endGeoCode: { type: String },
        transferType: { type: String, default: "PRIVATE" },
        price: {
            total: { type: String },
            currency: { type: String },
        },
    },
    driver_info: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        title: { type: String, default: "MR" },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        billingAddress: {
            line: { type: String },
            zip: { type: String },
            countryCode: { type: String },
            cityName: { type: String },
        },
    },
    transfer_data: {
        note: { type: String },
        passengers: [{
            firstName: { type: String },
            lastName: { type: String },
            title: { type: String },
            contacts: {
                phoneNumber: { type: String },
                email: { type: String },
            },
            billingAddress: {
                line: { type: String },
                zip: { type: String },
                countryCode: { type: String },
                cityName: { type: String },
            },
        }],
        agency: {
            contacts: [{
                email: {
                    address: { type: String },
                },
            }],
        },
        extraServices: [{
            code: { type: String },
            itemId: { type: String },
        }],
        equipment: [{
            code: { type: String },
        }],
        corporation: {
            address: {
                line: { type: String },
                zip: { type: String },
                countryCode: { type: String },
                cityName: { type: String },
            },
            info: {
                AU: { type: String },
                CE: { type: String },
            },
        },
        startConnectedSegment: {
            transportationType: { type: String },
            transportationNumber: { type: String },
            departure: {
                uicCode: { type: String },
                iataCode: { type: String },
                localDateTime: { type: String },
            },
            arrival: {
                uicCode: { type: String },
                iataCode: { type: String },
                localDateTime: { type: String },
            },
        },
        endConnectedSegment: {
            transportationType: { type: String },
            transportationNumber: { type: String },
            departure: {
                uicCode: { type: String },
                iataCode: { type: String },
                localDateTime: { type: String },
            },
            arrival: {
                uicCode: { type: String },
                iataCode: { type: String },
                localDateTime: { type: String },
            },
        },
        stopOvers: [{
            duration: { type: String },
            sequenceNumber: { type: Number },
            addressLine: { type: String },
            countryCode: { type: String },
            cityName: { type: String },
            zipCode: { type: String },
            name: { type: String },
            geoCode: { type: String },
            stateCode: { type: String },
        }],
    },
    payment_intent_id: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    usd_amount: {
        type: String,
    },
    payment_method: {
        type: String,
        default: "card",
    },
    payment_status: {
        type: String,
        enum: ["pending", "completed", "refunded", "failed"],
        default: "pending",
    },
    booking_status: {
        type: String,
        enum: ["pending", "confirmed", "canceled", "failed"],
        default: "pending",
    },
    transaction_id: {
        type: String,
    },
    booking_date_time: {
        type: Date,
    },
    usedCoinsPerBooking: {
        type: Number,
        default: 0,
    },
    getingCoinsPerBooking: {
        type: Number,
        default: 0,
    },
    refund_details: {
        type: Object,
    },
    pick_up_date: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("TransferBooking", TransferBookingSchema);