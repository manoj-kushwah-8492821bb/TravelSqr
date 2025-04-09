const mongoose = require("mongoose");

// console.log("NODE_ENV :", process.env.NODE_ENV);
var url = process.env.DB_URL;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Mongodb connected`);
  })
  .catch((err) => {
    console.log("MongoDb Error : ", err);
    console.error(`MongoDB Connection Error: ${err}`);
  });

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("Connection is open");
});

// module.exports = connection;
