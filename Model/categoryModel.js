const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name Category Required"],
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("Category", categorySchema);
