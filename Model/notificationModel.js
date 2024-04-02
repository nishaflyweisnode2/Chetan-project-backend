const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  collectionBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },
  message: {
    type: String,
    required: true,
  },
  for: {
    type: String,
    enum: ["user", "Driver", "CollectionBoy"],
  },
  image: {
    type: String
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);