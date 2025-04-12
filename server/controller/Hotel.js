exports.searchHotel = async (req, res) => {
    try {
        const { hotelIds, adults } = req.query;
        const parameters = {
            hotelIds: hotelIds,
            adults: Number(adults),
        };

        const data = await amadeus.shopping.hotelOffersSearch.get(parameters);

        console.log("Hotel Offers Data", data);
        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: `Hotel Offers Getting Successfully`,
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
}

// Get Hotels by City Code
exports.getHotelsByCity = async (req, res) => {
    try {
        const { cityCode } = req.query;

        if (!cityCode) {
            return res.status(400).json({
                ResponseCode: 400,
                ResponseMessage: "cityCode is required",
                succeeded: false,
            });
        }

        const params = {
            cityCode: cityCode.toUpperCase(),
        };

        const data = await amadeus.referenceData.locations.hotels.byCity.get(params);

        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: `Hotels fetched successfully for ${cityCode}`,
            succeeded: true,
            ResponseBody: {
                count: data?.result?.meta?.count || data?.result?.data?.length || 0,
                data: data?.result?.data,
            },
        });
    } catch (err) {
        console.error("Error fetching hotels by city:", err);
        return res.status(500).json({
            ResponseCode: 500,
            ResponseMessage: "Error occurred while fetching hotels by city",
            succeeded: false,
            ResponseBody: err?.response?.result?.errors || err,
        });
    }
};


// Search Hotel Offers by Hotel ID
exports.searchHotelOffers = async (req, res) => {
    try {
        const { hotelIds, adults = 1, checkInDate, checkOutDate, roomQuantity, currency } = req.query;

        if (!hotelIds) {
            return res.status(400).json({
                ResponseCode: 400,
                ResponseMessage: "hotelIds is required",
                succeeded: false,
            });
        }

        const parameters = {
            hotelIds,
            adults: Number(adults),
            ...(checkInDate && { checkInDate }),
            ...(checkOutDate && { checkOutDate }),
            ...(roomQuantity && { roomQuantity }),
            ...(currency && { currency }),
        };

        const data = await amadeus.shopping.hotelOffersSearch.get(parameters);

        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: "Hotel offers retrieved successfully",
            succeeded: true,
            ResponseBody: {
                count: data?.result?.meta?.count || data?.result?.data?.length || 0,
                data: data?.result?.data,
                dictionaries: data?.result?.dictionaries,
            },
        });
    } catch (err) {
        console.error("Error fetching hotel offers:", err);
        return res.status(500).json({
            ResponseCode: 500,
            ResponseMessage: "An error occurred while fetching hotel offers",
            succeeded: false,
            ResponseBody: err?.response?.result?.errors || err,
        });
    }
};


exports.bookHotel = async (req, res) => {
    try {
        const { offerId, guestInfo, paymentCard } = req.body;

        if (!offerId || !guestInfo || !paymentCard) {
            return res.status(400).json({
                ResponseCode: 400,
                ResponseMessage: "offerId, guestInfo, and paymentCard are required",
                succeeded: false,
            });
        }

        const body = {
            data: {
                offerId,
                guests: [guestInfo],
                payments: [
                    {
                        method: "creditCard",
                        card: paymentCard,
                    },
                ],
            },
        };

        const response = await amadeus.booking.hotelBookings.post(JSON.stringify(body));

        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: "Hotel booked successfully",
            succeeded: true,
            ResponseBody: response?.result,
        });
    } catch (err) {
        console.error("Booking Error:", err);
        return res.status(500).json({
            ResponseCode: 500,
            ResponseMessage: "Hotel booking failed",
            succeeded: false,
            ResponseBody: err?.response?.result?.errors || err,
        });
    }
};


exports.getHotelsByIds = async (req, res) => {
    try {
        const { hotelIds } = req.query;

        if (!hotelIds) {
            return res.status(400).json({
                ResponseCode: 400,
                ResponseMessage: "hotelIds query param is required",
                succeeded: false,
            });
        }

        const params = {
            hotelIds, // Can be comma-separated list: "H123,H456,H789"
        };

        const response = await amadeus.referenceData.locations.hotels.byHotels.get(params);

        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: "Hotel details fetched successfully",
            succeeded: true,
            ResponseBody: {
                count: response?.result?.meta?.count,
                data: response?.result?.data,
            },
        });
    } catch (err) {
        console.error("Hotel Details Error:", err);
        return res.status(500).json({
            ResponseCode: 500,
            ResponseMessage: "Error while fetching hotel details",
            succeeded: false,
            ResponseBody: err?.response?.result?.errors || err,
        });
    }
};


exports.getHotelsByGeocode = async (req, res) => {
    try {
        const { latitude, longitude, radius, radiusUnit, hotelSource } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                ResponseCode: 400,
                ResponseMessage: "latitude and longitude are required",
                succeeded: false,
            });
        }

        const params = {
            latitude,
            longitude,
            radius: radius || 5, // Optional: defaults to 5 km
            radiusUnit: radiusUnit || 'KM', // Optional: KM or MILES
            hotelSource: hotelSource || 'ALL', // Optional: 'ALL', 'HOTELS', 'LEISURE', etc.
        };

        const response = await amadeus.referenceData.locations.hotels.byGeocode.get(params);

        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: "Hotels by geolocation fetched successfully",
            succeeded: true,
            ResponseBody: {
                count: response?.result?.meta?.count,
                data: response?.result?.data,
            },
        });
    } catch (err) {
        console.error("Hotel By Geocode Error:", err);
        return res.status(500).json({
            ResponseCode: 500,
            ResponseMessage: "Error while fetching hotels by geolocation",
            succeeded: false,
            ResponseBody: err?.response?.result?.errors || err,
        });
    }
};
