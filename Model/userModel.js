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
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
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
  addressStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["Active", "Block"],
    default: "Active"
  },
  userStatus: {
    type: String,
    enum: ["Approved", "UnApproved", "ServiceNotAvailable", "Pending"],
    default: "Pending"
  },
  paymentMode: {
    type: String,
    enum: ["PostPaid", "PrePaid"],
    default: "PostPaid"
  },
  balance: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Number,
  dashboard: {
    type: Boolean,
    default: false
  },
  userList: {
    type: Boolean,
    default: false
  },
  category: {
    type: Boolean,
    default: false
  },
  subCategory: {
    type: Boolean,
    default: false
  },
  product: {
    type: Boolean,
    default: false
  },
  order: {
    type: Boolean,
    default: false
  },
  subscribedOrder: {
    type: Boolean,
    default: false
  },
  unConfirmOrder: {
    type: Boolean,
    default: false
  },
  help: {
    type: Boolean,
    default: false
  },

  banner: {
    type: Boolean,
    default: false
  },
  terms: {
    type: Boolean,
    default: false
  },
  privacyPolicy: {
    type: Boolean,
    default: false
  },

  coupons: {
    type: Boolean,
    default: false
  },
  aboutUs: {
    type: Boolean,
    default: false
  },
  contact: {
    type: Boolean,
    default: false
  },

  faq: {
    type: Boolean,
    default: false
  },
  notification: {
    type: Boolean,
    default: false
  },
  wallet: {
    type: Boolean,
    default: false
  },

  deliveryBoy: {
    type: Boolean,
    default: false
  },
  collectionBoy: {
    type: Boolean,
    default: false
  },
  return: {
    type: Boolean,
    default: false
  },
  orderSheet: {
    type: Boolean,
    default: false
  },
  logs: {
    type: Boolean,
    default: false
  },


});

module.exports = mongoose.model("User", userSchema);
