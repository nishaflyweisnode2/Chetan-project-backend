const mongoose = require("mongoose");

const bottomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name Banner Required"],
    },
    type: {
        type: String,
        enum: ['Top','bottom', 'middle'], // Add your allowed types here
      },
    image: {
        type: String
    },
    
});

module.exports = mongoose.model("Bottom", bottomSchema);