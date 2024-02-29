const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const addressSchema = new mongoose.Schema({
        description: {
                type: String,
        },
        title: {
                type: String,
        },
        user: {
                type: ObjectId,
                ref: "User",
        },
        driver: {
                type: ObjectId,
                ref: "driver",
        },
});

module.exports = mongoose.model("logs", addressSchema);
