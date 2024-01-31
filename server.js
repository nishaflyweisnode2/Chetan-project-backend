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
if (process.env.NODE_ENV == "production") {
        console.log = function () { };
}
app.get("/", (req, res) => {
        res.send("Hello World! shahina ohja");
});

const router = require("./Routes/routes");
app.use("/", router);


mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host} : Chetan-project-backend`);
});

app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
});
module.exports = { handler: serverless(app) };



// pixel-8 form  needed