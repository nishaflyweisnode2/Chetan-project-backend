const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const path = require("path");
// require("./Cronjob/everyDayOrder");
// require("./Cronjob/customizedOrder");
// require("./Cronjob/alternateDayOrder");
// require("./Cronjob/sendNotificationBeforeCutoffTime");
const nodemailer = require("nodemailer");
const app = express();
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
        origin: 'https://d2cqpxw0xgflqm.cloudfront.net',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.get("/", (req, res) => {
        res.send("Hello World! Chetan");
});

const router = require("./Routes/routes");
app.use("/", router);
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host} : Chetan-project-backend`);
});

const axios = require('axios');

const username = 'GIRORGANIC';
const password = 'Girorganic@789';
const from = 'GIRORG';
const to = '917983270583';
const text = '876549 is your OTP for GIRORGANIC. Please do not share it with anyone.';
const indiaDltContentTemplateId = '1207170970346789539';
const indiaDltPrincipalEntityId = '1201162297097138491';

// const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';

// axios.get(apiUrl, {
//         params: {
//                 username,
//                 password,
//                 from,
//                 to,
//                 text,
//                 indiaDltContentTemplateId,
//                 indiaDltPrincipalEntityId
//         }
// })
//         .then(response => {
//                 console.log('Response:', response.data);
//         })
//         .catch(error => {
//                 console.error('Error:', error);
//         });


// const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// console.log(timezone);
// let currentDate = new Date();
// let options = {
//         timeZone: timezone,
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: 'numeric',
//         minute: 'numeric',
//         second: 'numeric',
//         hour12: false
// };
// let texasTime = currentDate.toLocaleString('en-US', options);
// console.log(`Current time: ${timezone} ` + texasTime);

app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
});
module.exports = app;
module.exports.handler = serverless(app);