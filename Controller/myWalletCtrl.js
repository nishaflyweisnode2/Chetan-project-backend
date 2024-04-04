const User = require("../Model/userModel");
const addMoney = async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;
    let wallet = await User.findOne({ _id: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }
    wallet.balance = wallet.balance + parseFloat(balance);
    await wallet.save();
    return res.status(200).json({ data: wallet, success: true, message: `${balance} added to wallet`, status: 200, });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//////////////////////////////// GET MONEY ///////////////////////////////
const getWallet = async (req, res) => {

  try {
    const { userId } = req.params;

    // Check if the user has a wallet
    const wallet = await User.find({ _id: userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }

    return res.status(200).json({ data: wallet, success: true, message: 'Wallet details retrieved successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
//////////////////////////////// DELETE MONEY ////////////////////////////////
const deleteWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    let wallet = await User.findOne({ _id: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    wallet.balance = wallet.balance - parseFloat(amount);
    await wallet.save();
    return res.status(200).json({ data: wallet, success: true, message: `${amount} deducted from the wallet successfully`, });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const addAdvanceMoney = async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;
    let wallet = await User.findOne({ _id: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }
    if (wallet.pendingAmount > 0) {
      if (wallet.pendingAmount > parseFloat(balance)) {
        wallet.pendingAmount = wallet.pendingAmount - parseFloat(balance);
        await wallet.save();
      }
      if (wallet.pendingAmount < parseFloat(balance)) {
        wallet.advancedAmount = wallet.advancedAmount + (wallet.pendingAmount - parseFloat(balance));
        wallet.pendingAmount = 0;
        await wallet.save();
      }
      if (wallet.pendingAmount == parseFloat(balance)) {
        wallet.pendingAmount = 0;
        await wallet.save();
      }
    }
    if (wallet.pendingAmount <= 0) {
      wallet.advancedAmount = wallet.advancedAmount + parseFloat(balance);
      await wallet.save();
    }
    return res.status(200).json({ data: wallet, success: true, message: `${balance} added to wallet`, status: 200, });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addPendingMoney = async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;
    let wallet = await User.findOne({ _id: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }
    wallet.pendingAmount = wallet.pendingAmount + parseFloat(balance);
    await wallet.save();
    return res.status(200).json({ data: wallet, success: true, message: `${balance} added to pending Amount`, status: 200, });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  addMoney,
  getWallet,
  deleteWallet,
  addAdvanceMoney,
  addPendingMoney
}