const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    image: {
      type: String
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);