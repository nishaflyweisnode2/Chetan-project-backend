const ErrorHander = require("../utils/errorhander");
const bcrypt = require('bcryptjs')
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Brand = require("../Model/brandModel");
const User = require("../Model/userModel");
const { multipleFileHandle } = require("../utils/fileHandle");
const token = require("../utils/Token")
const Order = require("../Model/ShoppingCartOrderModel");

exports.createBrand = catchAsyncErrors(async (req, res, next) => {
  const imagesLinks = await multipleFileHandle(req.files);

  req.body.brandIcon = imagesLinks[0];

  req.body.user = req.user.id;

  const category = await Brand.create(req.body);

  res.status(201).json({
    success: true,
    category,
  });
});
exports.RegisterAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    let findAdmin = await User.findOne({ email: req.body.email, role: "Admin" });
    if (findAdmin) {
      res.status(409).json({ message: "Already Exit", result: {} })
    }
    req.body.password = bcrypt.hashSync(req.body.password, 8)
    const data = { name: req.body.name, email: req.body.email, password: req.body.password, role: "Admin" };
    const result = await User.create(data);
    res.status(200).json({ message: "ok", result: result })
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "not ok", error: err.message })
  }
})
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email, userType: "Admin" });
    if (!user) {
      return res
        .status(404)
        .send({ message: "user not found ! not registered" });
    }
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).send({ message: "Wrong password" });
    }
    const Token = token.generateJwtToken(user._id);
    res.status(201).send({ data: user, accessToken: Token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" + error.message });
  }
};
exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.find({ role: "User" });
    res.status(200).json({
      status: 200,
      users,
      total: users.length
    });
  } catch (error) {
    res.status(200).json({ error: "Something went wrong" });
  }
};
exports.getUserbyId = async (req, res, next) => {
  console.log("hi");
  const id = req.params.id;
  try {
    const users = await User.findById(id);
    if (!users) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
    res.status(200).json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
  }
};
exports.deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(200).json({ error: "Something went wrong when deleting user" });
  }
};


exports.cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is in a cancelable state (e.g., 'pending' or 'shipped')
    // if (order.status !== 'pending' && order.status !== 'shipped') {
    //   return res.status(400).json({ message: 'Order cannot be canceled' });
    // }

    // Update the order status to 'canceled'
    order.status = 'canceled';
    await order.save();

    res.status(200).json({ message: 'Order canceled successfully',order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while canceling the order' });
  }
};
