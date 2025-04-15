// const express = require("express");
// const router = express.Router();
// const carController = require("../controller/car");
// const { checkPermanent } = require("../middleware/Auth");

// /** Car Rental Routes */
// router.get("/car-offers", carController.searchCars);
// router.post("/car-offers-price", carController.carOfferPrice);
// router.post(
//   "/car-order-create",
//   checkPermanent,
//   carController.createCarOrder
// );
// router.post(
//   "/car-order-complete",
//   checkPermanent,
//   carController.carCompletePayment
// );
// router.get("/car-bookings", checkPermanent, carController.getCarBookings);
// router.post("/car-cancel", checkPermanent, carController.cancelCarBooking);

// module.exports = router;