const router = require("express").Router();
const { isAuthenticatedUser } = require("../Middleware/auth");
const {
    createAddress,
    getAddressById,
    updateAddress,
    deleteAddress,
} = require("../Controller/addressCtrl");

router.post("/",isAuthenticatedUser, createAddress);
router.get("/", isAuthenticatedUser,getAddressById);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
module.exports = router;
