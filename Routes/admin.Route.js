const admin = require("../Controller/adminCtrl");
const router = require("express").Router();
router.post("/api/v1/admin/registerAdmin", admin.RegisterAdmin);
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
module.exports = router;