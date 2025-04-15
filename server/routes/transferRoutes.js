const express = require("express");
const router = express.Router();
const transferController = require("../controller/transferController");
const { checkPermanent } = require("../middleware/Auth");

router.post("/transfer-offers", checkPermanent, transferController.searchTransfers);
router.post("/create-order", checkPermanent, transferController.createTransferOrder);
router.post("/confirm-payment", checkPermanent, transferController.confirmTransferPayment);
router.post("/cancel", checkPermanent, transferController.cancelTransfer);
router.get("/bookings", checkPermanent, transferController.getTransferBookings);

module.exports = router;