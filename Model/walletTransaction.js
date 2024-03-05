const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
        user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
        },
        order: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order"
        },
        subscription: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subscription"
        },
        date: {
                type: Date,
                default: Date.now,
        },
        amount: {
                type: Number,
        },
        month: {
                type: String,
        },
        paymentMode: {
                type: String,
        },
        type: {
                type: String,
        },
        Status: {
                type: String,
        },
}, { timestamps: true });

const transaction = mongoose.model("rechargeTransaction", transactionSchema);
module.exports = transaction;
