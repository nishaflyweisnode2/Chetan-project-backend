const mongoose = require("mongoose");

const cartProductsSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
  
    quantity: {
        type: Number,
        default: 1
    },
    size: {
        type: Number,
        default: 0 
    },
        customizes: 
            {
              // user: {
              //   type: mongoose.Schema.ObjectId,
              //   ref: "User",
              //   required: false,
              // },
              shortMessage: {
                type:String,
                required: [false, "Please Add Short Message"],
                maxLength: [50, "Message cannot exceed 50 characters"],
              },
              longMessage: {
                type:String,
                required: [false, "Please Add Long Message"],
                maxLength: [100, "Message cannot exceed 100 characters"],
              },
              welcomeGift: {
                type: Number,
                required: false,
                default: 0,
              },
            },
          
        
      
}, {_id: false})

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: {
        type: [cartProductsSchema]
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default:null,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Cart", CartSchema)