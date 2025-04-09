const moment = require("moment");
const fs = require("fs");
// const NotificationModel = require("../model/NotificationModel");
const admin = require("firebase-admin");
const axios = require("axios");
const env = require("dotenv");
env.config(".env");
// const serviceAccount = require("../truemeasure-321f9-firebase-adminsdk-55e37-e401c3bc64.json");
// const FcmModel = require("../model/FcmModel");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://truemeasure-321f9-default-rtdb.firebaseio.com",
// });

exports.writeErrorLog = async (req, error) => {
  const requestURL = req.protocol + "://" + req.get("host") + req.originalUrl;
  const requestBody = JSON.stringify(req.body);
  const requestHeaders = JSON.stringify(req.headers);
  const date = moment().format("MMMM Do YYYY, h:mm:ss a");
  fs.appendFileSync(
    "Uploads/errorLog.log",
    "REQUEST DATE : " +
      date +
      "\n" +
      "API URL : " +
      requestURL +
      "\n" +
      "API PARAMETER : " +
      requestBody +
      "\n" +
      "API Headers : " +
      requestHeaders +
      "\n" +
      "Error : " +
      error +
      "\n\n"
  );
};

exports.createSlug = async (str) => {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
};

exports.generateAmadeousToken = async (str) => {
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;

  let configToken = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://test.api.amadeus.com/v1/security/oauth2/token`,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`,
  };

  const token = await axios.request(configToken);
  return `${token.data.token_type} ${token.data.access_token}`;
};

// exports.addNotification = async (user_id, title, text) => {
//   const notify = await new NotificationModel({
//     user_id,
//     title,
//     text,
//   }).save();

//   return notify;
// };

exports.call_msg_notification = async (registration_ids, messages) => {
  const message = {
    notification: {
      title: messages.title,
      body: messages.body,
    },
    tokens: registration_ids,
    data: {
      title: messages.title,
      body: messages.body,
      // notification_type: String(messages.type),
      id: String(messages.id),
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
  };
  // console.log(message)
  admin
    .messaging()
    .sendMulticast(message)
    .then(async (result) => {
      console.log(result);
    })
    .catch(async (err) => {
      console.log(err);
    });
};

exports.call_msg_ios_notification = async (registration_ids, messages) => {
  const message = {
    notification: {
      title: messages.title,
      body: messages.body,
    },
    tokens: registration_ids,
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: Number(messages.bedge),
        },
      },
    },
    data: {
      type: String(messages.type),
      chat_id: messages.chat_id ? String(messages.chat_id) : "",
    },
  };

  admin
    .messaging()
    .sendMulticast(message)
    .then(async (result) => {
      console.log(result);
    })
    .catch(async (err) => {
      console.log(err);
    });
};

// exports.sendPushNotification = async (user_id, title, body) => {
//   let messageObject = {};
//   messageObject.title = title;
//   messageObject.body = body;

//   const userTokens = await FcmModel.find({ user_id: { $in: user_id } });
//   const android_list = new Array();
//   const ios_list = new Array();

//   userTokens.map((userToken) => {
//     if (userToken.type == "android") {
//       android_list.push(userToken.token);
//     }
//     if (userToken.type == "ios") {
//       ios_list.push(userToken.token);
//     }
//   });

//   android_list.map(async (android_lists) => {
//     const registration_id = new Array();
//     registration_id.push(android_lists);
//     await this.call_msg_notification(registration_id, messageObject);
//   });

//   ios_list.map(async (ios_lists) => {
//     const registration_id = new Array();
//     registration_id.push(ios_lists);
//     await this.call_msg_ios_notification(registration_id, messageObject);
//   });
// };
