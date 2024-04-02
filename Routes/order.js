const router = require("express").Router();
const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");
const { createSubscriptionFromAdmin, placeOrderCOD, getOrders, updateCollectedDate, payBills, mySubscriptionOrders,
        createSubscription, updateSubscription, pauseSubscription, resumeSubscription, deleteSubscription,
        insertNewProduct, deleteproductinOrder, addproductinOrder, mySubscription,
        subscription, getSingleOrder, getAllSubscription, getUnconfirmedOrders,
        GetAllReturnOrderbyUserId, GetReturnByOrderId, orderReturn, updateOrder,
        getAllOrders, getAllOrdersForUser, updateOrderDetailsByAdmin, getAllOneTimeOrdersForAdmin,
        getSubscriptionById, getAllOrdersForInvoice, checkoutForAdmin, checkout, getAllOrdersForAdmin,
        updateOrderDetails, placeOrder, myOrders, payBillStatusUpdate, returnBottleOrder,
        returnBottleOrderForAdmin, deleteOrder, getAllProductOrdersForInvoice } = require("../Controller/Order");

router.post("/api/v1/order/checkout", isAuthenticatedUser, checkout);
router.post("/api/v1/order/checkoutForAdmin", checkoutForAdmin);
router.post("/api/v1/order/createSubscriptionFromAdmin", createSubscriptionFromAdmin);
router.get("/api/v1/order/", isAuthenticatedUser, myOrders);
router.get("/api/v1/order/getAllProductOrders/ForInvoice", getAllProductOrdersForInvoice);
router.get("/api/v1/order/getAllOrders/ForInvoice", getAllOrdersForInvoice);
router.get("/api/v1/order/:id", getSingleOrder);
router.put("/api/v1/order/updateOrderDetailsByAdmin/:id", updateOrderDetailsByAdmin)
router.put("/api/v1/order/updateOrderDetails/:id", isAuthenticatedUser, updateOrderDetails)
router.delete("/api/v1/order/admin/:id", deleteOrder)
router.get("/api/v1/order/admin/orders", getAllOrders)
router.put("/api/v1/order/admin/:id", updateOrder)
router.post('/api/v1/order/updateCollectedDate', updateCollectedDate)
router.post("/api/v1/order/pay/Bills", isAuthenticatedUser, payBills)
router.post("/api/v1/order/payBillStatusUpdate", isAuthenticatedUser, payBillStatusUpdate)
router.get('/api/v1/order/returnBottleOrder/:userId', returnBottleOrder)
router.get('/api/v1/order/return/BottleOrderForAdmin', returnBottleOrderForAdmin)
router.post("/api/v1/order/createSubscription", isAuthenticatedUser, createSubscription);
router.get("/api/v1/order/getSubscription/:subscriptionId", getSubscriptionById);
router.put("/api/v1/order/pauseSubscription/:subscriptionId", isAuthenticatedUser, pauseSubscription);
router.put("/api/v1/order/resumeSubscription/:subscriptionId", isAuthenticatedUser, resumeSubscription);
router.put("/api/v1/order/updateSubscription/:subscriptionId", isAuthenticatedUser, updateSubscription);
router.delete("/api/v1/order/deleteSubscription/:subscriptionId", isAuthenticatedUser, deleteSubscription);
router.get("/api/v1/order/my/subscribe", isAuthenticatedUser, mySubscription);


router.get("/api/v1/order/getAllOrders/ForAdmin", getAllOrdersForAdmin);
router.get("/api/v1/order/getAllOneTimeOrders/ForAdmin", getAllOneTimeOrdersForAdmin);

router.get("/api/v1/order/getAllOrders/ForUser", isAuthenticatedUser, getAllOrdersForUser);













router.post("/api/v1/order/place-order", isAuthenticatedUser, placeOrder);
router.post('/place-order/cod', isAuthenticatedUser, placeOrderCOD)
router.get("/api/v1/order/mySubscriptionOrders", isAuthenticatedUser, mySubscriptionOrders)
router.get("/api/v1/order/subscription/all", getAllSubscription)
router.post('/insert-product/:orderId/:productId', insertNewProduct)
// router.route("/api/v1/order/order/new").post(isAuthenticatedUser, newOrder);
router.post('/return/:id', orderReturn);
router.get("/api/v1/order/Allorders", isAuthenticatedUser, getOrders)
router.get('/return/:userId', GetAllReturnOrderbyUserId)
router.get('/return/orderId/:id', GetReturnByOrderId);
router.get("/api/v1/order/all/user/orders", getUnconfirmedOrders);
router.post("/api/v1/order/subscribe/:orderId", isAuthenticatedUser, subscription);
router.put("/api/v1/order/add/product/order/:orderId", addproductinOrder);
router.delete("/api/v1/order/delete/product/order/:orderId", deleteproductinOrder);
module.exports = router;



