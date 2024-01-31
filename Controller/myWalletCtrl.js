const User = require("../Model/userModel");
const mongoose = require('mongoose');


//////////////////////////////// ADD MONEY ////////////////////////////////
const Wallet = require('../Model/myWalletModel');
const addMoney = async (req, res) => {
  const { userId } = req.params;
  const { balance } = req.body;

  try {
    // Check if the user has a wallet
    let wallet = await Wallet.findOne({ userId });

    // If the user doesn't have a wallet, create one
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        transactions: [],
      });
    }

    // Add money to the wallet
    wallet.balance += balance;

    // Add a transaction record (optional)
    wallet.transactions.push({
      transactionId: new mongoose.Types.ObjectId(),
      amount: balance,
      type: 'credit',
    });

    await wallet.save();

    res.status(200).json({
      data: wallet,
      success: true,
      message: `${balance} added to wallet`,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////// GET MONEY ////////////////////////////////

const getWallet = async (req, res) => {
  
  try {
    const { userId } = req.params;

    // Check if the user has a wallet
    const wallet = await Wallet.find({ userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }

    res.status(200).json({ data: wallet, success: true, message: 'Wallet details retrieved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//////////////////////////////// DELETE MONEY ////////////////////////////////

const deleteWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    // Check if the user has a wallet
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }

    // Check if the user has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
console.log(wallet);
    // Deduct the amount from the wallet
    wallet.balance -= amount;

    // Save the updated wallet
    await wallet.save();

    res.status(200).json({
      data: wallet,
      success: true,
      message: `${amount} deducted from the wallet successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  addMoney,
  getWallet,
  deleteWallet
}