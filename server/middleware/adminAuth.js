const jwt = require("jsonwebtoken");
const AdminModel = require("../model/AdminModel");

exports.checkTemporary = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: `Token Required`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    const token = req.headers.authorization.split(" ")[1];
    const { exp, id } = jwt.verify(token, process.env.TEMP_KEY);
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: `Token Expired`,
        succeeded: false,
        ResponseBody: { err: err.message },
      });
    }

    const AdminData = await AdminModel.findOne({ _id: id });
    if (AdminData === null) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: `Auth Fail`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    req.AdminData = AdminData;

    next();
  } catch (err) {
    return res.status(401).json({
      ResponseCode: 401,
      ResponseMessage: err.message,
      succeeded: false,
      ResponseBody: {},
    });
  }
};

exports.checkPermanent = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: `Token Required`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    const token = req.headers.authorization.split(" ")[1];
    const { exp, id } = jwt.verify(token, process.env.ADMIN_KEY);
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: `Token Expired`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    const AdminData = await AdminModel.findOne({ _id: id });
    if (AdminData === null) {
      return res.status(401).json({
        ResponseCode: 401,
        ResponseMessage: `Auth Fail`,
        succeeded: false,
        ResponseBody: {},
      });
    }
    req.AdminData = AdminData;

    next();
  } catch (err) {
    return res.status(401).json({
      ResponseCode: 401,
      ResponseMessage: err.message,
      succeeded: false,
      ResponseBody: {},
    });
  }
};
