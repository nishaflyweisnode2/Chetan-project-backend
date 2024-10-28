const Banner = require('../Model/bottomModel')
require('dotenv').config();

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
exports.AddBanner = async (req, res) => {
  console.log("bot");
  try {
    let findBanner = await Banner.findOne({ name: req.params.name, type: req.body.type });
    console.log(req.params.name)
    if (findBanner) {
      res.status(409).json({ message: "Banner already exit.", status: 404, data: {} });
    } else {
      let fileUrl;
      if (req.file) {
        fileUrl = req.file ? req.file.path : "";
      }
      const data = { name: req.params.name, image: fileUrl, type: req.body.type };
      const banner = await Banner.create(data);
      res.status(200).json({ message: "Banner add successfully.", status: 200, data: banner });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
  }
};

exports.getbottom = async (req, res) => {

  try {
    // Fetch all brands from the database
    const banners = await Banner.find();

    res.json({ banners });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getbottombyType = async (req, res) => {

  try {
    const { type } = req.params;

    // Find banners based on the provided type
    const banners = await Banner.find({ type });

    res.status(200).json({ banners });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatebottom = async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);
  if (!banner) {
    res.status(404).json({ message: "Banner Not Found", status: 404, data: {} });
  }
  let fileUrl;
  if (req.file) {
    fileUrl = req.file ? req.file.path : "";
  } else {
    fileUrl = banner.image
  }
  banner.image = fileUrl || banner.image;
  banner.name = req.body.name;
  let update = await banner.save();
  res.status(200).json({ message: "Updated Successfully", data: update });
};

exports.DeleteBanner = async (req, res) => {
  try {
    const Banners = await Banner.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json({
      message: "Delete Banner ",
    },)
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}