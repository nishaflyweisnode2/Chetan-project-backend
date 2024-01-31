const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aboutUsSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
           
        },
        imageUrl: {
            type: [String],
           
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AboutUs", aboutUsSchema);