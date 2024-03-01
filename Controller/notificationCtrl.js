const notify = require('../Model/notificationModel');
const imagePattern = "[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: 'dtijhcmaa',
  api_key: '624644714628939',
  api_secret: 'tU52wM1-XoaFD2NrHbPrkiVKZvY'
});
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
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ msg: err.message });
      }
      const fileUrl = req.file ? req.file.path : "";
      let data;
      if (req.body.type == 'driver') {
        data = {
          message: req.body.message,
          image: fileUrl,
          driverId: req.body.userId,
        };
      }
      if (req.body.type == 'collectionBoy') {
        data = {
          message: req.body.message,
          image: fileUrl,
          collectionBoyId: req.body.userId,
        };
      }
      if (req.body.type == 'user') {
        data = {
          message: req.body.message,
          image: fileUrl,
          user: req.body.userId,
        };
      }
      const Data = await notify.create(data);
      return res.status(200).json({ message: Data, });
    });
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

