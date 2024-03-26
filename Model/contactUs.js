const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const contactUsSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    phone: {
        type: String,
    },
    whatAppTitle: {
        type: String,
        required: true,
    },
    whatAppContent: {
        type: String,
    },
    whatApp: {
        type: String,
    },
    emailTitle: {
        type: String,
        required: true,
    },
    emailContent: {
        type: String,
    },
    email: {
        type: String,
    },
    addressTitle: {
        type: String,
        required: true,
    },
    addressContent: {
        type: String,
    },
    address: {
        type: String,
    },
    imageUrl: {
        type: [String],
    },
}, { timestamps: true });
module.exports = mongoose.model("ContactUs", contactUsSchema);