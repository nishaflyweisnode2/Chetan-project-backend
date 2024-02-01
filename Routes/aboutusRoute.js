const router = require("express").Router();
const aboutUsCtrl = require("../Controller/aboutUsCtrl");

router.post("/api/v1/aboutUs/", aboutUsCtrl.create);
router.get("/api/v1/aboutUs/", aboutUsCtrl.getAboutUs);
router.put("/api/v1/aboutUs/:id", aboutUsCtrl.updateAboutUs);
router.delete("/api/v1/aboutUs/:id", aboutUsCtrl.deleteAboutUs);
module.exports = router;
