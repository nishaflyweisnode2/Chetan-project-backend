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
        type: String,
    },
    customizes: {
        shortMessage: {
            type: String,
            required: [false, "Please Add Short Message"],
            maxLength: [50, "Message cannot exceed 50 characters"],
        },
        longMessage: {
            type: String,
            required: [false, "Please Add Long Message"],
            maxLength: [100, "Message cannot exceed 100 characters"],
        },
        welcomeGift: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    startDate: {
        type: Date,
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
    orderType: {
        type: String,
        enum: ['Subscription', 'once'],
        default: 'once'
    },
}, { _id: false })

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
        default: null,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Cart", CartSchema)