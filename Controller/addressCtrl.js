const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Address = require("../Model/addressModel");
const User = require("../Model/userModel");
const notify = require('../Model/notificationModel');

exports.createAddress = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findById({ _id: req.params.userId });
  if (!users) {
    return next(new ErrorHander(`User does not exist with Id: ${req.params.userId}`, 400));
  }
  const findAddress = await Address.findOne({ user: users._id, addressType: "My" });
  if (findAddress) {
    const findAddress1 = await Address.findOne({ user: users._id, addressType: "Change" });
    if (findAddress1) {
      if (req.body.currentLat && req.body.currentLong) {
        let coordinates = [req.body.currentLat, req.body.currentLong];
        req.body.location = { type: "Point", coordinates };
      }
      const address = await Address.findByIdAndUpdate({ _id: findAddress1._id }, { $set: req.body }, { new: true, });
      await User.findByIdAndUpdate({ _id: users._id }, { $set: { changeAddressId: findAddress1._id, addressStatus: "Upload" } }, { new: true, });
      return res.status(201).json({ success: true, address, });
    } else {
      req.body.user = users._id;
      req.body.addressType = "Change";
      if (req.body.currentLat && req.body.currentLong) {
        let coordinates = [req.body.currentLat, req.body.currentLong];
        req.body.location = { type: "Point", coordinates };
      }
      const address = await Address.create(req.body);
      await User.findByIdAndUpdate({ _id: users._id }, { $set: { changeAddressId: address._id, addressStatus: "Upload" } }, { new: true, });
      return res.status(201).json({ success: true, address, });
    }
  }
  req.body.user = users._id;
  const address = await Address.create(req.body);
  await User.findByIdAndUpdate({ _id: users._id }, { $set: { addressStatus: "approved", addressId: address._id } }, { new: true, });
  return res.status(201).json({ success: true, address, });
});
exports.getAddressById = catchAsyncErrors(async (req, res, next) => {
  const allAddress = await Address.findOne({ user: req.user._id });
  return res.status(201).json({ success: true, allAddress, });
});
exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
  if (req.body.currentLat && req.body.currentLong) {
    let coordinates = [req.body.currentLat, req.body.currentLong];
    req.body.location = { type: "Point", coordinates };
  }
  const newAddressData = req.body;
  await Address.findByIdAndUpdate(req.params.id, newAddressData, { new: true });
  return res.status(200).json({ success: true, });
});
exports.deleteAddress = catchAsyncErrors(async (req, res, next) => {
  const address = await Address.findById(req.params.id);
  if (!address) {
    return next(new ErrorHander(`Address does not exist with Id: ${req.params.id}`, 400));
  }
  await address.deleteOne();
  return res.status(200).json({ success: true, message: "Address Deleted Successfully", });
});
exports.updateAddressStatus = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findById({ _id: req.params.userId });
  if (!users) {
    return next(new ErrorHander(`User does not exist with Id: ${req.params.userId}`, 400));
  } else {
    const findAddress = await Address.findOne({ user: users._id, addressType: "My" });
    const findAddress1 = await Address.findOne({ user: users._id, addressType: "Change" });
    if (req.body.addressStatus == "approved") {
      await Address.findByIdAndUpdate({ _id: findAddress1._id }, { $set: { addressType: "My" } }, { new: true, });
      await Address.findByIdAndDelete({ _id: findAddress._id });
      let update = await User.findByIdAndUpdate({ _id: users._id }, { $set: { addressStatus: req.body.addressStatus, addressStatus: "approved", changeAddressId: null, addressId: findAddress1._id } }, { new: true, });
      let data12 = {
        message: "User address has been changed, so please check first order you delivered.",
        driverId: users.driverId,
        for: "Driver",
        user: users._id
      };
      await notify.create(data12);
      let data13 = {
        message: "User address has been changed, so please check first then go for collection.",
        collectionBoyId: users.collectionBoyId,
        for: "CollectionBoy",
        user: users._id
      };
      await notify.create(data13);
      return res.status(201).json({ success: true, update, });
    } else {
      let update = await User.findByIdAndUpdate({ _id: users._id }, { $set: { addressStatus: req.body.addressStatus } }, { new: true, });
      return res.status(201).json({ success: true, update, });
    }
  }
});