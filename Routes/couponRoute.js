const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");
const router = require("express").Router();
const couponController = require("../Controller/couponCtrl");

router.post(
  "/",
  
  couponController.createCoupon
);

router.get(
  "/all",
  couponController.getAllCoupons
);

router.get("/",  couponController.getActiveCoupons);

router.delete(
  "/:couponId",
  couponController.deleteCoupon
);
router.put(
  "/update/:id",
  couponController.updateCoupon
);

module.exports = router;
