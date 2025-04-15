const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const https = require('https');
const fs = require('fs');
const bodyParser = require("body-parser");
const path = require("path");
env.config(".env");

// Handling Uncaught Exception
console.log("mainb File")

require("./config/db");

var port = process.env.PORT;

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
// app.use(express.json());
// app.use("/Uploads", express.static("Uploads"));
app.use("/server/Uploads", express.static(path.join(__dirname, "Uploads")));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/user", require("./routes/user"));
app.use("/admin", require("./routes/admin"));
app.use("/flight", require("./routes/flight"));
app.use("/hotel", require("./routes/hotel"));
app.use("/transfer", require("./routes/transferRoutes"));

const options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/flightbooking.pem')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/cefaf1a435ef000c.crt')),
  ca: [fs.readFileSync(path.join(__dirname, './ssl/gd_bundle-g2-g1.crt'))],

};

// const httpsServer = https.createServer(options, app);

// httpsServer.listen(port, () => {
//   console.log(`Server running on https://localhost:${port}`);
// });


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

