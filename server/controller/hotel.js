const Amadeus = require("amadeus");
const HotelBookingModel = require("../model/HotelBookingModel");
const UserModel = require("../model/UserModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { SendMailBooking } = require("../helper/Email");

// Initialize Amadeus
const amadeus = new Amadeus({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  hostname: "test",
});

// Cache for invalid hotelIds
const invalidHotelIds = new Set();

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// console.log('Amadeus shopping:', amadeus.shopping);/
// console.log('Amadeus hotelOffersSearch:', amadeus.shopping?.hotelOffersSearch);
// console.log('Amadeus hotels.byCity:', amadeus.referenceData?.locations?.hotels?.byCity);

exports.searchHotel = async (req, res) => {
  try {
    const {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      roomQuantity,
      currencyCode,
    } = req.query;

    // Validation
    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage:
          "Missing required parameters: cityCode, checkInDate, checkOutDate, adults",
        succeeded: false,
      });
    }

    // Step 1: Get hotelIds by city
    if (!amadeus.referenceData?.locations?.hotels?.byCity) {
      throw new Error("Amadeus SDK hotels.byCity API is not available");
    }

    const hotelListResponse =
      await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: cityCode.toUpperCase(),
      });

    const hotelIds =
      hotelListResponse.result.data?.map((hotel) => hotel.hotelId) || [];
    // console.log('Hotel IDs:', hotelIds);

    if (!hotelIds.length) {
      return res.status(404).json({
        ResponseCode: 404,
        ResponseMessage: "No hotels found for the specified city",
        succeeded: false,
      });
    }

    // Step 2: Get hotel offers
    if (!amadeus.shopping || !amadeus.shopping.hotelOffersSearch) {
      throw new Error("Amadeus SDK hotelOffersSearch API is not available");
    }

    const parameters = {
      checkInDate,
      checkOutDate,
      adults: Number(adults),
      roomQuantity: Number(roomQuantity) || 1,
      currency: currencyCode ? currencyCode.toUpperCase() : undefined,
    };

    // Try hotelIds with retry logic
    const results = [];
    const errors = [];
    let attemptCount = 0;
    const maxAttempts = 30;
    const errorCodesToCache = [1257, 10604, 11, 1351];

    for (const hotelId of hotelIds) {
      if (invalidHotelIds.has(hotelId)) {
        // console.log(`Skipping invalid hotelId: ${hotelId}`);
        continue;
      }
      if (attemptCount >= maxAttempts) break;
      if (results.length >= 5) break;

      try {
        // console.log(`Trying hotelId: ${hotelId}`);
        const response = await amadeus.shopping.hotelOffersSearch.get({
          ...parameters,
          hotelIds: hotelId,
        });
        if (response.result.data?.length) {
          results.push(...response.result.data);
        }
      } catch (err) {
        const errorDetails = err.response?.result?.errors || [
          { detail: err.message },
        ];
        // console.error(`Error for hotelId ${hotelId}:`, errorDetails);
        errors.push({ hotelId, error: errorDetails });

        if (errorDetails.some((e) => errorCodesToCache.includes(e.code))) {
          invalidHotelIds.add(hotelId);
        }

        if (errorDetails.some((e) => e.code === 38194 || e.status === 429)) {
          await delay(1000);
        }
      }

      attemptCount++;
      await delay(200);
    }

    // console.log('Final results:', results);
    // console.log('Final errors:', errors);

    if (!results.length) {
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage:
          "No available hotel offers found for the specified city and dates",
        ResponseBody: errors,
        succeeded: false,
      });
    }

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Hotel Offers Retrieved Successfully",
      succeeded: true,
      ResponseBody: {
        count: results.length,
        data: results,
        errors: errors.length ? errors : undefined,
      },
    });
  } catch (err) {
    console.error("Search Hotel Error:", {
      message: err.message,
      status: err.response?.status,
      errors: err.response?.result?.errors,
      description: err.description,
    });
    if (err.response?.status === 401) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: "Invalid Amadeus credentials",
        ResponseBody: err.response?.result?.errors || err.message,
        succeeded: false,
      });
    }
    if (err.response?.status === 400) {
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: "Invalid request parameters",
        ResponseBody: err.response?.result?.errors || err.message,
        succeeded: false,
      });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({
        ResponseCode: 429,
        ResponseMessage: "Amadeus rate limit exceeded",
        ResponseBody: err.response?.result?.errors || err.message,
        succeeded: false,
      });
    }
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error retrieving hotel offers",
      ResponseBody: err.message || "Internal server error",
      succeeded: false,
    });
  }
};

exports.bookHotel = async (req, res) => {
  // console.log('bookHotel called with userData:', req.userData);
  // console.log('Booking request:', req.body);
  try {
    const { hotelOffer, guests, payment_method, coinsUsed } = req.body;

    // Validation
    if (!hotelOffer?.offerId || !guests?.length || !payment_method) {
      // console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage:
          "Missing required fields: hotelOffer.offerId, guests, payment_method",
        succeeded: false,
        ResponseBody: {},
      });
    }

    // Validate user
    const user = await UserModel.findById(req.userData._id);
    if (!user) {
      // console.log('User not found:', req.userData._id);
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: "User not found",
        succeeded: false,
        ResponseBody: {},
      });
    }

    // Validate coins
    if (coinsUsed > (user.coins || 0)) {
      // console.log('Insufficient coins:', { coinsUsed, userCoins: user.coins });
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: "Insufficient coins",
        succeeded: false,
        ResponseBody: {},
      });
    }

    // Calculate total amount
    const convenienceFee = Number(process.env.CONVENIENCE_FEE || 0.05);
    const baseAmount = Number(hotelOffer.price.total);
    const totalAmount = baseAmount * (1 + convenienceFee);
    // console.log('Calculated total amount:', {
    //     baseAmount,
    //     convenienceFee,
    //     totalAmount
    // });

    // Amadeus booking
    let bookingData;
    try {
      // console.log('Attempting Amadeus booking with offerId:', hotelOffer.offerId);
      bookingData = await amadeus.booking.hotelBookings.post(
        JSON.stringify({
          data: {
            offerId: hotelOffer.offerId,
            guests: guests.map((guest, index) => ({
              name: {
                title: guest.title || "MR",
                firstName: guest.firstName,
                lastName: guest.lastName,
              },
              contact: {
                phone: guest.phone,
                email: guest.email,
              },
            })),
            // Remove payments for test environment
          },
        })
      );
      // console.log('Amadeus booking response:', JSON.stringify(bookingData.data, null, 2));
    } catch (amadeusErr) {
      console.error("Amadeus booking error:", {
        message: amadeusErr.message || "No message",
        response: amadeusErr.response?.data || "No response",
        status: amadeusErr.response?.status || "No status",
        raw: JSON.stringify(amadeusErr, null, 2),
      });
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: "Failed to book hotel with Amadeus",
        succeeded: false,
        ResponseBody:
          amadeusErr.response?.data?.errors ||
          amadeusErr.message ||
          "Unknown Amadeus error",
      });
    }

    // Stripe PaymentIntent
    let paymentIntent;
    try {
      // console.log('Creating Stripe PaymentIntent');
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: hotelOffer.price.currency.toLowerCase() || "inr",
        payment_method_types: [payment_method],
        description: `Hotel booking for ${hotelOffer.hotel.name}`,
        metadata: {
          userId: req.userData._id.toString(),
          offerId: hotelOffer.offerId,
        },
      });
      // console.log('Stripe PaymentIntent created:', paymentIntent.id);
    } catch (stripeErr) {
      console.error("Stripe error:", {
        message: stripeErr.message,
        code: stripeErr.code,
      });
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: "Payment failed",
        ResponseBody: stripeErr.message,
        succeeded: false,
      });
    }

    // Save booking
    const newBooking = new HotelBookingModel({
      user_id: req.userData._id,
      hotel_id: hotelOffer.hotel.hotelId,
      hotel_name: hotelOffer.hotel.name,
      booking_data: bookingData.data,
      payment_intent_id: paymentIntent.id,
      amount: totalAmount.toFixed(2),
      usd_amount: totalAmount.toFixed(2), // Adjust if conversion needed
      payment_method,
      usedCoinsPerBooking: coinsUsed || 0,
      check_in_date: hotelOffer.checkInDate,
      check_out_date: hotelOffer.checkOutDate,
      payment_status: "completed",
      booking_status: "confirmed",
      booking_date_time: new Date(),
    });

    try {
      // console.log('Saving booking to MongoDB');
      await newBooking.save();
      // console.log('Booking saved:', newBooking._id);
    } catch (dbErr) {
      console.error("MongoDB error:", {
        message: dbErr.message,
        stack: dbErr.stack,
      });
      return res.status(500).json({
        ResponseCode: 500,
        ResponseMessage: "Failed to save booking",
        ResponseBody: dbErr.message,
        succeeded: false,
      });
    }

    // Update user coins
    const coinsEarned = 50;
    try {
      // console.log('Updating user coins');
      user.coins = (user.coins || 0) - (coinsUsed || 0) + coinsEarned;
      await user.save();
      // console.log('User coins updated:', user.coins);
    } catch (userErr) {
      console.error("User update error:", {
        message: userErr.message,
        stack: userErr.stack,
      });
      return res.status(500).json({
        ResponseCode: 500,
        ResponseMessage: "Failed to update user coins",
        ResponseBody: userErr.message,
        succeeded: false,
      });
    }

    // Send email
    try {
      // console.log('Sending booking confirmation email');
      const emailMessage = `
                <h2>Hotel Booking Confirmation</h2>
                <p>Dear ${guests[0].firstName},</p>
                <p>Your booking at ${hotelOffer.hotel.name} is confirmed.</p>
                <p><strong>Check-in:</strong> ${hotelOffer.checkInDate}</p>
                <p><strong>Check-out:</strong> ${hotelOffer.checkOutDate}</p>
                <p><strong>Total:</strong> ${totalAmount.toFixed(2)} ${
        hotelOffer.price.currency
      }</p>
                <p><strong>Coins Earned:</strong> ${coinsEarned}</p>
            `;
      await SendMailBooking(
        guests[0].email,
        "Hotel Booking Confirmation",
        emailMessage
      );
      // console.log('Email sent to:', guests[0].email);
    } catch (emailErr) {
      console.error("Email error:", {
        message: emailErr.message,
        stack: emailErr.stack,
      });
      // Continue despite email failure
    }

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Hotel Booked Successfully",
      succeeded: true,
      ResponseBody: {
        booking_id: newBooking._id,
        paymentIntentId: paymentIntent.id,
        paymentIntentClientSecret: paymentIntent.client_secret,
        totalAmount: totalAmount.toFixed(2),
        coinsEarned,
        userCoins: user.coins,
      },
    });
  } catch (err) {
    console.error("bookHotel error:", {
      message: err?.message || "Unknown error",
      stack: err?.stack || "No stack",
      error: JSON.stringify(err, null, 2),
    });
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error booking hotel",
      ResponseBody: err?.message || "Internal server error",
      succeeded: false,
    });
  }
};

exports.getHotelBookings = async (req, res) => {
  // console.log('getHotelBookings called with userData:', req.userData);
  try {
    // Validate user
    const user = await UserModel.findById(req.userData._id);
    if (!user) {
      // console.log('User not found:', req.userData._id);
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: "User not found",
        succeeded: false,
        ResponseBody: {},
      });
    }

    // Query bookings
    const bookings = await HotelBookingModel.find({ user_id: req.userData._id })
      .sort({ booking_date_time: -1 }) // Sort by newest first
      .select(
        "booking_id hotel_name check_in_date check_out_date amount payment_status booking_status booking_date_time"
      );

    if (!bookings || bookings.length === 0) {
      // console.log('No bookings found for user:', req.userData._id);
      return res.status(404).json({
        ResponseCode: 404,
        ResponseMessage: "No bookings found",
        succeeded: false,
        ResponseBody: [],
      });
    }

    // Format response
    const formattedBookings = bookings.map((booking) => ({
      booking_id: booking._id,
      hotel_name: booking.hotel_name,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      amount: booking.amount,
      payment_status: booking.payment_status,
      booking_status: booking.booking_status,
      booking_date_time: booking.booking_date_time,
    }));

    // console.log('Bookings retrieved:', formattedBookings.length);
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Hotel Bookings Retrieved Successfully",
      succeeded: true,
      ResponseBody: {
        count: formattedBookings.length,
        bookings: formattedBookings,
      },
    });
  } catch (err) {
    console.error("getHotelBookings error:", {
      message: err?.message || "Unknown error",
      stack: err?.stack || "No stack",
      error: JSON.stringify(err, null, 2),
    });
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error retrieving hotel bookings",
      ResponseBody: err?.message || "Internal server error",
      succeeded: false,
    });
  }
};
