const niv = require("node-input-validator");
const _ = require("lodash");
const UserModel = require("../model/UserModel");
const OtpModel = require("../model/OtpModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const CmsModel = require("../model/CmsModel");
const bcrypt = require("bcryptjs");
const { SendMail } = require("../helper/Email");
const BookingModel = require("../model/BookingModel");
const moment = require("moment");
const CouponModel = require("../model/CouponModel");
const QueryModel = require("../model/QueryModel");

exports.getAuth = async (req, res) => {
  let matchObj = {};

  matchObj.status = { $in: [1, 2] };

  try {
    const result = await UserModel.findById(req.userData.id).select(
      "first_name last_name email mobile profile_pic is_verified status coins"
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "User Getting Success",
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error occurred, Please try again later",
      error: err.message,
    });
  }
};

exports.register = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    first_name: "required",
    last_name: "required",
    mobile: "required",
    email: "required|email",
    password: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { first_name, last_name, email, mobile, password } = req.body;
    const userEmailCheck = await UserModel.findOne({
      $or: [{ email: email }, { mobile: mobile }],
      status: {
        $ne: "3",
      },
    });

    if (userEmailCheck?.is_verified == false) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "User already exist. Please Log In",
        succeeded: false,
        ResponseBody: { verified: false },
      });
    }

    if (userEmailCheck) {
      return res.send({
        ResponseCode: 400,
        ResponseMessage: "User already exist. Please Log In",
        succeeded: false,
        ResponseBody: {},
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      first_name: first_name,
      last_name: last_name,
      email: email,
      mobile: mobile,
      password: hash,
    });

    const result = await newUser.save();
    const subject = "Travel Quota Registration Mail";
    const otp = _.random(1000, 9999);
    await SendMail(email, subject, otp, 1);
    await new OtpModel({
      email: email,
      otp: otp,
    }).save();

    const token = jwt.sign(
      {
        email: result.email,
        id: result._id,
        otp: otp,
      },
      process.env.TEMP_KEY,
      {
        expiresIn: "10m",
      }
    );
    return res.json({
      ResponseCode: 200,
      ResponseMessage: "OTP Sent Successfully, Check Email",
      succeeded: true,
      ResponseBody: { token: token, code: otp, email: email },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    otp: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const user = req.userData;
    const otpData = await OtpModel.findOne({ email: user.email });
    if (otpData) {
      if (otpData.otp !== req.body.otp) {
        return res.json({
          ResponseCode: 400,
          ResponseMessage: "Please enter correct OTP",
          succeeded: false,
          ResponseBody: {},
        });
      }
      await OtpModel.findByIdAndDelete(otpData._id);
      const userResult = await UserModel.findByIdAndUpdate(user._id, {
        $set: { status: 1, is_verified: 1 },
      });

      const token = jwt.sign(
        {
          email: userResult.email,
          id: userResult._id,
        },
        process.env.USER_KEY,
        {
          expiresIn: "1d",
        }
      );
      return res.json({
        ResponseCode: 200,
        ResponseMessage: "Your account has been verified successfully",
        succeeded: true,
        ResponseBody: { email: user.email, token: token },
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.ResendOtp = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    email: "required|email",
    type: "required|in:1,2",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { email, type } = req.body;
    const userData = await UserModel.findOne({ email: email });
    if (userData) {
      const otp = _.random(1000, 9999);

      if (type == "1") {
        const subject = "Travel Quota Registration Mail";
        await SendMail(email, subject, otp, 1);
      } else if (type == "2") {
        const subject = "Travel Quota Reset Password Mail";
        await SendMail(email, subject, otp, 2);
      }
      const otpData = await OtpModel.findOne({ email: email });

      if (otpData) {
        await OtpModel.findByIdAndUpdate(otpData._id, {
          $set: { otp: otp },
        });
      } else {
        await new OtpModel({
          email: email,
          otp: otp,
        }).save();
      }

      const token = jwt.sign(
        {
          email: userData.email,
          id: userData._id,
          otp: otp,
        },
        process.env.TEMP_KEY,
        {
          expiresIn: "10m",
        }
      );
      return res.json({
        ResponseCode: 200,
        ResponseMessage: "OTP Sent Successfully, Check Email",
        succeeded: true,
        ResponseBody: { token: token, code: otp, email: email },
      });
    } else {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "User Not Registered, Please SignUp!",
        succeeded: false,
        ResponseBody: {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.login = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    email: "required|email",
    password: "required",
  });

  const matched = await objValidation.check();

  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }

  try {
    let userResult = await UserModel.aggregate([
      {
        $match: {
          email: { $regex: req.body.email, $options: "i" },
          status: { $ne: "3" },
        },
      },
      {
        $project: {
          first_name: 1,
          last_name: 1,
          mobile: 1,
          email: 1,
          status: 1,
          profile_pic: 1,
          is_verified: 1,
          createdAt: 1,
          password: 1,
        },
      },
    ]);
    if (!userResult[0]) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "User Not Registered, Please SignUp!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    if (userResult[0].status == 2) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage:
          "Your Account is Currently Deactivated, Please Contact Admin!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const checkPassword = await bcrypt.compare(
      req.body.password,
      userResult[0].password
    );

    if (!checkPassword) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "Invalid Password!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    if (userResult[0].is_verified == false) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "Please Verify Email to Login!",
        succeeded: false,
        ResponseBody: { verified: false },
      });
    }

    // console.log(userResult);
    const token = jwt.sign(
      {
        email: userResult[0].email,
        id: userResult[0]._id,
      },
      process.env.USER_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Login Success!",
      succeeded: true,
      ResponseBody: { token: token, role: userResult[0].role },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile } = req.body;

    const updateObject = {};
    if (first_name) updateObject.first_name = first_name;
    if (last_name) updateObject.last_name = last_name;
    if (email) updateObject.email = email;
    if (mobile) updateObject.mobile = mobile;
    if (req.file) {
      updateObject.profile_pic = req.file.path;
    }
    await UserModel.findByIdAndUpdate(req.userData._id, {
      $set: updateObject,
    });

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Profile info updated successfully",
      succeeded: true,
      ResponseBody: {},
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    old_password: "required",
    new_password: "required",
    confirm_password: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { old_password, new_password, confirm_password } = req.body;
    if (new_password == old_password) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "Current password and new password can not be same",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const userResult = await UserModel.findById(req.userData._id);
    const checkPassword = await bcrypt.compare(
      old_password,
      userResult.password
    );

    if (!checkPassword) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "Incorrect current password!",
        succeeded: false,
        ResponseBody: {},
      });
    }

    if (new_password !== confirm_password) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "Confirm Password is Not Same As New Password!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await UserModel.findByIdAndUpdate(userResult._id, {
      $set: { password: hash },
    });

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Password changed successfully!",
      succeeded: true,
      ResponseBody: {},
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.ForgotPasswordOtpSend = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    email: "required|email",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { email } = req.body;
    const userData = await UserModel.findOne({ email: email });
    // console.log("🚀 userData:", userData)
    if (userData && userData.status === "3") {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "User Not Registered, Please SignUp!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    if (userData) {
      const otp = _.random(1000, 9999);
      const subject = "Travel Quota Forgot Password Mail";

      await SendMail(email, subject, otp, 2);

      const otpData = await OtpModel.findOne({ email: email });

      if (otpData) {
        await OtpModel.findByIdAndUpdate(otpData._id, {
          $set: { otp: otp },
        });
      } else {
        await new OtpModel({
          email: email,
          otp: otp,
        }).save();
      }

      const token = jwt.sign(
        {
          email: userData.email,
          id: userData._id,
          otp: otp,
        },
        process.env.TEMP_KEY,
        {
          expiresIn: "10m",
        }
      );
      return res.json({
        ResponseCode: 200,
        ResponseMessage: "OTP Sent Successfully, Check Email",
        succeeded: true,
        ResponseBody: { token: token, code: otp, email: email },
      });
    } else {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "User Not Registered, Please SignUp!",
        succeeded: false,
        ResponseBody: {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    new_password: "required",
    confirm_password: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "Confirm Password is Not Same As New Password!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const userResult = await UserModel.findById(req.userData._id);
    if (userResult) {
      const hash = await bcrypt.hash(new_password, 10);
      await UserModel.findByIdAndUpdate(userResult._id, {
        $set: { password: hash },
      });
      return res.json({
        ResponseCode: 200,
        ResponseMessage: "Password changed successfully",
        succeeded: true,
        ResponseBody: {},
      });
    } else {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: "User Not Registered, Please SignUp!",
        succeeded: false,
        ResponseBody: {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.getGeneralTerms = async (req, res) => {
  try {
    const result = await CmsModel.findOne({
      slug: "general-terms-of-use",
    }).select("title content");

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `${result.title} Getting Successfully`,
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

exports.getCmsPrivacyPolicy = async (req, res) => {
  try {
    const result = await CmsModel.findOne({
      slug: "privacy-policy",
    }).select("title content");

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `${result.title} Getting Successfully`,
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

exports.getCmsCookiePolicy = async (req, res) => {
  try {
    const result = await CmsModel.findOne({
      slug: "cookie-policy",
    }).select("title content");

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `${result.title} Getting Successfully`,
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

exports.getCmsbestPriceGuarantee = async (req, res) => {
  try {
    const result = await CmsModel.findOne({
      slug: "best-price-guarantee",
    }).select("title content");

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `${result.title} Getting Successfully`,
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

exports.getCmsAboutUs = async (req, res) => {
  try {
    const result = await CmsModel.findOne({
      slug: "about-us",
    }).select("title content");

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `${result.title} Getting Successfully`,
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

exports.getBookings = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };

    const matchObject = {};

    matchObject.booking_status = { $ne: "pending" };
    if (status == "completed") {
      matchObject.booking_status = "completed";
    } else if (status == "confirmed") {
      matchObject.booking_status = "confirmed";
    } else if (status == "canceled") {
      matchObject.booking_status = "canceled";
    } else if (status == "refund_in_progress") {
      matchObject.booking_status = "refund_in_progress";
    }

    matchObject.user_id = new mongoose.Types.ObjectId(req.userData._id);

    const resultAggregate = BookingModel.aggregate([
      {
        $match: matchObject,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          passengers_info: 1,
          amount: 1,
          payment_intent_id: 1,
          transaction_id: 1,
          payment_method: 1,
          payment_status: 1,
          booking_status: 1,
          refund_details: 1,
          booking_data: 1,
          createdAt: 1,
          booking_confirm_date: "$booking_date_time",
          refundable_amount: {
            $reduce: {
              input: "$booking_data.flightOffers",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $sum: {
                      $map: {
                        input: "$$this.travelerPricings",
                        as: "travelerPricing",
                        in: {
                          $toDouble: "$$travelerPricing.price.base",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    const result = await BookingModel.aggregatePaginate(
      resultAggregate,
      options
    );
    for (let i = 0; i < result.docs.length; i++) {
      const element = result.docs[i];
      if (
        element.booking_status != "canceled" &&
        moment(
          element?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
            ?.departure?.at
        ).isBefore(moment())
      ) {
        element.booking_status = "completed";
      }
    }

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `Bookings Retrived Successfully`,
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


exports.validate_promo_code = async (req, res) => {
  
  try {
    const { promoCode, orderTotal } = req.query; // Get order total from query params

    // Find the promo code in the database
    const promo = await CouponModel.findOne({ couponCode: promoCode });

    if (!promo) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Invalid promo code" });
    }

    // Check if the promo code is expired
    const currentDate = new Date();
    if (promo.expirationDate < currentDate) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Promo code expired" });
    }

    // Check if the promo code is active
    if (!promo.isActive) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Promo code is not active" });
    }

    // Check if usage limit is available
    if (promo.usageLimit <= 0) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Promo code usage limit reached" });
    }

    // Check minimum order value
    if (orderTotal < promo.minOrderValue) {
      return res.status(400).json({ 
        succeeded: false, 
        ResponseMessage: `Minimum order value must be ${promo.minOrderValue} to use this promo code.` 
      });
    }

    return res.status(200).json({
      succeeded: true,
      discount: promo.discountValue, // Discount value from DB
      discountType: promo.discountType,
      ResponseMessage: "Promo code applied successfully!",
    });

  } catch (error) {
    console.error("Error validating promo code:", error);
    return res.status(500).json({ succeeded: false, ResponseMessage: "Server error" });
  }
};


exports.submit_query = async (req, res) => {
  console.log("req.body_:", req.body)
  try {
    const { name, email, phone, message } = req.body;

    const newQuery = new QueryModel({
        name,
        email,
        phone,
        message
    });

    await newQuery.save();

    res.status(201).json({ succeeded: true, ResponseMessage: "Query submitted successfully", query: newQuery });
  } catch (error) {
      console.error("Error submitting query:", error);
      res.status(500).json({ succeeded: false, ResponseMessage: "Failed to submit query" });
  }
}


/** Get Queries with Pagination & Search */
exports.get_all_queries = async (req, res) => {

  try {
    const { page, limit, search, status } = req.query;

    // Pagination options
    const options = {
      page: page ? parseInt(page) : 1, // Default page 1
      limit: limit ? parseInt(limit) : 10, // Default 10 per page
    };

    // Filtering object
    const matchObject = {};

    // If filtering by status (pending/completed)
    if (status) {
      matchObject.status = status;
    }

    // If search query exists, match with name or email
    if (search) {
      matchObject.$or = [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search for name
        { email: { $regex: search, $options: "i" } }, // Case-insensitive search for email
        { message: { $regex: search, $options: "i" } }, // Search in messages
      ];
    }

    // Aggregation pipeline
    const resultAggregate = QueryModel.aggregate([
      { $match: matchObject },
      { $sort: { createdAt: -1 } }, // Sort by newest queries first
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          message: 1,
          status: 1,
          remark: 1,
          createdAt: 1,
        },
      },
    ]);

    // Paginate using mongoose-aggregate-paginate
    const result = await QueryModel.aggregatePaginate(resultAggregate, options);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Queries fetched successfully",
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error occurred!",
      succeeded: false,
      error: err.message,
    });
  }
};


exports.update_query = async (req, res) => {
  console.log("Received Data:", req.body, "ID:", req.params.id);

  try {
    const { status, remark } = req.body;

    // Convert status to lowercase to match schema
    const updatedStatus = status;

    const query = await QueryModel.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    console.log("dtaLine")

    if (query.status === "Completed") {
      return res.status(400).json({ success: false, message: "Query is already completed." });
    }

    if (updatedStatus === "Completed") {
      query.status = "Completed";  // ✅ Use lowercase
      query.remark = remark || "";
      await query.save();

      return res.status(200).json({ success: true, message: "Query updated successfully", query });
    }

    return res.status(400).json({ success: false, message: "Invalid status update" });

  } catch (error) {
    console.error("Error updating query:", error);
    res.status(500).json({ success: false, message: "Failed to update query" });
  }
};


