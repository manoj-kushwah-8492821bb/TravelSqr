const express = require("express");
const router = express.Router();
const flightController = require("../controller/flight");
const { checkPermanent, checkTemporary } = require("../middleware/Auth");
console.log("routes File")
/** Admin Routes */
router.get("/flight-offers", flightController.searchFlight);
router.get("/flight-offers-multi", flightController.searchFlightMulti);

router.post("/flight-offers-price", flightController.flightOfferPrice);

router.post(
  "/flight-order-create",
  checkPermanent,
  flightController.createflightOrder
);

router.post(
  "/flight-order-complete",
  checkPermanent,
  flightController.flightCompletePayment
);

router.post("/flight-order-seatmap", flightController.seatMap);

router.post(
  "/flight-seatmap",
  checkPermanent,
  flightController.seatMapAfterOrder
);
router.post(
  "/flight-cancle",
  checkPermanent,
  flightController.cancleFlightBooking
);

router.post(
  "/check-refund-status",
  checkPermanent,
  flightController.checkRefundStatus
);

router.get("/airlines", flightController.getAirlines);

router.get("/airports", flightController.getAirports);

router.get("/destinations", flightController.getDestinations);

router.post("/destinations/detail", flightController.getDestinationDetails);

router.get("/contact", flightController.getContactInfo);

router.post("/message/add", flightController.addContactMessage);

router.get("/getIp", flightController.getUserIpAddress);

router.get("/getRecommendedFlights", flightController.getRecommendedFlights);

/** feedbacks */
router.post("/feedback/add", checkPermanent, flightController.addFeedback);

router.get("/feedback/get", flightController.getFeedbacks);
router.get("/faq/get", flightController.getFaq);

module.exports = router;
