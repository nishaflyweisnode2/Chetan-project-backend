const admin = require("../Controller/adminCtrl");
const router = require("express").Router();
router.post("/api/v1/admin/registerAdmin", admin.RegisterAdmin);

router.post("/api/v1/admin/addStaff", admin.addStaff);
router.get("/api/v1/admin/getAllStaff", admin.getAllStaff);
router.get("/api/v1/admin/dashboard", admin.dashboard);


router.post("/api/v1/admin/signin", admin.signin);
router.get("/api/v1/admin/user", admin.getAllUser);
router.get("/api/v1/admin/:id", admin.getUserbyId);
router.delete("/api/v1/admin/:id", admin.deleteUser);
router.put("/api/v1/admin/cancel/:orderId", admin.cancelOrder);
router.get("/api/v1/admin/getAllEnquiry", admin.getAllEnquiry);
router.get("/api/v1/admin/getEnquiryById/:id", admin.getEnquiryById);
router.put("/api/v1/admin/closeEnquiry/:id", admin.closeEnquiry);
router.delete("/api/v1/admin/deleteEnquiry/:id", admin.deleteEnquiry);
router.post('/api/v1/CutOffTime/add', admin.AddCutOffTime);
router.get('/api/v1/CutOffTime/all', admin.getCutOffTime);
router.get('/api/v1/CutOffTime/get/:id', admin.getCutOffTimeById);
router.delete('/api/v1/CutOffTime/delete/:id', admin.DeleteCutOffTime);
router.get('/api/v1/CutOffTime/getCutOffTimeForApp', admin.getCutOffTimeForApp);
router.post('/api/v1/RechargeOffer/add', admin.AddRechargeOffer);
router.get('/api/v1/RechargeOffer/all', admin.getRechargeOffer);
router.get('/api/v1/RechargeOffer/get/:id', admin.getRechargeOfferById);
router.delete('/api/v1/RechargeOffer/delete/:id', admin.DeleteRechargeOffer);
router.get('/api/v1/RechargeOffer/getRechargeOfferByUserId/:user', admin.getRechargeOfferByUserId);

router.post('/api/v1/assignPermissionUserbyId/:id', admin.assignPermissionUserbyId);
router.post('/api/v1/acceptRejectAddress/:id', admin.acceptRejectAddress);
router.get('/api/v1/getAllLogs', admin.getAllLogs);

router.get('/api/v1/getAllNotDelivered', admin.getAllNotDelivered);


router.get('/api/v1/userOrders/get/:userId', admin.userOrders);
router.get('/api/v1/userSubscriptionOrders/get/:userId', admin.userSubscriptionOrders);
router.put('/api/v1/updateUserProfile/put/:userId', admin.updateUserProfile);
router.put('/api/v1/activeBlockUser/:userId', admin.activeBlockUser);
router.put('/api/v1/changeUserStatus/:id', admin.changeUserStatus);
router.put('/api/v1/prePostPaidUser/:userId', admin.prePostPaidUser);
router.put("/api/v1/admin/updateSubscription/:subscriptionId", admin.updateSubscription);
router.delete("/api/v1/admin/deleteSubscription/:subscriptionId", admin.deleteSubscription);

module.exports = router;