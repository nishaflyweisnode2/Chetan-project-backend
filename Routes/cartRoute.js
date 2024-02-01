const { addToCart, getCart, getCartbyUser, updateQuantity, getAllCarts, applyCoupon, deletProduct, deleteCart, getAllCart, decreaseQty } = require("../Controller/cartCtrl");
const { isAuthenticatedUser } = require("../Middleware/auth");

const router = require("express").Router();

router.post("/api/v1/cart/:id", isAuthenticatedUser, addToCart);
router.put("/api/v1/cart/:id", isAuthenticatedUser, updateQuantity);
router.get("/api/v1/cart/", isAuthenticatedUser, getCart);
router.get("/api/v1/cart/user/:userId", getCartbyUser);
router.put("/api/v1/cart/coupon/:id", applyCoupon);
router.put("/api/v1/cart/decrease/:productId", isAuthenticatedUser, decreaseQty);
router.delete("/api/v1/cart/delete/cart", isAuthenticatedUser, deleteCart);
router.delete("/api/v1/cart/delete/:productId", isAuthenticatedUser, deletProduct);
router.get("/api/v1/cart/all", getAllCarts);


module.exports = router;