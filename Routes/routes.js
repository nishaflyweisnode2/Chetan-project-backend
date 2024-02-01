const router = require("express").Router();

router.use("/", require("./userRoute"));
router.use("/", require("./admin.Route"));
router.use("/", require("./productRoute"));
router.use("/", require("./categoryRoute"));
router.use("/", require("./cartRoute"));
router.use("/", require("./order"));
router.use("/", require("./helpandSupportRoute"));
router.use("/", require("./bannerRoute"));
router.use("/", require("./termRoute"));
router.use("/", require("./policyRoute"));
// router.use("/api/v1/verdor", require("./VendorRoute"));
router.use("/", require("./DriverRoute"));
router.use("/", require("./CollectionBoyRoute"));
router.use("/", require("./notificationRoute"));
router.use("/", require("./couponRoute"));
router.use("/", require("./aboutusRoute"));
router.use("/", require("./contactUsRoute"));
router.use("/", require("./faqRoute"));
router.use("/", require("./myWalletRoute"));
router.use("/", require("./myScheduleRoute"));
router.use("/", require("./addressRoute"));
router.use("/", require("./bottomRoute"));

module.exports = router;