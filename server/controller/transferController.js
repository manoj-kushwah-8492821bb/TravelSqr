const Amadeus = require("amadeus");
const TransferBookingModel = require("../model/TransferBookingModel");
const UserModel = require("../model/UserModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { SendMailBooking } = require("../helper/Email");
const { isValid, isAfter } = require("date-fns");

// Configure Amadeus SDK
const amadeus = new Amadeus({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    hostname: "test"
});

// Helper function to validate date
const isValidDate = (date) => {
    const parsed = new Date(date);
    return isValid(parsed) && isAfter(parsed, new Date());
};

// Helper function to generate confirmation email
function generateConfirmationEmail(booking) {
    return `
        <h2>Transfer Confirmation #${booking.confirmationNumber}</h2>
        <p>From: ${booking.transfer_offer.startLocationCode}</p>
        <p>To: ${booking.transfer_offer.endAddressLine}, ${booking.transfer_offer.endCityName}</p>
        <p>Date: ${new Date(booking.pick_up_date).toLocaleString()}</p>
        <p>Price: ${booking.transfer_offer.price.total} ${booking.transfer_offer.price.currency}</p>
    `;
}

// Search for transfer offers
exports.searchTransfers = async (req, res) => {
    try {
        const { startLocationCode, endAddressLine, endCityName, endCountryCode, startDateTime, passengers } = req.body;

        // Validate required fields
        if (!startLocationCode || !endAddressLine || !endCityName || !endCountryCode || !startDateTime || !passengers) {
            return res.status(400).json({
                succeeded: false,
                message: "Missing required fields",
                code: 400
            });
        }

        // Validate date
        if (!isValidDate(startDateTime)) {
            return res.status(400).json({
                succeeded: false,
                message: "Invalid or past date",
                code: 400
            });
        }

        // Call Amadeus API
        const response = await amadeus.shopping.transferOffers.post({
            startLocationCode,
            endAddressLine,
            endCityName,
            endCountryCode,
            startDateTime,
            passengers,
            ...req.body
        });

        // Validate response
        if (!response.result?.data) {
            throw new Error("No transfer offers found");
        }

        return res.status(200).json({
            succeeded: true,
            data: {
                offers: response.result.data,
                searchDetails: response.result
            },
            code: 200
        });

    } catch (err) {
        console.error(`Search transfers error: ${err.message}`, err);
        return res.status(500).json({
            succeeded: false,
            message: "Failed to retrieve transfer offers",
            error: err.response?.result?.errors || err.message,
            code: 500
        });
    }
};

// Create transfer order
exports.createTransferOrder = async (req, res) => {
    try {
        const { offerId, passengers, paymentMethod, offerData } = req.body;
        const userId = req.userData._id;

        // Validate input
        if (!offerId || !passengers?.length || !paymentMethod || !offerData) {
            return res.status(400).json({
                succeeded: false,
                message: "Missing required fields or offer data",
                code: 400
            });
        }

        // Validate offer
        const offer = offerData.find(o => o.id === offerId);
        if (!offer?.price?.total) {
            return res.status(400).json({
                succeeded: false,
                message: "Invalid offer or price not found",
                code: 400
            });
        }

        // Validate driver info
        const driver = passengers[0];
        if (!driver.firstName || !driver.lastName || !driver.contacts?.email || !driver.contacts?.phoneNumber) {
            return res.status(400).json({
                succeeded: false,
                message: "Missing driver information",
                code: 400
            });
        }

        // Create Stripe payment intent
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: Math.round(offer.price.total * 100),
        //     currency: offer.price.currency?.toLowerCase() || "usd",
        //     payment_method_types: ["card"],
        //     metadata: { userId, offerId },
        //     idempotency_key: `${userId}-${offerId}-${Date.now()}`
        // });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(offer.price.total * 100),
            currency: offer.price.currency?.toLowerCase() || "usd",
            payment_method_types: ["card"],
            metadata: { userId, offerId }
        }, {
            idempotencyKey: `${userId}-${offerId}-${Date.now()}`  // ✅ Correct placement
        });
        // Save preliminary booking
        const booking = new TransferBookingModel({
            user_id: userId,
            transfer_offer: {
                id: offer.id,
                startLocationCode: offer.startLocationCode,
                endAddressLine: offer.endAddressLine,
                endCityName: offer.endCityName,
                endZipCode: offer.endZipCode,
                endCountryCode: offer.endCountryCode,
                endName: offer.endName,
                endGeoCode: offer.endGeoCode,
                transferType: offer.transferType || "PRIVATE",
                price: {
                    total: offer.price.total,
                    currency: offer.price.currency || "USD"
                }
            },
            driver_info: {
                firstName: driver.firstName,
                lastName: driver.lastName,
                title: driver.title || "MR",
                phone: driver.contacts.phoneNumber,
                email: driver.contacts.email,
                billingAddress: driver.billingAddress || {
                    line: "N/A",
                    zip: "00000",
                    countryCode: "US",
                    cityName: "N/A"
                }
            },
            transfer_data: {
                passengers,
                agency: {
                    contacts: [{ email: { address: req.userData.email } }]
                }
            },
            payment_intent_id: paymentIntent.id,
            amount: offer.price.total,
            payment_method: paymentMethod,
            pick_up_date: offer.startDateTime
        });
        await booking.save();

        return res.status(200).json({
            succeeded: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                bookingId: booking._id,
                amount: offer.price.total,
                currency: offer.price.currency
            },
            code: 200
        });

    } catch (err) {
        console.error(`Create transfer order error: ${err.message}`, err);
        return res.status(500).json({
            succeeded: false,
            message: "Failed to create transfer order",
            error: err.message,
            code: 500
        });
    }
};

// Confirm and finalize transfer booking
exports.confirmTransferPayment = async (req, res) => {
    try {
        const { bookingId, paymentIntentId, passengers } = req.body;
        const userId = req.userData._id;

        // Validate booking
        const booking = await TransferBookingModel.findOne({
            _id: bookingId,
            user_id: userId,
            payment_intent_id: paymentIntentId,
            booking_status: "pending"
        });

        if (!booking) {
            return res.status(404).json({
                succeeded: false,
                message: "Booking not found or already processed",
                code: 404
            });
        }

        // Confirm payment with Stripe
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
        if (paymentIntent.status !== "succeeded") {
            if (paymentIntent.status === "requires_action") {
                return res.status(400).json({
                    succeeded: false,
                    message: "Payment requires additional action (e.g., 3D Secure)",
                    data: { clientSecret: paymentIntent.client_secret },
                    code: 400
                });
            }
            return res.status(400).json({
                succeeded: false,
                message: "Payment failed",
                code: 400
            });
        }

        // Create Amadeus transfer order
        const orderResponse = await amadeus.ordering.transferOrders.post({
            data: {
                offerId: booking.transfer_offer.id,
                passengers: passengers.map(p => ({
                    firstName: p.firstName,
                    lastName: p.lastName,
                    title: p.title || "MR",
                    contacts: {
                        phoneNumber: p.contacts?.phoneNumber,
                        email: p.contacts?.email
                    },
                    billingAddress: p.billingAddress || {
                        line: "N/A",
                        zip: "00000",
                        countryCode: "US",
                        cityName: "N/A"
                    }
                })),
                payment: {
                    methodOfPayment: "EXTERNAL"
                },
                agency: {
                    contacts: [{
                        email: { address: req.userData.email }
                    }]
                }
            }
        });

        // Validate response
        if (!orderResponse.result?.data) {
            throw new Error("Failed to create transfer order");
        }

        // Update booking
        booking.booking_status = "confirmed";
        booking.payment_status = "completed";
        booking.orderData = orderResponse.result.data;
        booking.confirmationNumber = orderResponse.result.data.confirmationNumber || `CONF-${booking._id}`;
        booking.booking_date_time = new Date();
        await booking.save();

        // Send confirmation email
        await SendMailBooking(
            req.userData.email,
            "Transfer Confirmation",
            generateConfirmationEmail(booking)
        );

        return res.status(200).json({
            succeeded: true,
            data: booking,
            code: 200
        });

    } catch (err) {
        console.error(`Confirm transfer payment error: ${err.message}`, err);

        // Refund payment on failure
        if (req.body.paymentIntentId) {
            await stripe.refunds.create({ payment_intent: req.body.paymentIntentId });
        }

        return res.status(500).json({
            succeeded: false,
            message: "Failed to confirm transfer booking",
            error: err.response?.result?.errors || err.message,
            code: 500
        });
    }
};

// Cancel transfer booking
exports.cancelTransfer = async (req, res) => {
    try {
        const { bookingId, confirmationNumber } = req.body;
        const userId = req.userData._id;

        // Find booking
        const booking = await TransferBookingModel.findOne({
            _id: bookingId,
            user_id: userId,
            booking_status: "confirmed"
        });

        if (!booking || !booking.confirmationNumber) {
            return res.status(404).json({
                succeeded: false,
                message: "Booking not found or not confirmed",
                code: 404
            });
        }

        // Cancel with Amadeus
        await amadeus.ordering.transferOrder(booking.orderData.id)
            .transfers.cancellation.post({}, `confirmNbr=${confirmationNumber}`);

        // Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: booking.payment_intent_id
        });

        // Update booking status
        booking.booking_status = "canceled";
        booking.payment_status = "refunded";
        booking.refund_details = refund;
        await booking.save();

        return res.status(200).json({
            succeeded: true,
            data: booking,
            code: 200
        });

    } catch (err) {
        console.error(`Cancel transfer error: ${err.message}`, err);
        return res.status(500).json({
            succeeded: false,
            message: "Failed to cancel transfer booking",
            error: err.response?.result?.errors || err.message,
            code: 500
        });
    }
};

// Get user bookings
exports.getTransferBookings = async (req, res) => {
    try {
        const bookings = await TransferBookingModel.find({
            user_id: req.userData._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            succeeded: true,
            data: bookings,
            count: bookings.length,
            code: 200
        });

    } catch (err) {
        console.error(`Get transfer bookings error: ${err.message}`, err);
        return res.status(500).json({
            succeeded: false,
            message: "Failed to retrieve transfer bookings",
            error: err.message,
            code: 500
        });
    }
};