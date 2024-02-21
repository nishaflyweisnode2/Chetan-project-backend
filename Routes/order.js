const router = require("express").Router();
const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");
const { placeOrderCOD, getOrders, updateCollectedDate, payBills, mySubscriptionOrders,
        createSubscription, updateSubscription, pauseSubscription, deleteSubscription,
        insertNewProduct, deleteproductinOrder, addproductinOrder, mySubscription,
        subscription, getSingleOrder, getAllSubscription, getUnconfirmedOrders,
        GetAllReturnOrderbyUserId, GetReturnByOrderId, orderReturn, updateOrder,
        getAllOrders, checkout, placeOrder, myOrders, payBillStatusUpdate, returnBottleOrder } = require("../Controller/Order");

router.post("/api/v1/order/checkout", isAuthenticatedUser, checkout);
router.post("/api/v1/order/place-order", isAuthenticatedUser, placeOrder);
router.post('/place-order/cod', isAuthenticatedUser, placeOrderCOD)

router.post('/api/v1/order/updateCollectedDate', updateCollectedDate)

router.get("/api/v1/order/Allorders", isAuthenticatedUser, getOrders)
router.get("/api/v1/order/mySubscriptionOrders", isAuthenticatedUser, mySubscriptionOrders)
router.get("/api/v1/order/subscription/all", getAllSubscription)
router.post('/insert-product/:orderId/:productId', insertNewProduct)
// router.route("/api/v1/order/order/new").post(isAuthenticatedUser, newOrder);
router.get("/api/v1/order/:id", getSingleOrder);
//Return Router 
router.post('/return/:id', orderReturn);
router.get('/return/:userId', GetAllReturnOrderbyUserId)
router.get('/return/orderId/:id', GetReturnByOrderId);
router.get("/api/v1/order/", isAuthenticatedUser, myOrders);
router.put("/api/v1/order/admin/:id", updateOrder)
//   .delete(  deleteOrder);
router.get("/api/v1/order/admin/orders", getAllOrders);
router.get("/api/v1/order/all/user/orders", getUnconfirmedOrders);
router.get("/api/v1/order/", isAuthenticatedUser, myOrders);
router.post("/api/v1/order/subscribe/:orderId", isAuthenticatedUser, subscription);

router.post("/api/v1/order/createSubscription", isAuthenticatedUser, createSubscription);
router.put("/api/v1/order/pauseSubscription/:subscriptionId", isAuthenticatedUser, pauseSubscription);
router.put("/api/v1/order/updateSubscription/:subscriptionId", isAuthenticatedUser, updateSubscription);
router.delete("/api/v1/order/deleteSubscription/:subscriptionId", isAuthenticatedUser, deleteSubscription);
router.get("/api/v1/order/my/subscribe", isAuthenticatedUser, mySubscription);

router.put("/api/v1/order/add/product/order/:orderId", addproductinOrder);
router.delete("/api/v1/order/delete/product/order/:orderId", deleteproductinOrder);

router.post("/api/v1/order/pay/Bills", isAuthenticatedUser, payBills)
router.post("/api/v1/order/payBillStatusUpdate", isAuthenticatedUser, payBillStatusUpdate)
router.get('/api/v1/order/returnBottleOrder/:userId', returnBottleOrder)

module.exports = router;



