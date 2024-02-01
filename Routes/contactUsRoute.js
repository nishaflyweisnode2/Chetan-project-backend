const router = require("express").Router();
const {
    create,
    getContactUs,
    updateContactUs,
    deleteContactUs,
} = require("../Controller/contactUsCtrl");

router.post("/api/v1/contactUs/", create);
router.get("/api/v1/contactUs/", getContactUs);
router.delete("/api/v1/contactUs/:id", deleteContactUs);

module.exports = router;
