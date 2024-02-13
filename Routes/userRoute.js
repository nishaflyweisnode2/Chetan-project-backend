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
router.route("/api/v1/user/google/login").post(userCtrl.socialLogin);
router.post("/api/v1/user/create", userCtrl.registerUser);
router.put("/api/v1/user/email/:id", userCtrl.registerEmailUser);
router.put("/api/v1/user/mobile/:id", userCtrl.UpdatePhoneUser);
router.post("/api/v1/user/login", userCtrl.loginUser);
router.delete("/api/v1/user/delete/my/account", isAuthenticatedUser, userCtrl.deletemyAccount);
router.post("/api/v1/user/verify-otp/:id", userCtrl.verifyOTP);
router.route("/api/v1/user/update/:userId").put(upload.single('profilePicture'), userCtrl.userPhoto)
router.get("/api/v1/user/all", userCtrl.getAllUser);
router.get("/api/v1/user/:id", userCtrl.getUserbyId);
router.post("/api/v1/user/createVacation", isAuthenticatedUser, userCtrl.createVacation);
router.get("/api/v1/user/getAll/Vacation", isAuthenticatedUser, userCtrl.getAllVacation);
router.get("/api/v1/user/getVacationById/:id", userCtrl.getVacationById);
router.put("/api/v1/user/updateLocationofUser/:id", userCtrl.updateLocationofUser)

module.exports = router;