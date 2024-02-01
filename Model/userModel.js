const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  collectionBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  name: {
    type: String,
  },
  phone: {
    type: Number,
  },
  profilePicture: {
    type: String,
    default: ""
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  password: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    defaultValue: "male",
  },
  profile: {
    type: String
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  phone: {
    type: Number,
  },
  otp: {
    type: String
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false
  },
  balance: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Number,
});

module.exports = mongoose.model("User", userSchema);
