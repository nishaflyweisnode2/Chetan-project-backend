const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
        user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
        },
        order: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order"
        }],
        id: {
                type: String
        },
        date: {
                type: Date,
                default: Date.now,
        },
        pendingAmount: {
                type: Number,
        },
        advancedAmount: {
                type: Number,
        },
        orderAmount: {
                type: Number,
        },
        paidAmount: {
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

const transaction = mongoose.model("orderTransaction", transactionSchema);
module.exports = transaction;
