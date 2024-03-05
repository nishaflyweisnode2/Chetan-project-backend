const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const path = require("path");
const nodemailer = require("nodemailer");
const app = express();
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
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
const apiUrl = 'http://api.ask4sms.com/sms/1/text/query';
const username = 'GIRORGANIC';
const password = 'Gir2024@';
const from = 'GROGNC';
const to = '917983270583';
const text = '145673 is your verification code for Gir Organic app';
const indiaDltContentTemplateId = '1207163178705284094';
const indiaDltPrincipalEntityId = '1201162297097138491';

const params = {
        username,
        password,
        from,
        to,
        text,
        indiaDltContentTemplateId,
        indiaDltPrincipalEntityId
};

// axios.get(apiUrl, { params })
//         .then(response => {
//                 console.log('Response:', response.data);
//         })
//         .catch(error => {
//                 console.error('Error:', error.response);
//         });

app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
});
module.exports = app;
module.exports.handler = serverless(app);