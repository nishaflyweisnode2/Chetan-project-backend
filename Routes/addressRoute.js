const router = require("express").Router();
const { isAuthenticatedUser } = require("../Middleware/auth");
const { createAddress, getAddressById, updateAddress, deleteAddress, updateAddressStatus } = require("../Controller/addressCtrl");

router.post("/api/v1/address/:userId", createAddress);
router.get("/api/v1/address/", isAuthenticatedUser, getAddressById);
router.put("/api/v1/address/:id", updateAddress);
router.delete("/api/v1/address/:id", deleteAddress)
router.put("/api/v1/address/updateAddressStatus/:userId", updateAddressStatus);;
module.exports = router;
