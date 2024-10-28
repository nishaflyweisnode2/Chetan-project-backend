const express = require('express');
const bannerControllers = require('../Controller/bottomController');
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: "dbcnha741", api_key: "865815848694583", api_secret: "j90xHfvjplpGsIlQxLw0De0SiwU", });
const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
                folder: "images/image",
                allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "webp", "WEBP"],
        },
});
const upload = multer({ storage: storage });
const router = express();
router.post('/api/v1/bottom/:name', upload.single('image'), [bannerControllers.AddBanner]);
router.route("/api/v1/bottom/get").get(bannerControllers.getbottom);
router.put("/api/v1/bottom/update/:id", upload.single('image'), bannerControllers.updatebottom);
router.delete('/api/v1/bottom/delete/:id', bannerControllers.DeleteBanner);
router.route("/api/v1/bottom/get/:type").get(bannerControllers.getbottombyType);



module.exports = router;