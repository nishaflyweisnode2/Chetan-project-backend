const ErrorHander = require("../utils/errorhander");
const bcrypt = require('bcryptjs')
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Brand = require("../Model/brandModel");
const User = require("../Model/userModel");
const { multipleFileHandle } = require("../utils/fileHandle");
const token = require("../utils/Token")
const Order = require("../Model/ShoppingCartOrderModel");
const enquiry = require('../Model/enquiry');
const cutOffTime = require('../Model/cutOffTime');

exports.createBrand = catchAsyncErrors(async (req, res, next) => {
  const imagesLinks = await multipleFileHandle(req.files);

  req.body.brandIcon = imagesLinks[0];

  req.body.user = req.user.id;

  const category = await Brand.create(req.body);

  return res.status(201).json({
    success: true,
    category,
  });
});
exports.RegisterAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    let findAdmin = await User.findOne({ email: req.body.email, role: "Admin" });
    if (findAdmin) {
      return res.status(409).json({ message: "Already Exit", result: {} })
    }
    req.body.password = bcrypt.hashSync(req.body.password, 8)
    const data = { name: req.body.name, email: req.body.email, password: req.body.password, role: "Admin" };
    const result = await User.create(data);
    return res.status(200).json({ message: "ok", result: result })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "not ok", error: err.message })
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
    return res.status(201).send({ data: user, accessToken: Token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" + error.message });
  }
};
exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.find({ role: "User" });
    return res.status(200).json({
      status: 200,
      users,
      total: users.length
    });
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong" });
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
    return res.status(200).json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
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
    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong when deleting user" });
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

    return res.status(200).json({ message: 'Order canceled successfully', order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while canceling the order' });
  }
};
exports.getAllEnquiry = async (req, res) => {
  try {
    const Driver = await enquiry.find();
    if (Driver.length > 0) {
      return res.status(200).json({ status: 200, message: "Enquiry found successfully", data: Driver });
    } else {
      return res.status(404).json({ status: 404, message: "Enquiry Not found", data: {} })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
};
exports.getEnquiryById = async (req, res) => {
  try {
    const Driver = await enquiry.findById({ _id: req.params.id });
    if (Driver) {
      return res.status(200).json({ status: 200, message: "Enquiry found successfully", data: Driver });
    } else {
      return res.status(404).json({ status: 404, message: "Enquiry Not found", data: {} })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
};
exports.closeEnquiry = async (req, res) => {
  try {
    const Driver = await enquiry.findById({ _id: req.params.id });
    if (Driver) {
      let updateDriver = await enquiry.findByIdAndUpdate({ _id: Driver._id }, { $set: { status: "closed" } }, { new: true });
      return res.status(200).json({ status: 200, message: "Enquiry close successfully", data: updateDriver });
    } else {
      return res.status(404).json({ status: 404, message: "Enquiry Not found", data: {} })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
};
exports.deleteEnquiry = async (req, res) => {
  try {
    const Driver = await enquiry.findById({ _id: req.params.id });
    if (Driver) {
      let updateDriver = await enquiry.findByIdAndDelete({ _id: Driver._id });
      return res.status(200).json({ status: 200, message: "Enquiry delete successfully", data: updateDriver });
    } else {
      return res.status(404).json({ status: 404, message: "Enquiry Not found", data: {} })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
};
exports.AddCutOffTime = async (req, res) => {
  try {
    let findCutOffTime = await cutOffTime.findOne({ time: req.body.time, type: req.body.type });
    if (findCutOffTime) {
      const data = { time: req.body.time || findCutOffTime.time, type: req.body.type };
      const banner = await cutOffTime.findByIdAndUpdate({ _id: findCutOffTime._id }, { $set: data }, { new: true });
      return res.status(200).json({ message: "CutOffTime add successfully.", status: 200, data: banner });
    } else {
      const data = { time: req.body.time, type: req.body.type };
      const banner = await cutOffTime.create(data);
      return res.status(200).json({ message: "CutOffTime add successfully.", status: 200, data: banner });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
  }
};
exports.getCutOffTime = async (req, res) => {
  try {
    const CutOffTimes = await cutOffTime.find({});
    return res.status(200).json({ message: "Top CutOffTimes", data: CutOffTimes });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    });
  }
};
exports.getCutOffTimeById = async (req, res) => {
  try {
    const CutOffTimes = await cutOffTime.findById({ _id: req.params.id });
    return res.status(200).json({ message: "One CutOffTimes", data: CutOffTimes })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message })
  }
}
exports.DeleteCutOffTime = async (req, res) => {
  try {
    const CutOffTimes = await cutOffTime.findByIdAndDelete({ _id: req.params.id });
    return res.status(200).json({ message: "Delete CutOffTime ", },)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}
exports.getCutOffTimeForApp = async (req, res) => {
  try {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentSecond = currentTime.getSeconds();
    let currentSecond1, currentMinute1;
    if (currentSecond < 10) {
      currentSecond1 = '' + 0 + currentSecond;
    } else {
      currentSecond1 = currentSecond
    }
    if (currentMinute < 10) {
      currentMinute1 = '' + 0 + currentMinute;
    } else {
      currentMinute1 = currentMinute
    }
    const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
    const CutOffTimes1 = await cutOffTime.findOne({ type: "morningOrder" });
    const CutOffTimes2 = await cutOffTime.findOne({ type: "eveningOrder" });
    console.log(CutOffTimes2.time, "", CutOffTimes1.time, "", currentTimeString, "", CutOffTimes2.time)
    if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) {
      return res.json({ type: CutOffTimes2 });
    } else {
      return res.json({ status: 200, message: "CutOffTimes found successfully.", data: CutOffTimes1 });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};