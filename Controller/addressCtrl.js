const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Address = require("../Model/addressModel");
const User = require("../Model/userModel");

exports.createAddress = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findById({ _id: req.params.userId });
  if (!users) {
    return next(new ErrorHander(`User does not exist with Id: ${req.params.userId}`, 400));
  }
  const findAddress = await Address.findOne({ user: users._id });
  if (findAddress) {
    await Address.findByIdAndUpdate({ _id: findAddress._id }, { $set: req.body }, { new: true, });
    await User.findByIdAndUpdate({ _id: users._id }, { $set: { addressStatus: "Upload", addressId: findAddress._id } }, { new: true, });
  }
  const address = await Address.create(req.body);
  await User.findByIdAndUpdate({ _id: users._id }, { $set: { addressStatus: "Upload", addressId: address._id } }, { new: true, });
  return res.status(201).json({ success: true, address, });
});
exports.getAddressById = catchAsyncErrors(async (req, res, next) => {
  const allAddress = await Address.findOne({ user: req.user._id });
  return res.status(201).json({ success: true, allAddress, });
});
exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
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
