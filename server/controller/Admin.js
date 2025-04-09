const niv = require("node-input-validator");
const bcrypt = require("bcryptjs");
const { SendMail, SendMailBulk } = require("../helper/Email");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const AdminModel = require("../model/AdminModel");
const Helper = require("../helper/Helper");
const CmsModel = require("../model/CmsModel");
const UserModel = require("../model/UserModel");
const mongoose = require("mongoose");
const readXlsxFile = require("read-excel-file/node");
const AirportsModel = require("../model/AirportsModel");
const AirlineModel = require("../model/AirlineModel");
const BookingModel = require("../model/BookingModel");
const DestinationsModel = require("../model/DestinationsModel");
const moment = require("moment");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Amadeus = require("amadeus");
const { default: axios } = require("axios");
const TopSights = require("../model/TopSightsModel");
const ContactModel = require("../model/ContactModel");
const HelpCenterModel = require("../model/HelpCenterModel");
const TestimonialModel = require("../model/TestimonialModel");
const FaqModel = require("../model/FaqModel");
const CouponModel = require("../model/CouponModel");
const BlogModel = require("../model/BlogModel");
const NewsModel = require("../model/NewsModel");
const BlogReviewModel = require("../model/BlogReviewModel");

const amadeus = new Amadeus({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// const amadeus = new Amadeus({
//   clientId: process.env.LIVE_CLIENT_ID,
//   clientSecret: process.env.LIVE_CLIENT_SECRET,
//   hostname: "production",
// });

exports.registerAdmin = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    name: "required|maxLength:55",
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
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const newUser = new AdminModel({
      name: name,
      email: email,
      password: hash,
    });
    await newUser.save();
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Admin Registered Successfully",
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

exports.ResendOtp = async (req, res) => {
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
    const userData = await AdminModel.findOne({ email: email });
    if (userData) {
      const subject = "Travel Quota Reset Password Mail";

      const token = jwt.sign(
        {
          email: userData.email,
          id: userData._id,
        },
        process.env.TEMP_KEY,
        {
          expiresIn: "10m",
        }
      );

      await SendMail(email, subject, token);
      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage:
          "Password reset link sent successfully, please check email",
        succeeded: true,
        ResponseBody: { token: token, email: email },
      });
    } else {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Admin Not Registered!",
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
  console.log("req.admin login_:", req.body)
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
    let AdminResult = await AdminModel.aggregate([
      {
        $match: {
          email: req.body.email,
          status: { $ne: "3" },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          profile_pic: 1,
          createdAt: 1,
          password: 1,
        },
      },
    ]);
    if (!AdminResult[0]) {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Admin Not Registered!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const checkPassword = await bcrypt.compare(
      req.body.password,
      AdminResult[0].password
    );

    if (!checkPassword) {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Invalid Email or Password",
        succeeded: false,
        ResponseBody: {},
      });
    }
    // console.log(AdminResult);
    const token = jwt.sign(
      {
        email: AdminResult[0].email,
        id: AdminResult[0]._id,
      },
      process.env.ADMIN_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Login Success!",
      succeeded: true,
      ResponseBody: { token: token },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.AdminData._id).select(
      "name email profile_pic"
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Admin Getting Successfully",
      succeeded: true,
      ResponseBody: admin,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updateObject = {};
    if (name) updateObject.name = name;
    if (email) updateObject.email = email;
    if (req.file) {
      updateObject.profile_pic = req.file.path;
    }
    await AdminModel.findByIdAndUpdate(req.AdminData._id, {
      $set: updateObject,
    });

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Personal info updated successfully",
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
    const userResult = await AdminModel.findById(req.AdminData._id);
    const checkPassword = await bcrypt.compare(
      old_password,
      userResult.password
    );

    if (!checkPassword) {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Incorrect current password",
        succeeded: false,
        ResponseBody: {},
      });
    }
    if (new_password !== confirm_password) {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Confirm Password is Not Same As New Password!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await AdminModel.findByIdAndUpdate(userResult._id, {
      $set: { password: hash },
    });

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Password changed successfully",
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

exports.ForgotPasswordSendMail = async (req, res) => {
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
    const adminData = await AdminModel.findOne({ email: email });
    if (adminData) {
      const subject = "Travel Quota Forgot Password Mail";

      const token = jwt.sign(
        {
          email: adminData.email,
          id: adminData._id,
          name: adminData.name,
        },
        process.env.TEMP_KEY,
        {
          expiresIn: "10m",
        }
      );

      await SendMail(email, subject, token, 3);
      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage:
          "Password reset link sent successfully, please check email",
        succeeded: true,
        ResponseBody: { token: token, email: email },
      });
    } else {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Admin Not Registered!",
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

exports.verifyForgotPasswordMail = async (req, res) => {
  try {
    const user = req.AdminData;

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        name: user.name,
      },
      process.env.TEMP_KEY,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Email Verified Successfully",
      succeeded: true,
      ResponseBody: { email: user.email, token: token },
    });
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
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Confirm Password is Not Same As New Password!",
        succeeded: false,
        ResponseBody: {},
      });
    }
    const userResult = await AdminModel.findById(req.AdminData._id);
    if (userResult) {
      const hash = await bcrypt.hash(new_password, 10);
      await AdminModel.findByIdAndUpdate(userResult._id, {
        $set: { password: hash },
      });
      return res.status(200).json({
        ResponseCode: 200,
        ResponseMessage: "Password changed successfully!",
        succeeded: true,
        ResponseBody: {},
      });
    } else {
      return res.status(203).json({
        ResponseCode: 203,
        ResponseMessage: "Admin not Registered!",
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

exports.bulkEmail = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    subject: "required",
    content: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { subject, content, users } = req.body;
    await SendMailBulk(users, subject, content);
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage:
        "Mail sent successfully.",
      succeeded: true,
      ResponseBody: { users },
    });
    return res
      .status(200)
      .json({ message: `Error Occured!`, error: "errpr" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};
/** content management */
exports.createCms = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    title: "required",
    content: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { title, content } = req.body;
    const slug = await Helper.createSlug(title);
    const checkExist = await CmsModel.findOne({ slug: slug });
    if (checkExist) {
      return res.status(203).send({
        ResponseCode: 203,
        ResponseMessage: `${title} Content Already Exist!`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    const cms = new CmsModel({
      title: title,
      content: content,
      slug: slug,
    });
    await cms.save();
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `${title} Content Added Success`,
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

exports.updateCms = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    cms_id: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { cms_id, content } = req.body;
    const cms = await CmsModel.findByIdAndUpdate(
      cms_id,
      {
        $set: { content: content },
      },
      { new: true }
    );
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `${cms.title} Content Updated Successfully`,
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

exports.getCms = async (req, res) => {
  try {
    const result = await CmsModel.find({}).select("title content slug status");

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Contents Retrived Success`,
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

/** User Management */
exports.addUser = async (req, res, next) => {
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

    if (userEmailCheck) {
      return res.send({
        ResponseCode: 400,
        ResponseMessage: "User already exist.",
        succeeded: false,
        ResponseBody: {},
      });
    }

    const hash = await bcrypt.hash(password, 10);
    let profile_pic = "";
    if (req.file) {
      profile_pic = req.file.path;
    }
    const newUser = new UserModel({
      first_name: first_name,
      last_name: last_name,
      email: email,
      mobile: mobile,
      password: hash,
      is_verified: true,
      profile_pic,
    });

    const result = await newUser.save();

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "User Added Successfully.",
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

exports.updateUser = async (req, res) => {
  try {
    const { user_id, first_name, last_name, email, mobile, password } =
      req.body;

    const updateObject = {};
    if (first_name) updateObject.first_name = first_name;
    if (last_name) updateObject.last_name = last_name;
    if (email) updateObject.email = email;
    if (mobile) updateObject.mobile = mobile;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateObject.password = hash;
    }
    if (req.file) {
      updateObject.profile_pic = req.file.path;
    }
    await UserModel.findByIdAndUpdate(user_id, {
      $set: updateObject,
    });

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "User Details Updated Successfully!",
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

exports.changeStatusUser = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    user_id: "required",
    status: "required|in:1,2,3",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { user_id, status } = req.body;

    if (status == 1) message = `User Activated Successfully`;
    if (status == 2) message = `User Deactivated Successfully`;
    if (status == 3) message = `User Deleted Successfully`;
    await UserModel.findByIdAndUpdate(user_id, {
      $set: { status: status },
    });

    return res.json({
      ResponseCode: 200,
      ResponseMessage: message,
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

exports.alluser = async (req, res) => {
  try {
    const matchObject = {
      status: { $in: [1, 2] } // Filter users with status 1 or 2
    };

    const result = await UserModel.aggregate([
      { $match: matchObject },
      {
        $sort: { createdAt: -1 } // Sort by createdAt field descending
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          mobile: 1,
          profile_pic: 1,
          status: 1,
          is_verified: 1
        }
      }
    ]);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Users retrieved successfully`,
      succeeded: true,
      ResponseBody: result
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    return res.status(500).json({ message: `Error Occurred!`, error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page, limit, search, phone, email } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };

    const matchObject = {};
    matchObject.status = { $in: [1, 2] };
    if (search) {
      matchObject.$or = [
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$first_name", " ", "$last_name"],
              },
              regex: search,
              options: "i",
            },
          },
        },
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
      ];
    }

    if (email) {
      matchObject.email = { $regex: email, $options: "i" };
    }

    if (phone) {
      matchObject.mobile = { $regex: phone, $options: "i" };
    }

    const resultAggregate = UserModel.aggregate([
      {
        $match: matchObject,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          mobile: 1,
          profile_pic: 1,
          status: 1,
          is_verified: 1,
          coins: 1,
        },
      },
    ]);

    const result = await UserModel.aggregatePaginate(resultAggregate, options);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Users Getting Successfully`,
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

exports.getUserDetails = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    user_id: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const result = await UserModel.findById(req.body.user_id);

    result.status =
      result.status == 1 ? "Active" : result.status == 2 ? "Deactive" : "NA";

    result.is_verified =
      result.is_verified == 0
        ? "Not Verified"
        : result.is_verified == 1
          ? "Verified"
          : "NA";

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `User Details Getting Success`,
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

exports.importData = async (req, res) => {
  try {
    let newArray = [];

    // return
    const rows = await readXlsxFile(req.file.path);
    // skip header
    rows.shift();
    await Promise.all(
      rows.map(async (row) => {
        const newState = {
          name: row[0],
          country: row[1],
          code: row[2],
        };
        newArray.push(newState);
      })
    );

    const result = await AirportsModel.insertMany(newArray);
    // console.log("🚀newState:", result)
    return res.send({
      message: "File is uploaded successfully",
      // result: result,
    });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not read the file: " + error,
    });
  }
};

/** Airline and Airports Management */
exports.getAirports = async (req, res) => {
  try {
    const { page, limit, search, code } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };

    const matchObject = {};
    matchObject.status = { $in: [1, 2] };

    if (search) {
      matchObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
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
    const { page, limit, search, code } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };

    const matchObject = {};
    matchObject.status = { $in: [1, 2] };
    if (search) {
      matchObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    const resultAggregate = AirlineModel.aggregate([
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

    const result = await AirlineModel.aggregatePaginate(
      resultAggregate,
      options
    );
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

exports.addAirline = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    name: "required",
    code: "required",
    // common_name: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { name, code, common_name } = req.body;
    const airlineCheck = await AirlineModel.findOne({
      code: code.toUpperCase(),
      status: {
        $ne: "3",
      },
    });

    if (airlineCheck) {
      return res.send({
        ResponseCode: 400,
        ResponseMessage: "Airline already exist.",
        succeeded: false,
        ResponseBody: {},
      });
    }

    const newUser = new AirlineModel({
      name,
      code: code.toUpperCase(),
      common_name,
    });

    const result = await newUser.save();

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Airline Added Successfully.",
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

exports.addAirport = async (req, res, next) => {

  console.log("ye bhi chala")
  const objValidation = new niv.Validator(req.body, {
    name: "required",
    code: "required",
    country: "required",
    city: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { name, code, country, city } = req.body;
    const airlineCheck = await AirportsModel.findOne({
      code: code.toUpperCase(),
      status: {
        $ne: "3",
      },
    });

    if (airlineCheck) {
      return res.send({
        ResponseCode: 400,
        ResponseMessage: "Airport already exist.",
        succeeded: false,
        ResponseBody: {},
      });
    }

    const newUser = new AirportsModel({
      name,
      code: code.toUpperCase(),
      country,
      city,
    });

    const result = await newUser.save();

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Airport Added Successfully.",
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

exports.updateAirline = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    airline_id: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { airline_id, name, common_name } = req.body;
    const updateObj = {};
    if (name) updateObj.name = name;
    if (common_name) updateObj.common_name = common_name;
    const result = await AirlineModel.findByIdAndUpdate(
      airline_id,
      {
        $set: updateObj,
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Airline Details Updated Successfully.",
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

exports.updateAirport = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    airport_id: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { airport_id, name, country, city } = req.body;
    const updateObj = {};
    if (name) updateObj.name = name;
    if (country) updateObj.country = country;
    if (city) updateObj.city = city;
    const result = await AirportsModel.findByIdAndUpdate(
      airport_id,
      {
        $set: updateObj,
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Airport Details Updated Successfully.",
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

exports.deleteAirline = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    airline_id: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { airline_id } = req.body;
    await AirlineModel.findByIdAndUpdate(
      airline_id,
      {
        $set: { status: 3 },
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Airline Deleted Successfully.",
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

exports.deleteAirport = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    airport_id: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { airport_id } = req.body;
    await AirportsModel.findByIdAndUpdate(
      airport_id,
      {
        $set: { status: 3 },
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Airport Deleted Successfully.",
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

exports.changeStatusAirline = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    airline_id: "required",
    status: "required|in:1,2,3",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { airline_id, status } = req.body;
    let message;
    if (status == 1) message = `Airline Enable Successfully`;
    if (status == 2) message = `Airline Disable Successfully`;
    const result = await AirlineModel.findByIdAndUpdate(
      airline_id,
      {
        $set: { status: status },
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: message,
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

exports.changeStatusAirport = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    airport_id: "required",
    status: "required|in:1,2",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { airport_id, status } = req.body;
    let message;
    if (status == 1) message = `Airport Enable Successfully`;
    if (status == 2) message = `Airport Disable Successfully`;

    const result = await AirportsModel.findByIdAndUpdate(
      airport_id,
      {
        $set: { status: status },
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: message,
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
    if (status === "completed") {
      matchObject.depart_date = { $lte: new Date() };
      matchObject.booking_status = { $ne: "canceled" };
    } else if (status === "confirmed") {
      matchObject.booking_status = "confirmed";
      matchObject.depart_date = { $gt: new Date() }
    } else if (status === "canceled") {
      matchObject.booking_status = "canceled";
    } else if (status === "refund_in_progress") {
      matchObject.booking_status = "refund_in_progress";
    }
    if (search) {
      matchObject.$or = [
        { ["usersData.first_name"]: { $regex: search, $options: "i" } },
        { ["usersData.last_name"]: { $regex: search, $options: "i" } },
      ];
    }
    console.log("matchObject", matchObject);

    const resultAggregate = BookingModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "usersData",
        },
      },
      {
        $unwind: {
          path: "$usersData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchObject,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          user: {
            _id: "$usersData._id",
            name: {
              $concat: ["$usersData.first_name", " ", "$usersData.last_name"],
            },
            email: "$usersData.email",
            mobile: "$usersData.mobile",
            profile_pic: "$usersData.profile_pic",
            status: "$usersData.status",
          },
          passengers_info: 1,
          amount: 1,
          payment_intent_id: 1,
          transaction_id: 1,
          payment_method: 1,
          payment_status: 1,
          depart_date: 1,
          booking_status: 1,
          refund_details: 1,
          booking_data: 1,
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
          createdAt: 1,
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
        element.booking_status != "canceled" && element.booking_status != "refund_in_progress" &&
        moment(
          element?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
            ?.departure?.at
        ).isBefore(moment())
      ) {
        element.booking_status = "completed";
      }
    }
    // for (let i = 0; i < result.docs.length; i++) {
    //   const element = result.docs[i];

    //   const isNotCanceledOrRefundInProgress =
    //     element.booking_status !== "canceled" && element.booking_status !== "refund_in_progress";

    //   const hasDeparted =
    //     moment(element?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]?.departure?.at).isBefore(moment());

    //   if (isNotCanceledOrRefundInProgress && hasDeparted) {
    //     element.booking_status = "completed";
    //   }
    // }
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

exports.addDestination = async (req, res) => {
  let result = {};
  try {
    const { name, title, description } = req.body;

    const existsDest = await DestinationsModel.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (existsDest?.name.toUpperCase() === name.toUpperCase()) {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: `Destination Already Exist`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    // return;
    let locationData = await axios.get(
      `http://api.weatherstack.com/current?access_key=853fdcdb5c56969f22f586a72f78fe4d&query=${name}`
    );
    // console.log(locationData?.data);
    // return;
    if (locationData?.data?.success !== false) {
      let images = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          const element = req.files[i];
          images.push(element.path);
        }
      }
      const destination = new DestinationsModel({
        name: locationData?.data?.location?.name,
        title: title,
        description: description,
        images: images,
        general_info: locationData?.data,
        location: {
          type: "Point",
          coordinates: [
            Number(locationData?.data.location.lon),
            Number(locationData?.data.location.lat),
          ],
        },
      });
      result = await destination.save();

      const topSightData =
        await amadeus.referenceData.locations.pointsOfInterest.get({
          latitude: locationData?.data.location.lat,
          longitude: locationData?.data.location.lon,
          categories: "SIGHTS",
          radius: 10,
        });

      if (topSightData?.data.length > 0) {
        for (let i = 0; i < topSightData?.data.length; i++) {
          const element = topSightData?.data[i];
          let locaData = await axios.get(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
              element.name
            )}&inputtype=textquery&fields=photos,formatted_address,name,rating&key=AIzaSyBfiSLymlNHdLRxKMYNHhNZGNIyBWnHw-M`
          );

          let sightImage = [];
          for (
            let j = 0;
            j < locaData?.data?.candidates[0]?.photos?.length;
            j++
          ) {
            const element1 = locaData?.data?.candidates[0]?.photos[j];
            sightImage.push(
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${element1?.photo_reference}&key=AIzaSyBfiSLymlNHdLRxKMYNHhNZGNIyBWnHw-M`
            );
          }
          const topSights = new TopSights({
            destination_id: result._id,
            name: element.name,
            images: sightImage,
            location: {
              type: "Point",
              coordinates: [
                Number(element?.geoCode?.longitude),
                Number(element?.geoCode?.latitude),
              ],
            },
          });
          await topSights.save();
        }
        return res.json({
          ResponseCode: 200,
          ResponseMessage: `Destinations Added Successfully`,
          succeeded: true,
          ResponseBody: result,
        });
      } else {
        await DestinationsModel.findByIdAndDelete(result._id);
        return res.json({
          ResponseCode: 400,
          ResponseMessage: `Client Error`,
          succeeded: false,
          ResponseBody: {},
        });
      }
    } else {
      return res.json({
        ResponseCode: 400,
        ResponseMessage: `Invalid Destination`,
        succeeded: false,
        ResponseBody: {},
      });
    }
  } catch (err) {
    await DestinationsModel.findByIdAndDelete(result._id);
    console.log(err);
    return res.status(500).json({
      ResponseCode: 400,
      ResponseMessage: `Error Occured`,
      succeeded: false,
      ResponseBody: err ? err?.response?.result?.errors : err.message,
    });
  }
};

exports.getDestinations = async (req, res) => {
  try {
    const result = await DestinationsModel.aggregate([
      {
        $match: {
          status: { $in: [1, 2] },
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
    return res.json({
      ResponseCode: 200,
      ResponseMessage: `Destinations Retrived Successfully`,
      succeeded: true,
      ResponseBody: result,
    });
  } catch (err) {
    return res.json({ err: err.message });
  }
};

exports.changeStatusDestination = async (req, res, next) => {
  const objValidation = new niv.Validator(req.body, {
    destination_id: "required",
    status: "required|in:1,2,3",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation Error",
      errors: objValidation.errors,
    });
  }
  try {
    const { destination_id, status } = req.body;
    let message;
    if (status == 1) message = `Destination Enabled Successfully`;
    if (status == 2) message = `Destination Disabled Successfully`;
    if (status == 3) message = `Destination Deleted Successfully`;

    const result = await DestinationsModel.findByIdAndUpdate(
      destination_id,
      {
        $set: { status: status },
      },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: message,
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

exports.updateDestination = async (req, res) => {
  try {
    const { destination_id, name, title, description } = req.body;

    const resultCheck = await DestinationsModel.findById(destination_id);

    const updateObj = {};
    console.log(req.files, "req.body.files");
    if (req.files || req.body.delete_index) {
      let imagesArr = [];
      imagesArr = resultCheck.images;

      if (req.body.delete_index) {
        let deleteIndexArr = req.body.delete_index.split(",").map((element) => {
          return Number(element);
        });

        for (let i = 0; i < deleteIndexArr.length; i++) {
          let index = deleteIndexArr[i] - i;
          imagesArr.splice(index, 1);
        }
      }

      if (req.files) {
        for (let i of req.files) {
          imagesArr.push(i.path);
        }
      }

      updateObj.images = imagesArr;
    }

    // if (name) updateObj.name = name;
    if (title) updateObj.title = title;
    if (description) updateObj.description = description;

    const updateData = await DestinationsModel.findByIdAndUpdate(
      destination_id,
      { $set: updateObj },
      { new: true }
    );

    return res.json({
      ResponseCode: 200,
      ResponseMessage: `Destinations Details Updated Successfully`,
      succeeded: true,
      ResponseBody: updateData,
    });
  } catch (err) {
    return res.json({ err: err.message });
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
        let max_rang = 10000;
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

/** contact details  */
exports.AddUpdateContactInfo = async (req, res) => {
  try {
    const {
      email,
      number,
      facebook_url,
      linkedin_url,
      instagram_url,
      twitter_url,
      address,
    } = req.body;

    const checkExist = await ContactModel.findOne({});
    let message = "";
    if (checkExist) {
      const updateObj = {};
      if (email) updateObj.email = email;
      if (number) updateObj.number = number;
      if (facebook_url) updateObj.facebook_url = facebook_url;
      if (linkedin_url) updateObj.linkedin_url = linkedin_url;
      if (instagram_url) updateObj.instagram_url = instagram_url;
      if (twitter_url) updateObj.twitter_url = twitter_url;
      if (address) updateObj.address = address;
      await ContactModel.findByIdAndUpdate(
        checkExist._id,
        { $set: updateObj },
        { new: true }
      );
      message = "Contact details updated successfully";
    } else {
      const newContact = new ContactModel({
        email: email,
        number: number,
        facebook_url: facebook_url,
        linkedin_url: linkedin_url,
        instagram_url: instagram_url,
        twitter_url: twitter_url,
        address: address,
      });
      await newContact.save();
      message = "Contact Added Successfully";
    }

    return res.json({
      ResponseCode: 200,
      ResponseMessage: message,
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

exports.getHelpMessages = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };
    const result = await HelpCenterModel.aggregatePaginate([], {
      page: options.page,
      limit: options.limit,
      sort: { createdAt: -1 },
    });


    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Messages Getting Successfully`,
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

exports.completeRefund = async (req, res) => {
  try {
    await BookingModel.findByIdAndUpdate(
      req.body.booking_id,
      {
        $set: {
          booking_status: "canceled",
          payment_status: "refunded",
        },
      },
      { new: true }
    );
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Refunded Successfully`,
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

exports.earningStatics = async (req, res) => {
  try {
    const startDate = moment().subtract(30, "days").startOf("day");
    const endDate = moment().endOf("day");

    const result = await BookingModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
          booking_status: { $in: ["completed", "confirmed"] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalAmount: { $sum: { $toDouble: "$usd_amount" } },
        },
      },
      {
        $project: {
          date: "$_id",
          // _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    const allDates = [];

    for (
      let date = startDate.clone();
      date.isBefore(endDate);
      date.add(1, "day")
    ) {
      allDates.push(date.format("YYYY-MM-DD"));
    }

    const finalResult = allDates.map((date) => {
      const existingData = result.find((data) => data._id === date) || {
        date: date,
        totalAmount: 0,
      };

      return existingData;
    });
    const newResult = {};
    newResult.graphData = finalResult;
    const totalEarning = await BookingModel.aggregate([
      {
        $match: { booking_status: { $in: ["completed", "confirmed"] } },
      },
      {
        $group: {
          _id: null,
          totalEarn: { $sum: { $toDouble: "$usd_amount" } },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const totalUsers = await UserModel.countDocuments({
      status: { $in: [1, 2] },
    });
    const totalEarn = totalEarning.length > 0 ? totalEarning[0].totalEarn : 0;
    const totalDocs = totalEarning.length > 0 ? totalEarning[0].totalCount : 0;
    // console.log("Total Amount:", totalEarn);
    newResult.totalEarning = totalEarn;
    newResult.totalBooking = totalDocs;
    newResult.totalUsers = totalUsers;
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Earning Report Getting Successfully`,
      succeeded: true,
      ResponseBody: newResult,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Error Occured!`, error: err.message });
  }
};

/** testimonials feedback */
exports.getFeedbacks = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const options = {
      page: page ? page : 1, // Page number
      limit: limit ? limit : 10, // Number of documents per page
    };

    const matchObject = {};
    matchObject.status = { $in: [1, 2] };

    if (search) {
      matchObject.$or = [
        { ["userData.first_name"]: { $regex: search, $options: "i" } },
        { ["userData.last_name"]: { $regex: search, $options: "i" } },
      ];
    }

    const resultAggregate = TestimonialModel.aggregate([
      {
        $lookup: {
          from: "users",
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
        $match: matchObject,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
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
    const result = await TestimonialModel.aggregatePaginate(
      resultAggregate,
      options
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Testimonials Getting Successfully`,
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

exports.approveRejectFeedback = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    status: "required|in:1,2",
    feedback_id: "required",
  });

  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const result = await TestimonialModel.findByIdAndUpdate(
      req.body.feedback_id,
      {
        $set: { status: req.body.status },
      }
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Feedback ${req.body.status === 1 ? "Approved" : "Rejected"
        } Successfully`,
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

exports.deleteFeedback = async (req, res) => {
  try {
    const result = await TestimonialModel.findByIdAndUpdate(
      req.body.feedback_id,
      {
        $set: { status: 3 },
      }
    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Feedback Deleted Successfully`,
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

exports.updateFeedback = async (req, res) => {
  try {
    const { feedback, feedback_id } = req.body;
    const result = await TestimonialModel.findByIdAndUpdate(feedback_id, {
      $set: { feedback: feedback },
    });

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Feedback Updated Successfully`,
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



exports.createFAQ = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    question: "required",
    answer: "required",
  });
  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      message: "Validation error",
      errors: objValidation.errors,
    });
  }
  try {
    const { question, answer } = req.body;

    const faq = new FaqModel({
      question: question,
      answer: answer,
    });
    await faq.save();
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Content Added Success`,
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


exports.updateFaq = async (req, res) => {
  try {
    const { question, answer, faq_id } = req.body;
    const result = await FaqModel.findByIdAndUpdate(faq_id, {
      $set: { question: question, answer: answer, faq_id },
    });

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Faq Updated Successfully`,
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


exports.deleteFaq = async (req, res) => {
  try {
    const result = await FaqModel.findByIdAndDelete(
      req.body.faq_id,

    );

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Faq Deleted Successfully`,
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

exports.addFeedback = async (req, res) => {
  try {
    const feedback = new TestimonialModel({
      user_id: req.AdminData.id,
      user_name: req.body.user_name,
      user_mobile: req.body.user_mobile,
      user_email: req.body.user_email,
      feedback: req.body.feedback,
      status: req.body.status,
      profile_pic: req.file ? req.file.path : null,
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

exports.getFeedbackssim = async (req, res) => {
  try {
    const result = await TestimonialModel.find({
      status: { $ne: 3 }
    });
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: `Testimonial Getting Successfully`,
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


// exports.deleteFeedback = async (req, res) => {
//   try {
//     const {  _id } = req.body;
//     const result = await FaqModel.findByIdAndUpdate(_id, {
//       $set: { status: 3,},
//     });

//    if(result){
//     return res.status(200).json({
//       ResponseCode: 200,
//       ResponseMessage: `Feedback Delete Successfully`,
//       succeeded: true,
//       ResponseBody: {},
//     });
//    }else{
//     return res.status(400).json({
//       ResponseCode: 400,
//       ResponseMessage: `Something went wrong`,
//       succeeded: true,
//       ResponseBody: {},
//     });
//    }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(500)
//       .json({ message: `Error Occured!`, error: err.message });
//   }
// };


/** Get Coupons with Pagination & Search */
exports.get_coupons = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    
    // Pagination options
    const options = {
      page: page ? parseInt(page) : 1, // Default page 1
      limit: limit ? parseInt(limit) : 10, // Default 10 per page
    };

    // Filtering object
    const matchObject = {};
    
    // If filtering by status (active/inactive)
    if (status) {
      matchObject.isActive = status === "active" ? true : false;
    }

    // If search query exists, match with couponCode
    if (search) {
      matchObject.$or = [
        { couponCode: { $regex: search, $options: "i" } }, // Case-insensitive search
      ];
    }

    // Aggregation pipeline
    const resultAggregate = CouponModel.aggregate([
      { $match: matchObject },
      { $sort: { expirationDate: -1 } }, // Sort by expiration date (newest first)
      {
        $project: {
          _id: 1,
          couponCode: 1,
          discountValue: 1,
          discountType: 1,
          expirationDate: 1,
          isActive: 1,
        },
      },
    ]);

    // Paginate using mongoose-aggregate-paginate
    const result = await CouponModel.aggregatePaginate(resultAggregate, options);

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Coupons fetched successfully",
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

exports.add_discount_coupon = async (req, res) => {
  try {
    // Create a new coupon using the request data
    const newCoupon = new CouponModel(req.body);

    // Save the coupon to MongoDB
    await newCoupon.save();

    return res.status(201).json({
      ResponseCode: 200,
      succeeded: true,
      ResponseMessage: "Coupon created successfully",
      ResponseBody: newCoupon,
    });
  } catch (error) {
    console.error("Error saving coupon:", error);
    return res.status(500).json({
      succeeded: false,
      ResponseMessage: "Error saving   coupon",
      error: error.message,
    });
  }
}

exports.update_discount_coupons = async (req, res) => {
  try {
    const { coupon_id, couponCode, discountValue, discountType, expirationDate  } = req.body;

    // ❌ Validation: Check if coupon_id is provided
    if (!coupon_id) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Coupon ID is required." });
    }

    // ✅ Update the coupon directly
    const updatedCoupon = await CouponModel.findByIdAndUpdate(
      coupon_id,
      {
        couponCode,
        discountValue,
        discountType,
        expirationDate,
      },
      { new: true } // Returns the updated document
    );

    if (!updatedCoupon) {
      return res.status(404).json({ succeeded: false, ResponseMessage: "Coupon not found." });
    }

    return res.status(200).json({ succeeded: true, ResponseMessage: "Coupon updated successfully.", data: updatedCoupon });

  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({ succeeded: false, ResponseMessage: "Internal Server Error." });
  }
};


exports.delete_discount_coupon = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    coupon_id: "required",  // ✅ Ensure coupon_id is provided
  });

  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      ResponseCode: 422,
      ResponseMessage: "Validation Error",
      errors: objValidation.errors,
    });
  }

  try {
    const { coupon_id } = req.body; // ✅ Get coupon_id

    const deletedCoupon = await CouponModel.findByIdAndDelete(coupon_id); // ✅ Permanently delete coupon

    if (!deletedCoupon) {
      return res.status(404).json({
        ResponseCode: 404,
        ResponseMessage: "Coupon not found",
        succeeded: false,
      });
    }

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Coupon Deleted Successfully.",
      succeeded: true,
      ResponseBody: {},
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error Occurred!",
      succeeded: false,
      error: err.message,
    });
  }
};



// Blogs api

exports.add_blogs = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  try {
    const imageName = req.file ? req.file.filename : "";

    // Ensure `tips` and `keywords` are always arrays
    const tipsArray = req.body.tips
      ? (Array.isArray(req.body.tips) ? req.body.tips : req.body.tips.split(",").map(tip => tip.trim()))
      : [];

    const keywordsArray = req.body.keywords
      ? (Array.isArray(req.body.keywords) ? req.body.keywords : req.body.keywords.split(",").map(keyword => keyword.trim()))
      : [];

    const newBlog = new BlogModel({
      // id: newId,
      title: req.body.title,
      introduction: req.body.introduction,
      tips: tipsArray, // ✅ Always an array
      conclusion: req.body.conclusion,
      keywords: keywordsArray, // ✅ Always an array
      date: req.body.date || Date.now(),
      image: imageName,
    });

    await newBlog.save();

    return res.status(201).json({
      ResponseCode: 200,
      succeeded: true,
      ResponseMessage: "Blog created successfully",
      ResponseBody: newBlog,
    });
  } catch (error) {
    console.error("Error saving blog:", error);
    return res.status(500).json({
      succeeded: false,
      ResponseMessage: "Error saving blog",
      error: error.message,
    });
  }
};



exports.update_blogs = async (req, res) => {
  console.log("both_edit", req.file, req.body);

  try {
    const { blog_id, title, introduction, tips, conclusion, date, keywords } = req.body;

    // ❌ Validation: Check if blog_id is provided
    if (!blog_id) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Blog ID is required." });
    }

    // Convert `tips` and `keywords` to an array if they are strings
    const tipsArray = Array.isArray(tips) ? tips : tips?.split(",").map(tip => tip.trim());
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords?.split(",").map(keyword => keyword.trim());

    // Ensure `date` is valid, otherwise set the current date
    const validDate = date && Date.parse(date) ? new Date(date) : new Date();

    // Find the blog by its `id` field (not `_id`)
    const existingBlog = await BlogModel.findOne({ _id: blog_id });
    if (!existingBlog) {
      return res.status(404).json({ succeeded: false, ResponseMessage: "Blog not found." });
    }

    // Handle image update (keep the old image if no new one is provided)
    const image = req.file ? req.file.filename : existingBlog.image;

    // ✅ Update the blog
    existingBlog.title = title || existingBlog.title;
    existingBlog.introduction = introduction || existingBlog.introduction;
    existingBlog.tips = tipsArray || existingBlog.tips;
    existingBlog.conclusion = conclusion || existingBlog.conclusion;
    existingBlog.keywords = keywordsArray || existingBlog.keywords;
    existingBlog.date = validDate;
    existingBlog.image = image;

    await existingBlog.save(); // Save updated blog

    return res.status(200).json({
      succeeded: true,
      ResponseMessage: "Blog updated successfully.",
      data: existingBlog,
    });

  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ succeeded: false, ResponseMessage: "Internal Server Error." });
  }
};




exports.delete_blogs = async (req, res) => {
  const objValidation = new niv.Validator(req.body, {
    blog_id: "required",  // ✅ Ensure blog_id is provided
  });

  const matched = await objValidation.check();
  if (!matched) {
    return res.status(422).send({
      ResponseCode: 422,
      ResponseMessage: "Validation Error",
      errors: objValidation.errors,
    });
  }

  try {
    const { blog_id } = req.body; // ✅ Get blog_id

    const deletedBlog = await BlogModel.findByIdAndDelete(blog_id); // ✅ Permanently delete blog

    if (!deletedBlog) {
      return res.status(404).json({
        ResponseCode: 404,
        ResponseMessage: "Blog not found",
        succeeded: false,
      });
    }

    return res.json({
      ResponseCode: 200,
      ResponseMessage: "Blog Deleted Successfully.",
      succeeded: true,
      ResponseBody: {},
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error Occurred!",
      succeeded: false,
      error: err.message,
    });
  }
}

exports.get_blogs = async (req, res) => {
  // try {
    const { page, limit, search, status } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const matchObject = {};

    if (search) {
      matchObject.$or = [
        { title: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      matchObject.status = status;
    }

    // Aggregation pipeline
    const resultAggregate = BlogModel.aggregate([
      { $match: matchObject },
      { $sort: { date: -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          introduction: 1,
          tips: 1,
          conclusion: 1,
          keywords: 1,
          date: 1,
          image: 1, // ✅ Return only stored image filename
        },
      },
    ]);

    // Paginate using mongoose-aggregate-paginate
    const result = await BlogModel.aggregatePaginate(resultAggregate, {
      page: pageNumber,
      limit: limitNumber,
    });

    console.log("result_blog_:", result)
    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Blogs fetched successfully",
      succeeded: true,
      ResponseBody: result, // ✅ Response now contains only the image filename
    });

  // } catch (err) {
  //   console.error("Error fetching blogs:", err);
  //   return res.status(500).json({
  //     ResponseCode: 500,
  //     ResponseMessage: "Error occurred!",
  //     succeeded: false,
  //     error: err.message,
  //   });
  // }
};

// add review on blog
exports.add_review = async (req, res) => {
  const { blogId, email, review } = req.body;
  try{
    if (!blogId || !email || !review) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newReview = new BlogReviewModel({ blogId, email, review });
    await newReview.save();

    return res.status(200).json({
      ResponseCode: 200,
      ResponseMessage: "Blogs fetched successfully",
      succeeded: true,
      ResponseBody: newReview, // ✅ Response now contains only the image filename
    });

  } catch (err) {
    console.error("Error fetching blogs:", err);
    return res.status(500).json({
      ResponseCode: 500,
      ResponseMessage: "Error occurred!",
      succeeded: false,
      error: err.message,
    });
  }
}

// ✅ 2. GET - Get All Reviews for a Blog
exports.get_review =  async (req, res) => {
  console.log('hey_:', req.params)
  try {
    const { blogId } = req.params;
    const reviews = await BlogReviewModel.find({ blogId });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

exports.submit_news_email = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Email is required" });
    }

    // Save new email & review
    const newEntry = new NewsModel({ email });
    await newEntry.save();

    res.json({ succeeded: true, ResponseMessage: "Subscribed successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succeeded: false, ResponseMessage: "Error saving email & review" });
  }
}

exports.send_newsletter = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "Subject and Message are required!" });
    }

    // Get all emails
    const subscribers = await NewsModel.find({}, "email");
    const emailList = subscribers.map(sub => sub.email);

    if (emailList.length === 0) {
      return res.status(400).json({ succeeded: false, ResponseMessage: "No subscribers found!" });
    }

    SendMailBulk(emailList, subject, message)
    
    res.json({ succeeded: true, ResponseMessage: "Newsletter sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succeeded: false, ResponseMessage: "Error sending newsletter" });
  }
}