const imagePattern = "[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: 'djgrqoefp', api_key: '274167243253962', api_secret: '3mkqkDDusI5Hf4flGNkJNz4PHYg' });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "images/image", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
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
router.post("/api/v1/user/resendOTP/:id", userCtrl.resendOTP);
router.post("/api/v1/user/login", userCtrl.loginUser);
router.delete("/api/v1/user/delete/my/account", isAuthenticatedUser, userCtrl.deletemyAccount);
router.post("/api/v1/user/verify-otp/:id", userCtrl.verifyOTP);
router.route("/api/v1/user/update/:userId").put(upload.single('profilePicture'), userCtrl.userPhoto)
router.get("/api/v1/user/all", userCtrl.getAllUser);
router.get("/api/v1/user/:id", userCtrl.getUserbyId);
router.post("/api/v1/user/createVacation", isAuthenticatedUser, userCtrl.createVacation);
router.get("/api/v1/user/getAll/Vacation", isAuthenticatedUser, userCtrl.getAllVacation);
router.get("/api/v1/user/getVacationById/:id", userCtrl.getVacationById);
router.delete("/api/v1/user/deleteVacation/:id", userCtrl.deleteVacation);
router.put("/api/v1/user/updateLocationofUser/:id", userCtrl.updateLocationofUser)
router.post("/api/v1/user/createRechargeTransaction", isAuthenticatedUser, userCtrl.createRechargeTransaction);
router.get("/api/v1/user/getAll/getAllRechargeTransaction", isAuthenticatedUser, userCtrl.getAllRechargeTransaction);
router.get("/api/v1/user/getRechargeTransactionById/:id", userCtrl.getRechargeTransactionById);
router.get("/api/v1/user/getAllRechargeTransactionByuserId/:userId", userCtrl.getAllRechargeTransactionByuserId);
router.put("/api/v1/user/updateRechargeTransaction/:id", userCtrl.updateRechargeTransaction);
router.get("/api/v1/user/getAll/getAllWalletTransaction", isAuthenticatedUser, userCtrl.getAllWalletTransaction);
router.get("/api/v1/user/getWalletTransactionById/:id", userCtrl.getWalletTransactionById);
router.get("/api/v1/user/getAllWalletTransactionByUserId/:userId", userCtrl.getAllWalletTransactionByUserId);

module.exports = router;