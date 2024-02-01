const { orderSchedule, getSchedule, deleteSchedule } = require("../Controller/myScheduleCtrl");
const router = require("express").Router();
const { isAuthenticatedUser } = require("../Middleware/auth");

router.post("/api/v1/schedule/order", isAuthenticatedUser, orderSchedule);
router.get("/api/v1/schedule/order/:id", getSchedule);
router.delete("/api/v1/schedule/order/:id", deleteSchedule);

module.exports = router;