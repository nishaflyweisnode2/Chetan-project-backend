const mongoose = require('mongoose');
const DriverOrders = mongoose.Schema({
        driverId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "driver",
        },
        name: {
                type: String
        },
        mobile: {
                type: String
        },
        address: {
                type: String
        },
        startDate: {
                type: Date
        },
        products: [{
                productName: {
                        type: String
                },
                quantity: {
                        type: Number
                },
        }],
        status: {
                type: String,
                enum: ['pending', 'close'],
                default: 'pending'
        },
})
const enquiryOrder = mongoose.model('enquiry', DriverOrders);
module.exports = enquiryOrder