const express = require("express");
const hotelController = require("../controller/Hotel");
const router = express.Router();

router.get("/hotel-offers", hotelController.searchHotel);

router.get('/hotels/by-city', hotelController.getHotelsByCity);

router.get('/hotels/offers', hotelController.searchHotelOffers);

router.post('/hotels/book', hotelController.bookHotel);

router.get('/hotels/by-ids', hotelController.getHotelsByIds);

router.get('/hotels/by-geocode', hotelController.getHotelsByGeocode);

module.exports = router;