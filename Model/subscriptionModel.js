const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  size: {
    type: String
  },
  price: {
    type: Number
  },
  quantity: {
    type: Number
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  pauseDate: {
    type: Date,
  },
  resumeDate: {
    type: Date,
  },
  ringTheBell: {
    type: Boolean,
  },
  instruction: {
    type: String,
  },
  orderCreateTill: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pause', 'start'],
  },
  daysWiseQuantity: [{
    days: {
      type: String,
      enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
    },
    quantity: {
      type: Number
    },
  }],
  days: [{
    type: String,
    enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
  }],
  alternateDay: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['EveryDay', 'Alternate', 'customized'],
  },
  cutOffOrderType: {
    type: String,
    enum: ["eveningOrder", "morningOrder"]
  },
  firstTimeOrder: {
    type: Boolean,
    default: false,
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
