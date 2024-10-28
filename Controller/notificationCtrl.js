const notify = require('../Model/notificationModel');
const imagePattern = "[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: "djgrqoefp", api_key: "274167243253962", api_secret: "3mkqkDDusI5Hf4flGNkJNz4PHYg", });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images/image",
    allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
  },
});
const upload = multer({ storage: storage });
exports.AddNotification = async (req, res) => {
  try {
    let fileUrl;
    if (req.file) {
      fileUrl = req.file ? req.file.path : "";
    }
    let data;
    if (req.body.type == 'driver') {
      data = {
        message: req.body.message,
        image: fileUrl,
        driverId: req.body.userId,
        for: "Driver",
      };
    }
    if (req.body.type == 'collectionBoy') {
      data = {
        message: req.body.message,
        image: fileUrl,
        collectionBoyId: req.body.userId,
        for: "CollectionBoy",
      };
    }
    if (req.body.type == 'user') {
      data = {
        message: req.body.message,
        image: fileUrl,
        user: req.body.userId,
        for: "user",
      };
    }
    const Data = await notify.create(data);
    return res.status(200).json({ message: Data, });
  } catch (err) {
    res.status(400).json({ message: err.message, });
  }
};
exports.GetAllNotification = async (req, res) => {
  try {
    const data = await notify.find().populate("driverId user collectionBoyId");
    res.status(200).json({
      message: data,
      total: data.length
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}
exports.GetBYNotifyID = async (req, res) => {
  try {
    const data = await notify.findById({ _id: req.params.id })
    res.status(200).json({
      message: data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}
exports.deleteNotification = async (req, res) => {
  try {
    await notify.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json({
      message: "Notification Deleted "
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

