const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const addressSchema = new mongoose.Schema({
  address1: {
    type: String,
    required: [true, "address required"],
  },
  address2: {
    type: String,
    required: [true, "address required"],
  },
  city: {
    type: String,
    required: [true, "City is must"],
  },
  country: {
    type: String,
    required: [true, "City is must"],
  },
  
  state: {
    type: String,
    required: [true, "State Must"],
  },
  pinCode: {
    type: Number,
   
  },
  landMark: {
    type: String,
  },
  street: {
    type: String,
  
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Address", addressSchema);
