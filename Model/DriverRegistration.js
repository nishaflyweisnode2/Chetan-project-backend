const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const Driver = mongoose.Schema({
    driverId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "driver",
    }],
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    },
    cutOffTimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cutOffTime",
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
    completeProfile: {
        type: Boolean,
        require: false
    },
    status: {
        type: String,
        enum: ["Active", "Block"],
        default: "Active"
    },
    area: {
        type: Array,
    },
    role: {
        type: String,
        enum: ["driver", "collectionBoy"],
        default: "driver",
    }
})

Driver.plugin(mongoosePaginate);
Driver.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('driver', Driver);
