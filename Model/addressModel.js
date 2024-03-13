const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const addressSchema = new mongoose.Schema({
  address1: {
    type: String,
  },
  address2: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  houseNumber: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  pinCode: {
    type: Number,
  },
  landMark: {
    type: String,
  },
  addressType: {
    type: String,
    enum: ["Change", "My"],
    default: "My"
  },
  type: {
    type: String,
    enum: ["Home", "office"]
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
  driver: {
    type: ObjectId,
    ref: "driver",
  },
});

module.exports = mongoose.model("Address", addressSchema);
