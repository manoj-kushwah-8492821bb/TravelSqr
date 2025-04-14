const express = require('express');
const router = express.Router();
const hotelController = require('../controller/hotel');
const { checkPermanent } = require('../middleware/Auth');

router.get('/hotel-offers', hotelController.searchHotel);
router.post('/hotel-book', checkPermanent, hotelController.bookHotel);
// Get user bookings
router.get('/hotel-bookings', checkPermanent, hotelController.getHotelBookings);
module.exports = router;