const mongoose = require("mongoose");
const Driver = mongoose.Schema({
    collectionBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "driver",
    },
    name: {
        type: String,
        require: false
    },
    password: {
        type: String,
        require: false
    },
    phone: {
        type: String,
        require: false
    },
    email: {
        type: String,
        require: false
    },
    gender: {
        type: String,
        require: false
    },
    image: {
        type: String,
        require: false
    },
    otp: {
        type: String,
        require: true
    },
    status: {
        type: String,
        default: "disapprove"
    },
    role: {
        type: String,
        enum: ["driver", "collectionBoy"],
        default: "driver",
    }
})

const driver = mongoose.model('driver', Driver);

module.exports = driver;