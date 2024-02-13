const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const productSchema = mongoose.Schema({
        price: {
                type: Number,
        },
        getPrice: {
                type: Number
        },
        getPercentage: {
                type: Number
        },
        user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
        },
        isActive: {
                type: Boolean,
                default: true
        },
}, { timestamps: true });
productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("rechargeOffer", productSchema);
