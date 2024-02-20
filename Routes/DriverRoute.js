const express = require('express');
const driver_Controllers = require('../Controller/DriverCtrl')
const router = express();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "images/image", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
router.post('/api/v1/driver/create', driver_Controllers.createDriver);
router.post('/api/v1/driver/sendotp', driver_Controllers.sendOtp);
router.post('/api/v1/driver/reSendOtp/:id', driver_Controllers.reSendOtp);
router.post('/api/v1/driver/verify/:id', driver_Controllers.accountVerificationOTP);
router.get('/api/v1/driver/get/:id', driver_Controllers.getProfile);
router.get('/api/v1/driver/getUser/:id', driver_Controllers.getUserbyId);
router.put('/api/v1/driver/update/:id', upload.single('profile'), driver_Controllers.AddDeriverDetails);
// router.post('/api/v1/driver/addOrder', driver_Controllers.AssignOrdertoDriver);
// router.put('/api/v1/driver/accept/:id', driver_Controllers.DriverAccept);
// router.put('/api/v1/driver/reject/:id', driver_Controllers.DriverReject);
router.get('/api/v1/driver/alldriver', driver_Controllers.AllDrivers);
router.get('/api/v1/driver/allorders', driver_Controllers.DriverAllOrder);
router.get('/api/v1/driver/allorders/:id', driver_Controllers.DriverSingleOrder);
router.put('/api/v1/driver/reasonOfReduceQuantity/:id', driver_Controllers.reasonOfReduceQuantity);
// router.delete('/api/v1/driver/delete/order/:id', driver_Controllers.DeleteAssignOrder);
router.get('/api/v1/driver/price/:driverId', driver_Controllers.GetPriceByDriverId);
router.put('/api/v1/driver/complete/:id', driver_Controllers.DeliveredOrder);
router.post('/api/v1/driver/logout', driver_Controllers.logout);
router.get('/api/v1/driver/pickUpBottleOrder/:driverId', driver_Controllers.pickUpBottleOrder)
router.get('/api/v1/driver/driverCanceledOrder/:driverId', driver_Controllers.driverCanceledOrder)
router.get('/api/v1/driver/delivered/:driverId', driver_Controllers.driverCompleted)
router.get('/api/v1/driver/pending/order/:id', driver_Controllers.PendingOrder)
router.get('/api/v1/driver/todayOrder/order/:id', driver_Controllers.getTodayOrder)
// router.get('/api/v1/driver/accept/order/:id', driver_Controllers.AcceptOrder)
router.delete('/api/v1/driver/:id', driver_Controllers.DeleteDriver);
router.put('/api/v1/driver/status/:id', driver_Controllers.ChangeStatus)
router.put('/api/v1/driver/ChangePickUpBottleStatus/:id', driver_Controllers.ChangePickUpBottleStatus)
router.put('/api/v1/driver/submitPickUpBottle/:id', driver_Controllers.submitPickUpBottle)
router.post('/api/v1/driver/addEnquiry/:id', driver_Controllers.addEnquiry)
router.get('/api/v1/driver/getAllTodayEnquiry/:id', driver_Controllers.getAllTodayEnquiry)
router.post('/api/v1/driver/assignUserToDriver', driver_Controllers.assignUserToDriver);
router.post('/api/v1/driver/unAssignUserToDriver', driver_Controllers.unAssignUserToDriver);
router.get('/api/v1/driver/allAssignUserToDriver/:driverId', driver_Controllers.allAssignUserToDriver)
router.post("/api/v1/address/", driver_Controllers.createAddress);
router.get("/api/v1/address/:driverId", driver_Controllers.getAddress);
router.put("/api/v1/address/:id", driver_Controllers.updateAddress);
router.delete("/api/v1/address/:id", driver_Controllers.deleteAddress);
router.post("/api/v1/driver/updateBankDetails/:id", driver_Controllers.updateBankDetails);
router.get("/api/v1/driver/get/BankDetails/:userId", driver_Controllers.getBankDetails);
router.put("/api/v1/driver/updateDocument/:id", upload.single('drivingLicense'), driver_Controllers.updateDocument);
router.post("/api/v1/driver/attendanceMark/:id", driver_Controllers.attendanceMark);
router.get("/api/v1/driver/driverAttendanceList/:id", driver_Controllers.driverAttendanceList);
router.post("/api/v1/driver/startDelivery/:id", driver_Controllers.startDelivery);
router.post("/api/v1/driver/endDelivery/:id", driver_Controllers.endDelivery);
module.exports = router;