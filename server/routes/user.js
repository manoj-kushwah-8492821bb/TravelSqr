const express = require("express");
const router = express.Router();
const UserController = require("../controller/User");
// const UserController = require("../controller/User");
const multer = require("multer");
const { checkPermanent, checkTemporary } = require("../middleware/Auth");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./server/Uploads/users");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Reject file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
});

/** Admin Routes */
router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.post("/verify", checkTemporary, UserController.verifyOtp);

router.post("/resend", UserController.ResendOtp);

router.get("/auth", checkPermanent, UserController.getAuth);

router.post(
  "/update",
  upload.single("profile_pic"),
  checkPermanent,
  UserController.update
);

router.post("/change-password", checkPermanent, UserController.changePassword);

router.post("/forgot-password", UserController.ForgotPasswordOtpSend);

router.post("/reset-password", checkPermanent, UserController.resetPassword);

/** content management */

router.get("/cms-general-terms", UserController.getGeneralTerms);

router.get(
  "/cms-best-price-guarantee",
  UserController.getCmsbestPriceGuarantee
);

router.get("/cms-cookie-policy", UserController.getCmsCookiePolicy);

router.get("/cms-privacy-policy", UserController.getCmsPrivacyPolicy);

router.get("/cms-about-us", UserController.getCmsAboutUs);

router.get("/booking/list", checkPermanent, UserController.getBookings);

router.get('/validate-promo', checkPermanent, UserController.validate_promo_code)

router.post('/submit-query',  UserController.submit_query)

// Admin fetches all queries
router.get("/all-queries", UserController.get_all_queries);

// Admin updates query status
router.post("/update-query-status/:id", UserController.update_query);

module.exports = router;
