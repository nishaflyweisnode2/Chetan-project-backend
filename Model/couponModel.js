const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: [true, "Please Enter the coupon Code !"],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: [true, "Please Enter Product Category"],
  },
  expirationDate: {
    type: Date,
    required: [true, "Enter expiry Date"],
  },
  activationDate: {
    type: Date,
    required: [true, "Please Enter joining Date"],
  },
  discount: {
    type: Number,
    required: [true, "Please Enter Discount Percentage"],
  },
  minOrder: {
    type: Number,
    required: [true, "Please Enter minimum order value"],
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
