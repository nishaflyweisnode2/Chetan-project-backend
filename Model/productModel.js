const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter product Description"],
  },
  price: {
    type: Number,
  },
  size: {
    type: Number
  },
  sizeInWord: {
    type: String
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [{
    img: {
      type: String,
      default: ""
    }
  }],
  type: {
    type: String,
    enum: ["Bottle", "other"]
  },
  productType: {
    type: String,
    enum: ["Buy", "Subscribe", "Both"]
  },
  multipleSize: [{
    size: {
      type: String
    },
    price: {
      type: Number,
    },
  }],
  isMultiple: {
    type: Boolean,
    default: false
  },
  includeGst: {
    type: Number,
  },
  colors: {
    type: String
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: [true, "Please Enter Product Category"],
  },
  subCategory: {
    type: mongoose.Schema.ObjectId,
    ref: "SubCategory",
  },
  Stock: {
    type: Number,
    required: [true, "Please Enter product Stock"],
    maxLength: ["Stock cannot exceed 4 characters"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  deliveryPinCodes: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("Product", productSchema);
