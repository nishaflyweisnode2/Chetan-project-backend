const {
  addMoney,
  getWallet,
  deleteWallet,
  addAdvanceMoney,
  addPendingMoney
} = require("../Controller/myWalletCtrl");

const router = require("express").Router();

router.post("/api/v1/wallet/addmoney/:userId", addMoney);
router.get("/api/v1/wallet/get/:userId", getWallet);
router.post("/api/v1/wallet/deduct/:userId", deleteWallet);
router.post("/api/v1/wallet/addAdvanceMoney/:userId", addAdvanceMoney);
router.post("/api/v1/wallet/addPendingMoney/:userId", addPendingMoney);

module.exports = router;