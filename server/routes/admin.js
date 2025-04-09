const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const AdminController = require("../controller/Admin");
// const UserController = require("../controller/User");
const multer = require("multer");
const { checkPermanent, checkTemporary } = require("../middleware/adminAuth");
const BookingModel = require("../model/BookingModel");
const NewsModel = require("../model/NewsModel");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./server/Uploads/admin");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // Reject file
//   if (
//     file.mimetype === "image/jpeg" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/png"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };
// const upload = multer({
//   storage: storage,
// });

// Define the upload directory
const uploadDir = path.join(__dirname, "../Uploads/admin");

// Ensure the directory exists before uploading
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files inside 'server/Uploads/admin'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

// File filter (only allows images)
const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG are allowed!"), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit: 10MB
  fileFilter: fileFilter,
});

/** Admin Routes */
router.post("/register", AdminController.registerAdmin);

router.post("/resend-otp", AdminController.ResendOtp);

router.post("/login", AdminController.login);

router.post("/get", checkPermanent, AdminController.getAdmin);

router.post(
  "/update",
  upload.single("profile_pic"),
  checkPermanent,
  AdminController.updateAdmin
);

router.post("/change-password", checkPermanent, AdminController.changePassword);

router.post("/forgot-password", AdminController.ForgotPasswordSendMail);

router.post(
  "/forgot/verify-email",
  checkTemporary,
  AdminController.verifyForgotPasswordMail
);

router.post("/reset-password", checkTemporary, AdminController.resetPassword);

router.post("/bulk-email", checkPermanent, AdminController.bulkEmail);

/** contgent management */
router.post("/cms/create", checkPermanent, AdminController.createCms);

router.post("/cms/update", checkPermanent, AdminController.updateCms);

router.get("/cms/get", checkPermanent, AdminController.getCms);

/** User Management */
router.get("/user", checkPermanent, AdminController.getUsers);

router.get("/alluser", checkPermanent, AdminController.alluser);

router.post("/user/detail", checkPermanent, AdminController.getUserDetails);

router.post(
  "/user/add",
  checkPermanent,
  upload.single("profile_pic"),
  AdminController.addUser
);

router.post(
  "/user/change_status",
  checkPermanent,
  AdminController.changeStatusUser
);

router.post(
  "/user/update",
  checkPermanent,
  upload.single("profile_pic"),
  AdminController.updateUser
);

router.post(
  "/user/import",
  // checkPermanent,
  upload.single("csv"),
  AdminController.importData
);

router.get("/airlines", checkPermanent, AdminController.getAirlines);

router.post("/airlines/add", checkPermanent, AdminController.addAirline);

router.post("/airlines/update", checkPermanent, AdminController.updateAirline);

router.post("/airlines/delete", checkPermanent, AdminController.deleteAirline);

router.post(
  "/airlines/change-status",
  checkPermanent,
  AdminController.changeStatusAirline
);

router.get("/airports", checkPermanent, AdminController.getAirports);

router.post("/airports/add", checkPermanent, AdminController.addAirport);

router.post("/airports/update", checkPermanent, AdminController.updateAirport);

router.post("/airports/delete", checkPermanent, AdminController.deleteAirport);

router.post(
  "/airports/change-status",
  checkPermanent,
  AdminController.changeStatusAirport
);

router.get("/booking/list", checkPermanent, AdminController.getBookings);

router.post(
  "/destination/add",
  upload.array("images"),
  checkPermanent,
  AdminController.addDestination
);

router.post(
  "/destination/update",
  upload.array("images"),
  checkPermanent,
  AdminController.updateDestination
);

router.get("/destination/get", checkPermanent, AdminController.getDestinations);

router.post(
  "/destination/details",
  checkPermanent,
  AdminController.getDestinationDetails
);

router.post(
  "/destination/change-status",
  checkPermanent,
  AdminController.changeStatusDestination
);

router.get("/contact/get", checkPermanent, AdminController.getContactInfo);

router.get("/message/get", checkPermanent, AdminController.getHelpMessages);

router.post(
  "/contact/add",
  checkPermanent,
  AdminController.AddUpdateContactInfo
);

router.post("/refund", checkPermanent, AdminController.completeRefund);

router.get("/dashboard",  AdminController.earningStatics);

/**Testimonials feedback */
router.get("/feedback/gett", checkPermanent, AdminController.getFeedbacks);

router.post(
  "/feedback/approve",
  checkPermanent,
  AdminController.approveRejectFeedback
);

router.post("/feedback/delete", checkPermanent, AdminController.deleteFeedback);

router.post("/feedback/update", checkPermanent, AdminController.updateFeedback);
router.post("/add_faq", checkPermanent, AdminController.createFAQ);
router.get("/get_faq", checkPermanent, AdminController.getFaq);
router.post("/update_faq", checkPermanent, AdminController.updateFaq);
router.post("/delete_faq", checkPermanent, AdminController.deleteFaq);
router.post("/feedback/add",upload.single("profile_pic"), checkPermanent, AdminController.addFeedback);
router.get("/feedback/get", checkPermanent, AdminController.getFeedbackssim);
router.get("/feedback/get_without_token", AdminController.getFeedbackssim);
// router.post("/feedback/delete", AdminController.deleteFeedback);

// api for discount coupon (Date - 6_March_2025)
router.get('/coupons', AdminController.get_coupons)
router.post('/coupons/add', AdminController.add_discount_coupon)
router.post('/coupons/update', AdminController.update_discount_coupons)
router.post('/coupons/delete', AdminController.delete_discount_coupon)


// api for blogs (Date - 20_March_2025)
router.get('/blog', AdminController.get_blogs)
router.post('/blog/add', upload.single("image"), AdminController.add_blogs)
router.post('/blog/update',  upload.single("image"), AdminController.update_blogs)
router.post('/blog/delete', AdminController.delete_blogs)
router.post('/blog/addreview', AdminController.add_review)
router.get("/blog/reviews/:blogId", AdminController.get_review)

//  api for news
router.post("/submit-newsmail", AdminController.submit_news_email);


// ✅ API: Admin sends newsletter to all users
router.post("/news/send-newsletter", AdminController.send_newsletter);

module.exports = router;