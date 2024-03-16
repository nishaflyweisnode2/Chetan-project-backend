const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  reasonOfReduce: {
    type: String,
  },
  quantity: {
    type: Number
  },
}, {
  timestamps: true
});
orderSchema.plugin(mongoosePaginate);
orderSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("notDelivered", orderSchema);
