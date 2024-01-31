const imagePattern = "[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images/image",
    allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
  },
});
const upload = multer({ storage: storage });


const userCtrl = require("../Controller/userCtrl");
const router = require("express").Router();
// const imagePattern = "[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$";
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("cloudinary").v2;
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "images/image",
//     allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
//   },
// });
// const upload = multer({ storage: storage });
const { isAuthenticatedUser } = require("../Middleware/auth");
router.route("/google/login").post(userCtrl.socialLogin);
router.post("/api/v1/user/create", userCtrl.registerUser);
router.put("/email/:id", userCtrl.registerEmailUser);
router.put("/mobile/:id", userCtrl.UpdatePhoneUser);
router.post("/login", userCtrl.loginUser);
router.delete("/delete/my/account", isAuthenticatedUser, userCtrl.deletemyAccount);
router.post("/verify-otp/:id", userCtrl.verifyOTP);
router.route("/update/:userId").put(upload.single('profilePicture'), userCtrl.userPhoto)
router.get("/all", userCtrl.getAllUser);
router.get("/:id", userCtrl.getUserbyId);
module.exports = router;