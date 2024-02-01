const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");
const router = require("express").Router();
const couponController = require("../Controller/couponCtrl");

router.post("/api/v1/coupon/", couponController.createCoupon);
router.get("/api/v1/coupon/all", couponController.getAllCoupons);
router.get("/api/v1/coupon/", couponController.getActiveCoupons);
router.delete("/api/v1/coupon/:couponId", couponController.deleteCoupon);
router.put("/api/v1/coupon/update/:id", couponController.updateCoupon);

module.exports = router;
