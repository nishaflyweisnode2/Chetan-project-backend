const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const userSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  collectionBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  cutOffTimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cutOffTime",
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  changeAddressId: {
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
    enum: ["Admin", "User", "Staff",],
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
    enum: ["pending", "Upload", "approved", "rejected"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["Active", "Block"],
    default: "Active"
  },
  driverAssign: {
    type: Boolean,
    default: false
  },
  userStatus: {
    type: String,
    enum: ["Approved", "UnApproved", "Pending"],
    default: "Pending"
  },
  paymentMode: {
    type: String,
    enum: ["PostPaid", "PrePaid"],
    default: "PrePaid"
  },
  balance: {
    type: Number,
    default: 0,
  },
  advancedAmount: {
    type: Number,
    default: 0,
  },
  pendingAmount: {
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
userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("User", userSchema);
