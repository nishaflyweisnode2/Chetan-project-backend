const mongoose = require('mongoose');
const discountSchema = new mongoose.Schema({
        time: {
                type: String,
        },
        type: {
                type: String,
                enum: ["eveningOrder", "morningOrder"]
        }
});
const Discount = mongoose.model('cutOffTime', discountSchema);
module.exports = Discount