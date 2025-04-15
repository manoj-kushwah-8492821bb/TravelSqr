// const Amadeus = require("amadeus");
// const CarBookingModel = require("../model/CarBookingModel");
// const UserModel = require("../model/UserModel");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const { SendMailBooking } = require("../helper/Email");

// const amadeus = new Amadeus({
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
// });

// console.log(Object.keys(amadeus.shopping.availability.carOffers));
// // Cache for invalid car providers
// const invalidProviders = new Set();

// exports.searchCars = async (req, res) => {
//     try {
//         const {
//             cityCode,
//             pickUpDate,
//             dropOffDate,
//             currencyCode = 'USD'
//         } = req.query;

//         // 1. First get city coordinates
//         const location = await amadeus.referenceData.locations.get({
//             keyword: cityCode,
//             subType: 'CITY'
//         });

//         const cityData = location.data[0];
//         if (!cityData) {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "City not found",
//                 succeeded: false
//             });
//         }

//         // 2. Get car offers with coordinates
//         const data = await amadeus.shopping.availability.carOffers.get({
//             latitude: cityData.geoCode.latitude,
//             longitude: cityData.geoCode.longitude,
//             pickUpDateTime: `${pickUpDate}T10:00:00`,
//             dropOffDateTime: `${dropOffDate}T10:00:00`,
//             currencyCode: currencyCode.toUpperCase()
//         });

//         return res.status(200).json({
//             ResponseCode: 200,
//             ResponseMessage: "Car offers retrieved successfully",
//             succeeded: true,
//             ResponseBody: data.result
//         });
//     } catch (err) {
//         console.error("Car search error:", err);
//         return res.status(500).json({
//             ResponseCode: 500,
//             ResponseMessage: "Error retrieving car offers",
//             ResponseBody: err.message,
//             succeeded: false
//         });
//     }
// };
// exports.carOfferPrice = async (req, res) => {
//     try {
//         const { offerId } = req.body;

//         if (!offerId) {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "Offer ID is required",
//                 succeeded: false,
//             });
//         }

//         const data = await amadeus.shopping.carOffer(offerId).get();

//         return res.status(200).json({
//             ResponseCode: 200,
//             ResponseMessage: "Car offer priced successfully",
//             succeeded: true,
//             ResponseBody: data?.result?.data || {},
//         });
//     } catch (err) {
//         console.error("Car pricing error:", err);
//         return res.status(500).json({
//             ResponseCode: 500,
//             ResponseMessage: "Error pricing car offer",
//             ResponseBody: err.response?.result?.errors || err.message,
//             succeeded: false,
//         });
//     }
// };

// exports.createCarOrder = async (req, res) => {
//     try {
//         const { carOffer, driverInfo, payment_method, coinsUsed = 0 } = req.body;

//         if (!carOffer?.id || !driverInfo || !payment_method) {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "Missing required fields",
//                 succeeded: false,
//             });
//         }

//         // Validate user coins
//         const user = await UserModel.findById(req.userData._id);
//         if (coinsUsed > (user?.coins || 0)) {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "Insufficient coins",
//                 succeeded: false,
//             });
//         }

//         // Calculate total with convenience fee
//         const convenienceFee = Number(process.env.CONVENIENCE_FEE) || 0.05;
//         const baseAmount = Number(carOffer.price.total);
//         const totalAmount = baseAmount * (1 + convenienceFee);

//         // Create payment intent
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(totalAmount * 100),
//             currency: carOffer.price.currency.toLowerCase() || 'usd',
//             payment_method_types: [payment_method],
//             metadata: {
//                 userId: req.userData._id.toString(),
//                 offerId: carOffer.id
//             }
//         });

//         // Save booking
//         const newBooking = new CarBookingModel({
//             user_id: req.userData._id,
//             car_offer: carOffer,
//             driver_info: driverInfo,
//             payment_intent_id: paymentIntent.id,
//             amount: totalAmount.toFixed(2),
//             usd_amount: totalAmount.toFixed(2),
//             payment_method,
//             usedCoinsPerBooking: coinsUsed,
//             pick_up_date: carOffer.pickUpDate,
//             drop_off_date: carOffer.dropOffDate,
//             payment_status: "pending",
//             booking_status: "pending",
//         });

//         await newBooking.save();

//         return res.status(200).json({
//             ResponseCode: 200,
//             ResponseMessage: "Car order created successfully",
//             succeeded: true,
//             ResponseBody: {
//                 booking_id: newBooking._id,
//                 paymentIntentId: paymentIntent.id,
//                 clientSecret: paymentIntent.client_secret,
//                 totalAmount: totalAmount.toFixed(2),
//                 currency: carOffer.price.currency,
//             },
//         });
//     } catch (err) {
//         console.error("Create car order error:", err);
//         return res.status(500).json({
//             ResponseCode: 500,
//             ResponseMessage: "Error creating car order",
//             ResponseBody: err.message,
//             succeeded: false,
//         });
//     }
// };

// exports.carCompletePayment = async (req, res) => {
//     try {
//         const { booking_id, payment_intent_id, transaction_id } = req.body;

//         const booking = await CarBookingModel.findOne({
//             _id: booking_id,
//             user_id: req.userData._id,
//             payment_intent_id,
//             booking_status: "pending",
//         });

//         if (!booking) {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "Booking not found",
//                 succeeded: false,
//             });
//         }

//         // Confirm payment with Stripe
//         const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id);

//         if (paymentIntent.status !== "succeeded") {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "Payment failed",
//                 succeeded: false,
//             });
//         }

//         // Make booking with Amadeus
//         const bookingData = await amadeus.booking.carBookings.post(
//             JSON.stringify({
//                 data: {
//                     offerId: booking.car_offer.id,
//                     driver: {
//                         firstName: booking.driver_info.firstName,
//                         lastName: booking.driver_info.lastName,
//                         title: booking.driver_info.title || "MR",
//                         phone: booking.driver_info.phone,
//                         email: booking.driver_info.email,
//                     },
//                 },
//             })
//         );

//         // Update user coins (50 coins for car rental)
//         const user = await UserModel.findById(req.userData._id);
//         const coinsEarned = 50;
//         user.coins = (user.coins || 0) - booking.usedCoinsPerBooking + coinsEarned;
//         await user.save();

//         // Update booking
//         await CarBookingModel.findByIdAndUpdate(booking_id, {
//             booking_data: bookingData?.result?.data,
//             payment_status: "completed",
//             booking_status: "confirmed",
//             transaction_id,
//             booking_date_time: new Date(),
//             getingCoinsPerBooking: coinsEarned,
//         });

//         // Send confirmation email
//         const emailMessage = `
//       <h2>Car Rental Confirmation</h2>
//       <p>Dear ${booking.driver_info.firstName},</p>
//       <p>Your car rental has been confirmed.</p>
//       <p><strong>Vehicle:</strong> ${booking.car_offer.carModel}</p>
//       <p><strong>Pick-up:</strong> ${booking.pick_up_date}</p>
//       <p><strong>Drop-off:</strong> ${booking.drop_off_date}</p>
//       <p><strong>Total:</strong> ${booking.amount} ${booking.car_offer.price.currency}</p>
//     `;

//         await SendMailBooking(
//             booking.driver_info.email,
//             "Car Rental Confirmation",
//             emailMessage
//         );

//         return res.status(200).json({
//             ResponseCode: 200,
//             ResponseMessage: "Car booking completed successfully",
//             succeeded: true,
//             ResponseBody: {
//                 booking: await CarBookingModel.findById(booking_id),
//                 coinsEarned,
//                 userCoins: user.coins,
//             },
//         });
//     } catch (err) {
//         console.error("Complete car booking error:", err);

//         // Refund if booking failed
//         if (req.body.payment_intent_id) {
//             await stripe.refunds.create({ payment_intent: req.body.payment_intent_id });
//         }

//         return res.status(500).json({
//             ResponseCode: 500,
//             ResponseMessage: "Error completing car booking",
//             ResponseBody: err.response?.result?.errors || err.message,
//             succeeded: false,
//         });
//     }
// };

// exports.getCarBookings = async (req, res) => {
//     try {
//         const bookings = await CarBookingModel.find({
//             user_id: req.userData._id,
//         }).sort({ booking_date_time: -1 });

//         return res.status(200).json({
//             ResponseCode: 200,
//             ResponseMessage: "Car bookings retrieved successfully",
//             succeeded: true,
//             ResponseBody: {
//                 count: bookings.length,
//                 bookings: bookings.map((b) => ({
//                     id: b._id,
//                     car_model: b.car_offer.carModel,
//                     pick_up_date: b.pick_up_date,
//                     drop_off_date: b.drop_off_date,
//                     amount: b.amount,
//                     status: b.booking_status,
//                     booking_date: b.booking_date_time,
//                 })),
//             },
//         });
//     } catch (err) {
//         console.error("Get car bookings error:", err);
//         return res.status(500).json({
//             ResponseCode: 500,
//             ResponseMessage: "Error retrieving car bookings",
//             ResponseBody: err.message,
//             succeeded: false,
//         });
//     }
// };

// exports.cancelCarBooking = async (req, res) => {
//     try {
//         const { booking_id } = req.body;

//         const booking = await CarBookingModel.findOne({
//             _id: booking_id,
//             user_id: req.userData._id,
//             booking_status: "confirmed",
//         });

//         if (!booking) {
//             return res.status(400).json({
//                 ResponseCode: 400,
//                 ResponseMessage: "Booking not found or already canceled",
//                 succeeded: false,
//             });
//         }

//         // Cancel with Amadeus
//         await amadeus.booking.carBooking(booking.booking_data.id).delete();

//         // Process refund
//         const refund = await stripe.refunds.create({
//             payment_intent: booking.payment_intent_id,
//         });

//         // Update booking status
//         await CarBookingModel.findByIdAndUpdate(booking_id, {
//             booking_status: "canceled",
//             payment_status: "refunded",
//             refund_details: refund,
//         });

//         return res.status(200).json({
//             ResponseCode: 200,
//             ResponseMessage: "Car booking canceled successfully",
//             succeeded: true,
//         });
//     } catch (err) {
//         console.error("Cancel car booking error:", err);
//         return res.status(500).json({
//             ResponseCode: 500,
//             ResponseMessage: "Error canceling car booking",
//             ResponseBody: err.response?.result?.errors || err.message,
//             succeeded: false,
//         });
//     }
// };