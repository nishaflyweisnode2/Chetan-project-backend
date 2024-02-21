const mongoose = require("mongoose");
// const orderProductSchema = new mongoose.Schema({
//   unitPrice: {
//     type: Number
//   },
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product"
//   },
//   quantity: {
//     type: Number
//   },
//   total: {
//     type: Number
//   },
//   ringTheBell: {
//     type: Boolean,
//   },
//   instruction: {
//     type: String,
//   },
//   days: {
//     type: String,
//     enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
//   },
//   type: {
//     type: String,
//     enum: ['EveryDay', 'Alternate', 'customized'],
//   },
// }, { _id: false })

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
  status: {
    type: String,
    enum: ["signed", "processed", "shipped", "Out For Delivery", "delivered", "canceled"],
    default: "processed"
  },
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
  startDate: {
    type: Date,
    required: true,
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
  paymentGatewayOrderId: {
    type: String,
    select: false
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "online"],
    default: "Cash"
  },
  collectedDate: {
    type: Date,
  },
  featuredDate: {
    type: Date,
  },
  reasonOfReduce: {
    type: String,
  },
  pickUpBottleQuantity: {
    type: Number
  },
  commentOnPickUpBottle: {
    type: String,
  },
  isPickUpBottle: {
    type: Boolean,
    default: false
  },
  productType: {
    type: String,
    enum: ["Bottle", "other"]
  },
  collectedStatus: {
    type: String,
    enum: ["pending", "Collected", "featured"],
    default: "pending"
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
    enum: ["pending", "Deliverd"],
    default: "pending",
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
  cutOffOrderType: {
    type: String,
    enum: ["eveningOrder", "morningOrder"]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
