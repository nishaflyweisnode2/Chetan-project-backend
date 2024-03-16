const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
        user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
        },
        id: {
                type: String
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
        Status: {
                type: String,
        },
}, { timestamps: true });

const transaction = mongoose.model("rechargeTransaction", transactionSchema);
module.exports = transaction;
