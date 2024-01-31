const {
  addMoney,
  getWallet,
  deleteWallet
} = require("../Controller/myWalletCtrl");

const router = require("express").Router();

router.post("/addmoney/:userId", addMoney);
router.get("/get/:userId", getWallet);
router.post("/deduct/:userId", deleteWallet);

module.exports = router;