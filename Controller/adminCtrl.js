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
const rechargeOffer = require('../Model/rechargeOffer');
const { UserInstance } = require("twilio/lib/rest/conversations/v1/user");
const logs = require('../Model/logs');
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const Subscription = require("../Model/subscriptionModel");
const Wallet = require('../Model/myWalletModel');
const moment = require('moment');
const Razorpay = require("razorpay");
const OrderReturn = require('../Model/OrderReturnModel')
const Address = require("../Model/addressModel");
const notDelivered = require('../Model/notDelivered');
const Category = require("../Model/categoryModel");
const SubCategory = require("../Model/SubCategoryModel");
exports.dashboard = async (req, res) => {
  try {
    let totalUser = await User.find({ role: "User" }).count();
    let totalCategory = await Category.find({}).count();
    const totalSubCategory = await SubCategory.find().count();
    const totalProduct = await Product.find().count();
    const totalLogs = await logs.find({}).count();
    const notDelivered1 = await notDelivered.find({}).count();
    const totalOrders = await Order.find({ orderType: "once" }).count();
    let obj = {
      totalProduct: totalProduct,
      totalCategory: totalCategory,
      totalSubCategory: totalSubCategory,
      totalUser: totalUser,
      totalLogs: totalLogs,
      notDelivered: notDelivered1,
      totalOrders: totalOrders
    };
    return res.status(200).send({ message: "Data found successfully", data: obj });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "internal server error " + err.message,
    });
  }
};
exports.userOrders = async (req, res, next) => {
  console.log("hi");
  const orders = await Order.find({ user: req.params.userId, orderType: "once" }).populate("user product")
  if (orders.length == 0) {
    return res.status(404).json({ success: false, });
  }
  return res.status(200).json({ success: true, orders, });
};
exports.userSubscriptionOrders = async (req, res, next) => {
  const orders = await Subscription.find({ user: req.params.userId, }).populate("userId product")
  if (orders.length == 0) {
    return res.status(404).json({ success: false, });
  }
  console.log(orders);
  return res.status(200).json({ success: true, orders });
}
exports.deleteSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const order = await Subscription.findById(subscriptionId);
    if (!order) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    const del = await Subscription.findByIdAndDelete(subscriptionId);

    return res.status(201).json({ message: 'Subscription delete successfully', del });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
exports.updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const order = await Subscription.findById(subscriptionId);
    if (!order) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    let productId;
    if (req.body.productId != (null || undefined)) {
      const findProduct = await Product.findById({ _id: req.body.productId });
      if (!findProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      productId = findProduct._id;
    } else {
      productId = order.product;
    }
    const user = await User.findOne({ _id: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let obj = {
      userId: req.params.userId,
      driverId: user.driverId,
      collectionBoyId: user.collectionBoyId,
      product: productId,
      size: req.body.size || order.size,
      price: req.body.price || order.price,
      alternateDay: req.body.alternateDay || order.alternateDay,
      quantity: req.body.quantity || order.quantity,
      startDate: req.body.startDate || order.startDate,
      ringTheBell: req.body.ringTheBell || order.ringTheBell,
      instruction: req.body.instruction || order.instruction,
      days: req.body.days || order.days,
      type: req.body.type || order.type,
    }
    const banner = await Subscription.findByIdAndUpdate({ _id: order._id }, { $set: obj }, { new: true });
    return res.status(201).json({ message: 'Create subscription successfully', banner });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
exports.updateUserProfile = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.params.userId });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.userId}`, 400));
    }
    let image;
    if (req.file) {
      image = req.file.path;
    } else {
      image = users.profilePicture
    }
    let location;
    if (req.body.currentLat && req.body.currentLong) {
      let coordinates = [req.body.currentLat, req.body.currentLong];
      location = { type: "Point", coordinates };
    } else {
      location = users.location
    }
    let obj = {
      name: req.body.name || users.name,
      phone: req.body.phone || users.phone,
      profilePicture: image,
      location: location
    }
    const updatedTeacher = await User.findByIdAndUpdate({ _id: users._id }, { $set: obj }, { new: true });
    return res.json(updatedTeacher);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.activeBlockUser = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.params.userId });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.userId}`, 400));
    }
    if (users.status == "Block") {
      const updatedTeacher = await User.findByIdAndUpdate({ _id: users._id }, { $set: { status: "Active" } }, { new: true });
      return res.json({ status: 200, message: "User Active successfully.", data: updatedTeacher });
    } else {
      const updatedTeacher = await User.findByIdAndUpdate({ _id: users._id }, { $set: { status: "Block" } }, { new: true });
      return res.json({ status: 200, message: "User Block successfully.", data: updatedTeacher });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.prePostPaidUser = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.params.userId });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.userId}`, 400));
    }
    if (users.paymentMode == "PostPaid") {
      const updatedTeacher = await User.findByIdAndUpdate({ _id: users._id }, { $set: { paymentMode: "PrePaid" } }, { new: true });
      return res.json({ status: 200, message: "User PrePaid successfully.", data: updatedTeacher });
    } else {
      const updatedTeacher = await User.findByIdAndUpdate({ _id: users._id }, { $set: { paymentMode: "PostPaid" } }, { new: true });
      return res.json({ status: 200, message: "User PostPaid successfully.", data: updatedTeacher });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
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
exports.addStaff = catchAsyncErrors(async (req, res, next) => {
  try {
    let findAdmin = await User.findOne({ email: req.body.email, role: "Staff" });
    if (findAdmin) {
      return res.status(409).json({ message: "Already Exit", result: {} })
    }
    req.body.password = bcrypt.hashSync(req.body.password, 8)
    const data = { name: req.body.name, email: req.body.email, password: req.body.password, role: "Staff" };
    const result = await User.create(data);
    return res.status(200).json({ message: "ok", result: result })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "not ok", error: err.message })
  }
});
exports.getAllStaff = async (req, res) => {
  try {
    const { search, fromDate, toDate, status, page, limit } = req.query;
    let query = { role: "Staff" };
    if (search) {
      query.$or = [
        { "name": { $regex: req.query.search, $options: "i" }, },
        { "lastName": { $regex: req.query.search, $options: "i" }, },
        { "firstName": { $regex: req.query.search, $options: "i" }, },
        { "email": { $regex: req.query.search, $options: "i" }, },
      ]
    }
    if (status) {
      query.userStatus = status
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: Number(page) || 1,
      limit: Number(limit) || 15,
      sort: { createdAt: -1 },
    };
    let data = await User.paginate(query, options);
    return res.status(200).json({ status: 200, message: "User data found.", data: data });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
  }
};
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
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
exports.getAllUser = async (req, res) => {
  try {
    const { search, fromDate, toDate, status, userStatus, addressStatus, page, limit } = req.query;
    let query = { role: "User" };
    if (search) {
      query.$or = [
        { "name": { $regex: req.query.search, $options: "i" }, },
        { "lastName": { $regex: req.query.search, $options: "i" }, },
        { "firstName": { $regex: req.query.search, $options: "i" }, },
        { "email": { $regex: req.query.search, $options: "i" }, },
      ]
    }
    if (status) {
      query.status = status
    }
    if (addressStatus) {
      query.addressStatus = addressStatus
    }
    if (userStatus) {
      query.userStatus = userStatus
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: Number(page) || 1,
      limit: Number(limit) || 15,
      sort: { createdAt: -1 },
    };
    console.log(query)
    let data = await User.paginate(query, options);
    return res.status(200).json({ status: 200, message: "User data found.", data: data });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
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
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    return res.status(200).json({ success: true, message: "User Deleted Successfully" });
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
exports.AddRechargeOffer = async (req, res) => {
  try {
    let getPercentage, price, getPrice;
    if (req.body.getPrice < req.body.price) {
      price = req.body.price;
      getPrice = req.body.price;
      getPercentage = 0;
    } else {
      getPercentage = (((req.body.getPrice - req.body.price) * 100) / (req.body.price));
      price = req.body.price;
      getPrice = req.body.getPrice;
    }
    if (req.body.sendTo == "All") {
      let user = await User.find({ role: "User" });
      if (user.length > 0) {
        for (let i = 0; i < user.length; i++) {
          let obj = {
            price: price,
            getPrice: getPrice,
            getPercentage: getPercentage,
            user: user[i]._id,
          }
          const banner = await rechargeOffer.create(obj);
        }
      }
    }
    if (req.body.sendTo == "Single") {
      let obj = {
        price: price,
        getPrice: getPrice,
        getPercentage: getPercentage,
        user: req.body.userId,
      }
      const banner = await rechargeOffer.create(obj);
    }
    return res.status(200).json({ message: "rechargeOffer add successfully.", status: 200, data: {} });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
  }
};
exports.getRechargeOffer = async (req, res) => {
  try {
    const rechargeOffers = await rechargeOffer.find({}).populate('user');
    return res.status(200).json({ message: "Recharge Offer", data: rechargeOffers });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    });
  }
};
exports.getRechargeOfferById = async (req, res) => {
  try {
    const rechargeOffers = await rechargeOffer.findById({ _id: req.params.id }).populate('user');
    return res.status(200).json({ message: "RechargeOffer", data: rechargeOffers })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message })
  }
}
exports.DeleteRechargeOffer = async (req, res) => {
  try {
    const rechargeOffers = await rechargeOffer.findByIdAndDelete({ _id: req.params.id });
    return res.status(200).json({ message: "Delete rechargeOffer ", },)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}
exports.getRechargeOfferByUserId = async (req, res) => {
  try {
    const rechargeOffers = await rechargeOffer.find({ user: req.params.user }).populate('user');
    return res.status(200).json({ message: "Recharge Offer", data: rechargeOffers });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    });
  }
};
exports.assignPermissionUserbyId = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.params.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    let obj = {
      dashboard: req.body.dashboard,
      userList: req.body.userList,
      category: req.body.category,
      subCategory: req.body.subCategory,
      product: req.body.product,
      order: req.body.order,
      subscribedOrder: req.body.subscribedOrder,
      unConfirmOrder: req.body.unConfirmOrder,
      help: req.body.help,
      banner: req.body.banner,
      terms: req.body.terms,
      privacyPolicy: req.body.privacyPolicy,
      coupons: req.body.coupons,
      aboutUs: req.body.aboutUs,
      contact: req.body.contact,
      faq: req.body.faq,
      notification: req.body.notification,
      wallet: req.body.wallet,
      deliveryBoy: req.body.deliveryBoy,
      collectionBoy: req.body.collectionBoy,
      return: req.body.return,
      orderSheet: req.body.orderSheet,
      logs: req.body.logs,
    }
    let update = await User.findByIdAndUpdate({ _id: users._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Permission assign successfully.", data: update });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
  }
};
exports.acceptRejectAddress = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.params.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    let obj = {
      addressStatus: req.body.addressStatus,
    }
    let update = await User.findByIdAndUpdate({ _id: users._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Permission assign successfully.", data: update });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
  }
};
exports.changeUserStatus = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.params.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    let obj = {
      userStatus: req.body.userStatus,
    }
    let update = await User.findByIdAndUpdate({ _id: users._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Permission assign successfully.", data: update });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
  }
};
exports.getAllLogs = async (req, res) => {
  try {
    const Driver = await logs.find().populate('driver user');
    if (Driver.length > 0) {
      return res.status(200).json({ status: 200, message: "Logs found successfully", data: Driver });
    } else {
      return res.status(404).json({ status: 404, message: "Logs Not found", data: {} })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
};
exports.getAllNotDelivered = async (req, res) => {
  try {
    const Driver = await notDelivered.find().populate('product driverId user orderId');
    if (Driver.length > 0) {
      return res.status(200).json({ status: 200, message: "Logs found successfully", data: Driver });
    } else {
      return res.status(404).json({ status: 404, message: "Logs Not found", data: {} })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
};