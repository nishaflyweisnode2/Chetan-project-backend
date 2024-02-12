const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactUsSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,

        },
        email: {
            type: String,

        },
        whatApp: {
            type: String,

        },
        imageUrl: {
            type: [String],

        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactUs", contactUsSchema);