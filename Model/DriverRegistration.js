const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const Driver = mongoose.Schema({
    name: {
        type: String, 
        require: false
    }, 
    password: {
        type: String, 
        require: false
    }, 
    phone: {
        type: String, 
        require: false
    }, 
    email: {
        type: String, 
        require: false
    }, 
    image: {
        type: String, 
        require: false
    }, 
    otp: {
        type: String,
        require: true
    },
    status: {
        type: String,
        default: "disapprove"
    },
    role: {
        type: String,
        role:"driver"
    }
})

const driver  = mongoose.model('driver', Driver);

module.exports = driver;