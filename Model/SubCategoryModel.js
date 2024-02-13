const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema({
  parentCategory: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  subCategory: {
    type: String,
    required: [true, "Parent Category Required"],
  },
  image: {
    type: String
  },
});

module.exports = mongoose.model("SubCategory", subCategorySchema);