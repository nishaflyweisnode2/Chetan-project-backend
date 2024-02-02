const mongoose = require("mongoose");
const bankDetailSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "driver",
    },
    bankName: {
        type: String,
    },
    accountNumber: {
        type: String,
    },
    holderName: {
        type: String,
    },
    ifsc: {
        type: String,
    },
    upiId: {
        type: String,
    },
    drivingLicense: {
        type: String,
    },
})

module.exports = mongoose.model("bankDetails", bankDetailSchema);