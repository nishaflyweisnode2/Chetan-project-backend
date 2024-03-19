const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
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
    daysWiseQuantity: [{
      days: {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
      },
      quantity: {
        type: Number
      },
    }],
    days: [{
      type: String,
      enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
    }],
    alternateDay: {
      type: Number,
    },
    type: {
      type: String,
      enum: ['EveryDay', 'Alternate', 'customized'],
    },
  }]
});

const Subscription = mongoose.model('subscriptionCart', subscriptionSchema);

module.exports = Subscription;
