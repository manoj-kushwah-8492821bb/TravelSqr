const Amadeus = require("amadeus");
const AirlineModel = require("../model/AirlineModel");
const AirportsModel = require("../model/AirportsModel");
const BookingModel = require("../model/BookingModel");
const mongoose = require("mongoose");
const DestinationsModel = require("../model/DestinationsModel");
const axios = require("axios");
const moment = require("moment-timezone");
const ContactModel = require("../model/ContactModel");
const HelpCenterModel = require("../model/HelpCenterModel");
const TestimonialModel = require("../model/TestimonialModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var exchangeRatesApi = require("exchange-rates-api");
const FaqModel = require("../model/FaqModel");
const UserModel = require("../model/UserModel");
const { SendMailBooking } = require("../helper/Email");
const qs = require('querystring');  // Add this at the top
const twilio = require("twilio");
const { generateTicketPDF } = require("../helper/genratePDF");

// const amadeus = new Amadeus({
//   clientId: process.env.LIVE_CLIENT_ID,
//   clientSecret: process.env.LIVE_CLIENT_SECRET,
//   hostname: "production",
// });

const amadeus = new Amadeus({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

exports.searchFlight = async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      currencyCode,
      includedAirlineCodes,
      nonStop,
      maxPrice,
    } = req.query;
    const parameters = {
      originLocationCode: originLocationCode,
      destinationLocationCode: destinationLocationCode,
      departureDate: departureDate,
      adults: Number(adults),
      children: Number(children),
      infants: Number(infants),
      max: 100,
      travelClass: travelClass,
      // priceMetrics: "true",
    };

    if (returnDate) {
      parameters.returnDate = returnDate;
    }
    if (returnDate) {
      parameters.returnDate = returnDate;
    }
    if (nonStop) {
      parameters.nonStop = Boolean(nonStop);
    }
    if (currencyCode) {
      parameters.currencyCode = currencyCode;
    }
    if (maxPrice) {
      parameters.maxPrice = maxPrice;
    }
    if (includedAirlineCodes) {
      parameters.includedAirlineCodes = includedAirlineCodes;
    }

    const data = await amadeus.shopping.flightOffersSearch.get(parameters);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Flight Offers Getting Successfully`,
      succeeded: true,
      ResponseBody: {
        count: data?.result.meta.count,
        data: data?.result?.data,
        dictionaries: data?.result?.dictionaries,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ResponseCode: 400,
      ResponseMessage: `Error Occured!`,
      ResponseBody: err ? err?.response?.result?.errors : err,
      succeeded: false,
    });
  }
};

exports.searchFlightMulti = async (req, res) => {
  try {
    let {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      currencyCode,
      includedAirlineCodes,
      excludeAirlineCodes,
      nonStop,
      maxPrice,
      /** multicity data */
      origins,
      destinations,
      departdates,
    } = req.query;

    console.log(origins, destinations, departdates);
    const carrierRestrictions = {};
    if (maxPrice) {
      carrierRestrictions.maxPrice = maxPrice;
    }
    if (includedAirlineCodes) {
      carrierRestrictions.includedCarrierCodes =
        includedAirlineCodes.split(",");
    }
    if (excludeAirlineCodes) {
      carrierRestrictions.excludedCarrierCodes = excludeAirlineCodes.split(",");
    }
    const originDestinations = new Array();
    const originDestinationsIds = new Array();
    const travellers = new Array();
    if (origins && departdates && destinations) {
      origins = origins.split(",");
      destinations = destinations.split(",");
      departdates = departdates.split(",");
      for (let i = 0; i < origins.length; i++) {
        const element = origins[i];
        originDestinations.push({
          id: String(i + 1),
          originLocationCode: element,
          destinationLocationCode: destinations[i],
          departureDateTimeRange: {
            date: departdates[i],
          },
        });
        originDestinationsIds.push(String(i + 1));
      }
    }

    if (adults) {
      for (let j = 0; j < Number(adults); j++) {
        travellers.push({
          id: String(j + 1),
          travelerType: "ADULT",
        });
      }
      for (let j = 0; j < Number(children); j++) {
        travellers.push({
          id: String(Number(adults) + j + 1),
          travelerType: "CHILD",
        });
      }
      for (let k = 0; k < Number(infants); k++) {
        travellers.push({
          id: String(Number(adults) + Number(children) + k + 1),
          travelerType: "INFANT",
        });
      }
    }

    const multiData = await amadeus.shopping.flightOffersSearch.post(
      JSON.stringify({
        currencyCode: currencyCode ? currencyCode : "USD",
        originDestinations: originDestinations,
        travelers: travellers,
        sources: ["GDS"],
        searchCriteria: {
          maxFlightOffers: 50,
          maxPrice: maxPrice ? Number(maxPrice) : "",
          flightFilters: {
            cabinRestrictions: [
              {
                cabin: travelClass,
                coverage: "MOST_SEGMENTS",
                originDestinationIds: originDestinationsIds,
              },
            ],
            carrierRestrictions: carrierRestrictions,
          },
        },
      })
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Flight Multi Offers Getting Successfully`,
      succeeded: true,
      ResponseBody: {
        count: multiData?.result.meta.count,
        data: multiData?.result?.data,
        dictionaries: multiData?.result?.dictionaries,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ResponseCode: 400,
      ResponseMessage: `Error Occured!`,
      ResponseBody: err ? err?.response?.result?.errors : err,
      succeeded: false,
    });
  }
};

exports.flightOfferPrice = async (req, res) => {
  try {
    const { flightData } = req.body;

    const data = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flightData],
        },
      })
    );
    return res.json(data?.data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ResponseCode: 400,
      ResponseMessage: `Error Occured!`,
      ResponseBody: err ? err?.response?.result?.errors : err,
      succeeded: false,
    });
  }
};

exports.createflightOrder = async (req, res) => {
  try {
    const { priceData, travellerData, payment_method, coinsUsed } = req.body;
    const totalFee =
      Number(priceData.totalAmount) +
      (Number(process.env.CONVENIENCE_FEE) / 100) *
        Number(priceData.price.total);
    console.log(Math.round(parseFloat(totalFee) * 100));
    // return;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(totalFee) * 100),
      currency: priceData.price.currency,
      payment_method_types: [payment_method],
    });
    console.log(paymentIntent.id);
    let usd_amount = paymentIntent.amount / 100;
    if (priceData.price.currency != "USD") {
      usd_amount = await convertCurrency(
        paymentIntent.amount / 100,
        priceData.price.currency,
        "USD"
      );
    }

    const newBooking = new BookingModel({
      user_id: req.userData._id, // Assuming you have user authentication
      passengers_info: travellerData,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      usd_amount: usd_amount,
      flight_details: priceData,
      seat_number: "", // Replace with actual seat data
      payment_method: payment_method, // Assuming credit card payment
      usedCoinsPerBooking: coinsUsed,
      payment_status: "pending", // Initial payment status
      booking_status: "pending", // Initial payment status
    });

    // Attempt to save the booking data to MongoDB
    await newBooking.save();
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Flight Order Requested Successfully`,
      succeeded: true,
      ResponseBody: {
        booking_id: newBooking._id,
        paymentIntentId: paymentIntent.id,
        paymentIntentClientSecret: paymentIntent.client_secret,
        totalAmount: totalFee,
        currency: priceData.price.currency,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

// Function to check if flight is domestic or international
const isDomesticFlight = async (departureIATA, arrivalIATA) => {
  try {
    // Fetch departure and arrival airport details
    const airports = await AirportsModel.find({
      code: { $in: [departureIATA, arrivalIATA] },
    });

    if (airports.length < 2) return false; // Ensure both airports exist

    const departureCountry = airports.find(a => a.code === departureIATA)?.country;
    const arrivalCountry = airports.find(a => a.code === arrivalIATA)?.country;

    return departureCountry && arrivalCountry && departureCountry === arrivalCountry;
  } catch (error) {
    console.error("Error checking domestic flight:", error);
    return false; // Assume international if there's an error
  }
};


const getAirportDetails = async (iataCode) => {
  try {
    console.log(`Fetching airport details from MongoDB for: ${iataCode}`);

    // Step 1: Query MongoDB for the airport details
    const airport = await AirportsModel.findOne({ code: iataCode.toUpperCase() });

    // Step 2: If found, return the details
    if (airport) {
      console.log(`Found in MongoDB: ${airport.name}, Country: ${airport.country}`);
      return {
        fullName: airport.name, // Full airport name
        country: airport.country, // Country name
      };
    }

    console.warn(`No data found in MongoDB for IATA code: ${iataCode}`);
  } catch (error) {
    console.error(`Error fetching airport details for ${iataCode}:`, error.message);
  }

  // Step 3: Fallback if No Data Found in MongoDB
  return { fullName: iataCode, country: "Unknown" };
};




function convertToUSTimeZone(date) {
  return moment(date).tz("America/New_York").format("dddd, MMM D YYYY, h:mm A z"); 
}


// Flight Payment Completion
exports.flightCompletePayment = async (req, res) => {
  try {
    const { booking_id, payment_intent_id, transaction_id, coinsUsed } = req.body;
    
    const booking = await BookingModel.findOne({
      _id: new mongoose.Types.ObjectId(booking_id),
      user_id: new mongoose.Types.ObjectId(req.userData._id),
      payment_intent_id: payment_intent_id,
      booking_status: { $ne: "completed" },
    });

    if (!booking) {
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: `Booking Not Found!`,
        succeeded: false,
        ResponseBody: {},
      });
    }

    // Extract departure and arrival codes
    const firstSegment = booking.flight_details.itineraries[0].segments[0];
    const lastSegment = booking.flight_details.itineraries[0].segments.slice(-1)[0];

    const departureIATA = firstSegment.departure.iataCode;
    const arrivalIATA = lastSegment.arrival.iataCode;

    // Check if the flight is domestic or international
    const isInternational = !(await isDomesticFlight(departureIATA, arrivalIATA));
    const coinsEarned = isInternational ? 100 : 50;

    const data = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: "flight-order",
          flightOffers: [booking.flight_details],
          travelers: booking.passengers_info,
        },
      })
    );

    if (data?.data?.id) {
      // Fetch user details
      const user = await UserModel.findById(req.userData._id);
      let userCoins = user.coins || 0;

      // Deduct coins if used
      if (coinsUsed && coinsUsed > 0) {
        if (userCoins >= coinsUsed) {
          userCoins -= coinsUsed;
        } else {
          return res.status(400).json({
            ResponseCode: 400,
            ResponseMessage: `Insufficient Coins`,
            succeeded: false,
            ResponseBody: {},
          });
        }
      }

      // Add earned coins
      userCoins += coinsEarned;
      user.coins = userCoins;
      await user.save(); // Update user coins

      // Update Booking Status
      await BookingModel.findByIdAndUpdate(booking._id, {
        $set: {
          payment_status: "completed",
          booking_status: "confirmed",
          transaction_id: transaction_id,
          booking_date_time: new Date(),
          booking_data: data?.data,
          getingCoinsPerBooking: coinsEarned, // Store earned coins
          depart_date: data?.data.flightOffers[0].itineraries[0].segments[0].departure.at,
        },
      });

      // Fetch updated booking details
      const updatedBooking = await BookingModel.findById(booking._id);

      console.log("han chal to raha hai")

      const departureDetails = await getAirportDetails(departureIATA);
      const arrivalDetails = await getAirportDetails(arrivalIATA);
      const formattedDate = convertToUSTimeZone(updatedBooking.depart_date);
      
      console.log("departureDetails_:", departureDetails)
      console.log("arrivalDetails_:", arrivalDetails)
      console.log("formattedDate_:", formattedDate)

      // **Generate PDF Ticket using Separate Function**
      const pdfPath = await generateTicketPDF(
        updatedBooking, 
        user, 
        departureDetails, 
        arrivalDetails, 
        formattedDate, 
        transaction_id
      );

      const emailMessage = `
        <h2>Flight Booking Confirmation</h2>
        <p>Dear ${user.first_name},</p>
        <p>Your flight booking has been successfully confirmed.</p>
        <p><strong>Flight Details:</strong></p>
        <ul>
          <li><strong>Departure:</strong> ${departureDetails.fullName} (${departureIATA}), ${departureDetails.country}</li>
          <li><strong>Arrival:</strong> ${arrivalDetails.fullName} (${arrivalIATA}), ${arrivalDetails.country}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Transaction ID:</strong> ${transaction_id}</li>
        </ul>
        <p>Thank you for booking with us!</p>
      `;

      console.log("han chal to raha hai 2")
      await SendMailBooking(user.email, "Flight Booking Confirmation", emailMessage, pdfPath);

      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage: `Flight Booked Successfully`,
        succeeded: true,
        ResponseBody: {
          booking: updatedBooking, 
          coinsEarned: coinsEarned,
          userCoins: userCoins, 
        },
      });

    } else {
      // Refund if booking fails
      await stripe.refunds.create({ payment_intent: payment_intent_id });

      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: `Flight Not Booked. Refund Initiated Successfully`,
        succeeded: false,
        ResponseBody: {},
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occurred!`, error: err });
  }
};



exports.seatMapAfterOrder = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await BookingModel.findById(booking_id);
    if (booking) {
      const data = await amadeus.shopping.seatmaps.get({
        "flight-orderId": booking.booking_data.id,
      });
      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage: `Seat Map Getting Successfully`,
        succeeded: true,
        ResponseBody: data?.result,
      });
    } else {
      return res.status(400).json({
        ResponseCode: 400,
        ResponseMessage: `Flight Not Booked.`,
        succeeded: false,
        ResponseBody: {},
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.seatMap = async (req, res) => {
  try {
    const { orderData } = req.body;

    const data = await amadeus.shopping.seatmaps.post(
      JSON.stringify({
        data: [orderData],
      })
    );
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Seat Map Getting Successfully`,
      succeeded: true,
      ResponseBody: data?.result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.getAirports = async (req, res) => {
  try {
    const { page, limit, search, code } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };

    const matchObject = {};
    matchObject.status = 1;

    if (search) {
      matchObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    if (code) {
      matchObject.code = code;
    }

    const resultAggregate = AirportsModel.aggregate([
      {
        $match: matchObject,
      },
      {
        $sort: { name: 1 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          country: 1,
          code: 1,
          city: 1,
          status: 1,
        },
      },
    ]);
    const result = await AirportsModel.aggregatePaginate(
      resultAggregate,
      options
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Airports Getting Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.getAirlines = async (req, res) => {
  try {
    const { code } = req.query;
    const matchObject = {};
    matchObject.status = { $in: [1, 2] };
    matchObject.code = code;
    const result = await AirlineModel.aggregate([
      {
        $match: matchObject,
      },
      {
        $sort: { name: 1 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          logo: 1,
          common_name: 1,
          code: 1,
          status: 1,
        },
      },
    ]);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Airlines Getting Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.cancleFlightBooking = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await BookingModel.findById(booking_id);
    console.log(booking);
    if (booking) {
      const refundablePrice = booking?.booking_data?.flightOffers.map(
        (offers) => {
          let amount = 0;
          offers.travelerPricings?.map((item) => {
            // console.log(item, "sfsafs");
            let newAmount = Number(item.price.base);
            amount += newAmount;
          });
          return amount;
        }
      );
      console.log(refundablePrice);
      // return
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment_intent_id,
        amount: refundablePrice[0] * 100,
      });
      console.log(refund);

      // if (refund.status == "succeeded") {
      const orderData = await amadeus.booking
        .flightOrder(booking.booking_data.id)
        .delete();

      await BookingModel.findByIdAndUpdate(booking._id, {
        $set: {
          payment_status: "refund_in_progress",
          booking_status: "refund_in_progress",
          refund_details: refund,
        },
      });
      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage: `Amadeus Order Canceled Successfully`,
        succeeded: true,
        ResponseBody: {},
      });
      // }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.checkRefundStatus = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await BookingModel.findById(booking_id);
    if (booking) {
      const refundStatus = await stripe.refunds.retrieve(
        booking.refund_details.id
      );
      // return refundStatus
      console.log(refundStatus);
      // return;
      if (refundStatus.status == "succeeded") {
        await BookingModel.findByIdAndUpdate(booking._id, {
          $set: {
            payment_status: "refunded",
          },
        });
      }
      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage: `Refund Status Getting Successfully`,
        succeeded: true,
        ResponseBody: refundStatus,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.getDestinations = async (req, res) => {
  try {
    const result = await DestinationsModel.aggregate([
      {
        $match: {
          status: { $in: [1] },
        },
      },
      // {
      //   $lookup: {
      //     from: "topsights",
      //     localField: "_id",
      //     foreignField: "destination_id",
      //     as: "sightsData",
      //   },
      // },
      {
        $project: {
          name: 1,
          title: 1,
          description: 1,
          images: 1,
          // general_info: 1,
          location: 1,
          status: 1,
          // topSights: "$sightsData",
        },
      },
    ]);
    return res.json({
      ResponseCode: 200,
      ResponseMessage: `Destinations Retrived Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.getDestinationDetails = async (req, res) => {
  try {
    const result = await DestinationsModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.body.destination_id),
        },
      },
      {
        $lookup: {
          from: "topsights",
          localField: "_id",
          foreignField: "destination_id",
          as: "sightsData",
        },
      },
      {
        $project: {
          name: 1,
          title: 1,
          description: 1,
          images: 1,
          general_info: 1,
          location: 1,
          status: 1,
          topSights: "$sightsData",
        },
      },
    ]);
    if (result.length) {
      let newData = result[0];
      const data = await axios.get(
        `https://restcountries.com/v3.1/name/${newData.general_info.location.country}?fullText=true`
      );
      // console.log(data?.data);
      const matchObjData = {};
      if (newData?.location?.coordinates) {
        // let max_rang = 10000;
        let max_rang = 3000;
        matchObjData._id = {
          $ne: new mongoose.Types.ObjectId(req.body.destination_id),
        };
        matchObjData.status = 1;
        matchObjData.location = {
          $geoWithin: {
            $centerSphere: [
              [
                Number(newData?.location?.coordinates[0]),
                Number(newData?.location?.coordinates[1]),
              ],
              max_rang / 6378.1,
            ],
          },
        };
      }
      const nearestResult = await DestinationsModel.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [
                Number(newData?.location?.coordinates[0]),
                Number(newData?.location?.coordinates[1]),
              ],
            },
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: 0.001,
          },
        },
        {
          $match: matchObjData,
        },
        {
          $project: {
            name: 1,
            images: 1,
            description: 1,
            distance: 1,
            location: 1,
          },
        },
      ]);
      newData.nearestCities = nearestResult;
      newData.genralNew = data?.data[0];
      return res.json({
        ResponseCode: 200,
        ResponseMessage: `Destinations Detail Retrived Successfully`,
        succeeded: true,
        ResponseBody: newData,
      });
    }
    return res.json({
      ResponseCode: 400,
      ResponseMessage: `Destinations Detail Error`,
      succeeded: false,
      ResponseBody: {},
    });
  } catch (err) {
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.getContactInfo = async (req, res) => {
  try {
    const result = await ContactModel.findOne({});

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Contact Getting Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.addContactMessage = async (req, res, next) => {
  try {
    const { name, email, message, subject } = req.body;

    const newUser = new HelpCenterModel({
      name,
      email,
      message,
      subject,
    });

    const result = await newUser.save();

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Message Submitted Successfully.",
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.getRecommendedFlights = async (req, res) => {
  try {
    const result = new Array();
    const userIP = req.ip;
    const response = await axios.get(`https://ipinfo.io/${userIP}/json`);
    const locData = response?.data?.loc?.split(",");
    let airportData = await amadeus.referenceData.locations.airports.get({
      longitude: locData[1],
      latitude: locData[0],
      radius: 500,
      sort: "distance",
    });
    const inspiration = await amadeus.shopping.flightDestinations.get({
      origin:
        airportData?.data[0]?.iataCode === "IDR"
          ? "PAR"
          : airportData?.data[0]?.iataCode,
    });
    for (let i = 0; i < 5; i++) {
      const element = inspiration?.data[i];
      const flightOffers = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: element?.origin,
        destinationLocationCode: element?.destination,
        departureDate: element?.departureDate,
        returnDate: element?.returnDate,
        adults: 1,
        max: 1,
      });
      result.push(flightOffers?.result?.data[0]);
    }
    return res.send({ result: result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.getUserIpAddress = async (req, res) => {
  try {
    const response = await axios.get("https://ipinfo.io");
    return res.send({ data: response?.data });
  } catch (err) {
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const exchangeRates = await axios.get(`https://open.er-api.com/v6/latest`);

  if (
    !(fromCurrency in exchangeRates?.data?.rates) ||
    !(toCurrency in exchangeRates?.data?.rates)
  ) {
    throw new Error("Invalid currency code");
  }

  const convertedAmount =
    amount *
    (exchangeRates?.data?.rates[toCurrency] /
      exchangeRates?.data?.rates[fromCurrency]);
  console.log(convertedAmount.toFixed(2));
  return convertedAmount.toFixed(2);
};

exports.addFeedback = async (req, res) => {
  try {
    console.log("req.files", req.file);
    const feedback = new TestimonialModel({
      user_name: req.body.user_name,
      user_mobile: req.body.user_mobile,
      user_email: req.body.user_email,
      feedback: req.body.feedback,
      status: req.body.status,
      profile_pic: req.file.path,
    });
    const result = await feedback.save();
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Feedback Added Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Error Occured!`, error: err });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const result = await TestimonialModel.aggregate([
      {
        $lookup: {
          from: "admin",
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: { status: 1 },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          feedback: 1,
          user_name: {
            $concat: ["$userData.first_name", " ", "$userData.last_name"],
          },
          user_email: "$userData.email",
          user_mobile: "$userData.mobile",
          profile_pic: "$userData.profile_pic",
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Feedbacks Getting Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.getFaq = async (req, res) => {
  try {
    const result = await FaqModel.find({});
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Faq Getting Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};
