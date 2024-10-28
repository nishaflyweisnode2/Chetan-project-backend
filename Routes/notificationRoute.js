const express = require('express');
const notify = require('../Controller/notificationCtrl')
const router = express();
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
router.post('/api/v1/notify/', upload.single('image'), notify.AddNotification);
router.get('/api/v1/notify/', notify.GetAllNotification);
router.get('/api/v1/notify/get/:id', notify.GetBYNotifyID);
router.delete('/api/v1/notify/delete/:id', notify.deleteNotification);



module.exports = router;