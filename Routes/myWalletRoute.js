const {
  addMoney,
  getWallet,
  deleteWallet
} = require("../Controller/myWalletCtrl");

const router = require("express").Router();

router.post("/api/v1/wallet/addmoney/:userId", addMoney);
router.get("/api/v1/wallet/get/:userId", getWallet);
router.post("/api/v1/wallet/deduct/:userId", deleteWallet);

module.exports = router;