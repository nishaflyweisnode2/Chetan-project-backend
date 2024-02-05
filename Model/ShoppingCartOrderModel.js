const mongoose = require("mongoose");
const orderProductSchema = new mongoose.Schema({
  unitPrice: {
    type: Number
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: {
    type: Number
  },
  total: {
    type: Number
  },
  ringTheBell: {
    type: Boolean,
  },
  instruction: {
    type: String,
  },
  days: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
  },
  type: {
    type: String,
    enum: ['EveryDay', 'Alternate', 'customized'],
  },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  collectionBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  address: {
    type: mongoose.Schema.ObjectId,
    ref: "Address",
  },
  aaddress: {
    street1: {
      type: String,
    },
    street2: {
      type: String
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String
    },
    cardName: {
      type: String
    },
    cardNumber: {
      type: String
    },
    carExpiry: {
      type: String
    },
    cvv: {
      type: String
    },
  },
  status: {
    type: String,
    enum: ["signed", "processed", "shipped", "Out For Delivery", "delivered", "canceled"],
    default: "processed"
  },
  products: {
    type: [orderProductSchema]
  },
  paymentGatewayOrderId: {
    type: String,
    select: false
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  collectedStatus: {
    type: String,
    enum: ["pending", "Collected", "Online"],
    default: "pending"
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  amountToBePaid: {
    type: Number,
    required: true,
    default: 0,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon"
  },
  orderStatus: {
    type: String,
    enum: ["signed", "processed", "shipped", "out_for_delivery", "delivered"],
    default: "processed",
    select: false
  },
  delivered: {
    type: Boolean,
    default: false
  },
  orderType: {
    type: String,
    enum: ['Subscription', 'once'],
    default: 'once'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
