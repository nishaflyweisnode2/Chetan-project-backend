const { addToCart, getCart,getCartbyUser, updateQuantity,getAllCarts, applyCoupon,deletProduct ,deleteCart,getAllCart,decreaseQty} = require("../Controller/cartCtrl");
const { isAuthenticatedUser } = require("../Middleware/auth");

const router = require("express").Router();

router.post("/:id", isAuthenticatedUser, addToCart);
router.put("/:id", isAuthenticatedUser, updateQuantity);
router.get("/", isAuthenticatedUser, getCart);
router.get("/user/:userId",  getCartbyUser);


router.put("/coupon/:id", applyCoupon);
router.put("/decrease/:productId", isAuthenticatedUser,decreaseQty);
router.delete("/delete/cart", isAuthenticatedUser,deleteCart);


router.delete("/delete/:productId", isAuthenticatedUser,deletProduct);
router.get("/all",getAllCarts);


module.exports = router;