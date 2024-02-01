const router = require("express").Router();
const { isAuthenticatedUser } = require("../Middleware/auth");
const {
    createAddress,
    getAddressById,
    updateAddress,
    deleteAddress,
} = require("../Controller/addressCtrl");

router.post("/api/v1/address/", isAuthenticatedUser, createAddress);
router.get("/api/v1/address/", isAuthenticatedUser, getAddressById);
router.put("/api/v1/address/:id", updateAddress);
router.delete("/api/v1/address/:id", deleteAddress);
module.exports = router;
