const router = require("express").Router();
const {
    create,
    getContactUs,
    updateContactUs,
    deleteContactUs,
} = require("../Controller/contactUsCtrl");

router.post("/", create);
router.get("/", getContactUs);
router.delete("/:id", deleteContactUs);

module.exports = router;
