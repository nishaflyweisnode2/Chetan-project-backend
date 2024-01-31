const router = require("express").Router();

const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");
const { placeOrderCOD, getOrders,insertNewProduct,deleteproductinOrder,addproductinOrder, mySubscription,subscription,getSingleOrder,getAllSubscription,getUnconfirmedOrders, GetAllReturnOrderbyUserId, GetReturnByOrderId, orderReturn, updateOrder, getAllOrders, checkout, placeOrder, myOrders } = require("../Controller/Order");

router.post("/checkout", isAuthenticatedUser, checkout);
router.post("/place-order", isAuthenticatedUser, placeOrder);
router.post('/place-order/cod', isAuthenticatedUser, placeOrderCOD)
router.get("/Allorders", isAuthenticatedUser, getOrders)
router.get("/subscription/all", getAllSubscription)
router.post('/insert-product/:orderId/:productId', insertNewProduct)

// router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.get("/:id", getSingleOrder);

//Return Router 
router.post('/return/:id', orderReturn);
router.get('/return/:userId', GetAllReturnOrderbyUserId)
router.get('/return/orderId/:id', GetReturnByOrderId);
router.get("/", isAuthenticatedUser, myOrders);


router.put("/admin/:id", updateOrder)
//   .delete(  deleteOrder);
router.get("/admin/orders", getAllOrders);
router.get("/all/user/orders", getUnconfirmedOrders);

router.get("/", isAuthenticatedUser, myOrders);
router.post("/subscribe/:orderId",isAuthenticatedUser,subscription);
router.get("/my/subscribe",isAuthenticatedUser,mySubscription);

router.put("/add/product/order/:orderId",addproductinOrder);

router.delete("/delete/product/order/:orderId",deleteproductinOrder);

module.exports = router;



