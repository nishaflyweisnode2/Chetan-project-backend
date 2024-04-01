const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const addressSchema = new mongoose.Schema({
        description: {
                type: String,
        },
        title: {
                type: String,
        },
        order: {
                type: ObjectId,
                ref: "Order",
        },
        Subscription: {
                type: ObjectId,
                ref: "Subscription",
        },
        user: {
                type: ObjectId,
                ref: "User",
        },
        driver: {
                type: ObjectId,
                ref: "driver",
        },
}, { timestamps: true });

module.exports = mongoose.model("logs", addressSchema);
