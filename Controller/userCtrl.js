const User = require("../Model/userModel");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const mongoose = require('mongoose');
require("dotenv").config();
const jwt = require('jsonwebtoken')
const OTP = require("../utils/OTP-Generate")
const token = require("../utils/Token")
const Wallet = require("../Model/myWalletModel");
const twilio = require('twilio');
const vacation = require("../Model/vacation");
const rechargeTransaction = require("../Model/rechargeTransaction");
const walletTransaction = require("../Model/walletTransaction");
const Order = require("../Model/ShoppingCartOrderModel");
const Subscription = require("../Model/subscriptionModel");
const axios = require('axios');
const username = 'GIRORGANIC';
const password = 'Girorganic@789';
const from = 'GIRORG';
const indiaDltContentTemplateId = '1207170970346789539';
const indiaDltPrincipalEntityId = '1201162297097138491';
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { phone, name, email } = req.body;
  try {
    let findUser = await User.findOne({ phone, role: "User" });
    if (findUser) {
      return res.status(409).json({ data: {}, message: "Already exist.", status: 409 });
    } else {
      const otp = OTP.generateOTP();
      const user = await User.create({ phone, otp, name, email });
      if (user) {
        const to = `91${phone}`;
        const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
        const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
        await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
        return res.status(201).json({ status: 200, message: "Registration successfully", data: user });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  next();
});
exports.UpdatePhoneUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const phone = req.body.phone;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found", });
    }

    user.phone = phone;
    await user.save();

    // Generate and send OTP
    const otp = OTP.generateOTP();
    // const message = `Your OTP for updating phone number is ${otp}`;
    // await SMS.send(phone, message);

    res.status(200).json({
      data: user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
      message: "Something went wrong. Please try again",
    });
  }
});
exports.registerEmailUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const email = req.body.email;
  const name = req.body.name;
  const gender = req.body.gender;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "User not found", });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.id !== id) {
    return res.status(409).json({ error: "Email already exists", });
  }
  user.email = email;
  user.name = name;
  user.gender = gender;
  user.updatedAt = new Date();
  await user.save();
  return res.status(200).json({ data: user, success: true, });
});
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log('hi');
    const { phone } = req.body;
    if (!phone) {
      return next(new Error('Please provide your Phone No.', 400));
    }
    const user = await User.findOne({ phone, role: 'User' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const otp = await OTP.generateOTP();
    const to = `91${phone}`;
    const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
    const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
    await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
    let update = await User.findByIdAndUpdate({ _id: user._id }, { $set: { otp: otp } }, { new: true });
    return res.status(201).json({ success: true, Id: update._id, otp: otp });
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    return next(new Error('Error sending OTP', 500));
  }
});
exports.verifyOTP = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const isOTPValid = user.otp === req.body.otp;
    if (!isOTPValid) {
      return res.status(400).send({ message: "Invalid OTP" });
    }
    const Token = token.generateJwtToken(user._id);
    user.otp = null;
    user.phoneVerified = true;
    await user.save();
    return res.status(200).send({ message: "OTP verified successfully", Token, user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
exports.resendOTP = catchAsyncErrors(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const otp = OTP.generateOTP();
    user.otp = otp;
    await user.save();
    const to = `91${user.phone}`;
    const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
    const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
    await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
    return res.status(200).send({ message: "OTP resent successfully", data: user.otp });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
exports.userPhoto = async (req, res, next) => {
  try {
    const teacherId = req.params.userId;
    const users = await User.findById({ _id: teacherId });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
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
      location: location,
      email: req.body.email || users.email,
    }
    const updatedTeacher = await User.findByIdAndUpdate(teacherId, { $set: obj }, { new: true });
    return res.json(updatedTeacher);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.socialLogin = async (req, res) => {
  try {
    const { email, phone, firstName, lastName, mobile } = req.body;

    // Check if a user with the provided email or phone exists
    let user = await User.findOne({
      $and: [{ $or: [{ email: email }, { phone: phone }] }],
      // role: "USER",
    });

    if (user) {
      // User found, generate a token
      // jwt.sign({ user_id: user._id }, generateJwtToken, (err, token) => {
      token.generateJwtToken(user._id), (err, token) => {
        if (err) {
          return res.status(401).json({ status: 401, msg: "Invalid Credentials" });
        } else {
          return res.status(200).json({
            status: 200,
            msg: "Login successful",
            userId: user._id,
            token: token,
          });
        }
      };
    } else {
      // User not found, create a new user
      const newUser = await User.create({ firstName, lastName, mobile, email });

      if (newUser) {
        // New user created, generate a token
        // jwt.sign({ user_id: newUser._id }, generateJwtToken, (err, token) => {
        token.generateJwtToken({ user_id: newUser._id }), (err, token) => {
          if (err) {
            return res.status(401).json({ status: 401, msg: "Invalid Credentials" });
          } else {
            return res.status(201).json({
              status: 201,
              msg: "User registered and logged in successfully",
              userId: newUser._id,
              token: token,
            });
          }
        };
      }
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ status: 500, msg: "Internal server error" });
  }
};
exports.getAllUser = async (req, res) => {
  try {
    const { search, fromDate, toDate, status, page, limit } = req.query;
    let query = { role: "User" };
    const phoneNumber = Number(search);
    if (!isNaN(phoneNumber)) {
      query.$or = [
        { "name": { $regex: search, $options: "i" } },
        { "lastName": { $regex: search, $options: "i" } },
        { "firstName": { $regex: search, $options: "i" } },
        { "email": { $regex: search, $options: "i" } },
        { "phone": phoneNumber }
      ];
    } else {
      query.$or = [
        { "name": { $regex: search, $options: "i" } },
        { "lastName": { $regex: search, $options: "i" } },
        { "firstName": { $regex: search, $options: "i" } },
        { "email": { $regex: search, $options: "i" } },
      ];
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
      populate: 'changeAddressId addressId cutOffTimeId collectionBoyId driverId'
    };
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
    const users = await User.findById(id).populate('changeAddressId addressId cutOffTimeId collectionBoyId driverId');
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    return res.status(200).json({ success: true, users, total: 1 });
  } catch (error) {
    res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
  }
};
exports.deletemyAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Delete user data from the database 
    await User.findByIdAndDelete(userId);


    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.createVacation = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.user.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const currentDate = new Date();
    if (startDate <= currentDate) {
      return res.status(400).json({ error: "Start date must be in the future" });
    }
    const existingVacation = await vacation.findOne({ userId: users._id, startDate: { $lte: endDate }, endDate: { $gte: startDate } });
    if (existingVacation) {
      const timeDifference = endDate.getTime() - startDate.getTime();
      existingVacation.startDate = req.body.startDate;
      existingVacation.endDate = req.body.endDate;
      existingVacation.totalDay = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
      await existingVacation.save();
      const order = await Subscription.find({ userId: users._id });
      if (order) {
        for (let i = 0; i < order.length; i++) {
          const currentDate = new Date().toISOString().split('T')[0];
          if (currentDate >= order[i].pauseDate && currentDate <= order[i].resumeDate) {
            order[i].status = 'pause';
            order[i].endDate = new Date();
            let findUserOrder = await Order.find({ subscription: order[i]._id, orderType: "Subscription", startDate: { $gte: req.body.startDate, $lt: req.body.endDate, } });
            if (findUserOrder) {
              for (let i = 0; i < findUserOrder.length; i++) {
                await Order.findByIdAndUpdate({ _id: findUserOrder[i]._id }, { $set: { subscriptionStatus: "pause" } }, { new: true });
              }
            }
          } else {
            order[i].status = 'start';
          }
          order[i].pauseDate = req.body.startDate;
          order[i].resumeDate = req.body.endDate;
          await order[i].save();
        }
      }
      return res.status(200).json({ status: 200, message: "Vacation updated successfully", data: existingVacation });
    } else {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const totalDays = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
      const newVacation = await vacation.create({ userId: users._id, totalDay: totalDays, startDate: req.body.startDate, endDate: req.body.endDate });
      if (newVacation) {
        const order = await Subscription.find({ userId: users._id });
        if (order) {
          for (let i = 0; i < order.length; i++) {
            const currentDate = new Date().toISOString().split('T')[0];
            if (currentDate >= order[i].pauseDate && currentDate <= order[i].resumeDate) {
              order[i].status = 'pause';
              order[i].endDate = new Date();
              let findUserOrder = await Order.find({ subscription: order[i]._id, orderType: "Subscription", startDate: { $gte: req.body.startDate, $lt: req.body.endDate, } });
              if (findUserOrder) {
                for (let i = 0; i < findUserOrder.length; i++) {
                  await Order.findByIdAndUpdate({ _id: findUserOrder[i]._id }, { $set: { subscriptionStatus: "pause" } }, { new: true });
                }
              }
            } else {
              order[i].status = 'start';
            }
            order[i].pauseDate = req.body.startDate;
            order[i].resumeDate = req.body.endDate;
            await order[i].save();
          }
        }
        return res.status(201).json({ status: 200, message: "Vacation successfully created", data: newVacation });
      } else {
        return res.status(201).json({ status: 200, message: "Vacation successfully created", data: newVacation });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: `Something went wrong with Id: ${req.params}` });
  }
};
exports.getAllVacation = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.user.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id`, 400));
    }
    const user = await vacation.find({ userId: users._id });
    if (user.length > 0) {
      return res.status(200).json({ status: 200, message: "vacation successfully", data: user, });
    } else {
      return res.status(404).json({ status: 404, message: "vacation not found successfully", data: {}, });
    }
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong" });
  }
};
exports.getVacationById = async (req, res, next) => {
  try {
    const users = await vacation.findById({ _id: req.params.id });
    if (!users) {
      return next(new ErrorHander(`vacation does not exist `, 400));
    }
    return res.status(200).json({ status: 200, message: "vacation successfully", data: users, });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong` });
  }
};
exports.updateLocationofUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).send({ status: 404, message: "user not found" });
    } else {
      var location;
      if (req.body.currentLat && req.body.currentLong) {
        console.log(req.body.currentLong);
        let coordinates = [req.body.currentLat, req.body.currentLong];
        console.log(coordinates);
        location = { type: "Point", coordinates };
        console.log("--------------------", location);
        let update = await User.findByIdAndUpdate(
          { _id: user._id },
          { $set: { location: location } },
          { new: true }
        );
        if (update) {
          res.status(200).send({
            status: 200,
            message: "Location update successfully.",
            data: update,
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: 500, message: "Server error" + error.message });
  }
};
exports.createRechargeTransaction = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).send({ status: 404, message: "user not found" });
    } else {
      let id = await reffralCode()
      let month = new Date(Date.now()).getMonth() + 1;
      let obj = {
        user: user._id,
        id: id,
        amount: req.body.amount,
        month: month,
        Status: "pending"
      }
      const faq = await rechargeTransaction.create(obj);
      return res.status(200).send({ status: 200, message: "Recharge create successfully.", data: faq, });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, message: "Server error" + error.message });
  }
};
exports.getAllRechargeTransaction = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.user.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id`, 400));
    }
    const user = await rechargeTransaction.find({ user: users._id }).populate('user');
    if (user.length > 0) {
      return res.status(200).json({ status: 200, message: "Recharge transaction successfully", data: user, });
    } else {
      return res.status(404).json({ status: 404, message: "Recharge transaction not found successfully", data: {}, });
    }
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong" });
  }
};
exports.getRechargeTransactionById = async (req, res, next) => {
  try {
    const users = await rechargeTransaction.findById({ _id: req.params.id }).populate('user');
    if (!users) {
      return res.status(404).json({ status: 404, message: "Recharge transaction does not exist", data: {}, });
    }
    return res.status(200).json({ status: 200, message: "Recharge transaction successfully", data: users, });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong` });
  }
};
exports.getAllRechargeTransactionByuserId = async (req, res, next) => {
  try {
    const user = await rechargeTransaction.find({ user: req.params.userId }).populate('user');
    if (user.length > 0) {
      return res.status(200).json({ status: 200, message: "Recharge transaction successfully", data: user, });
    } else {
      return res.status(404).json({ status: 404, message: "Recharge transaction not found successfully", data: {}, });
    }
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong" });
  }
};
exports.updateRechargeTransaction = async (req, res) => {
  try {
    const user = await rechargeTransaction.findById({ _id: req.params.id });
    if (!user) {
      return res.status(404).send({ status: 404, message: "user not found" });
    } else {
      let update = await rechargeTransaction.findByIdAndUpdate({ _id: user._id }, { $set: { Status: req.body.Status } }, { new: true });
      if (update) {
        return res.status(200).send({ status: 200, message: "Recharge transaction update successfully.", data: update, });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: 500, message: "Server error" + error.message });
  }
};
exports.getAllWalletTransaction = async (req, res, next) => {
  try {
    const users = await User.findById({ _id: req.user.id });
    if (!users) {
      return next(new ErrorHander(`User does not exist with Id`, 400));
    }
    const user = await walletTransaction.find({ user: users._id }).populate('user');
    if (user.length > 0) {
      return res.status(200).json({ status: 200, message: "Wallet transaction successfully", data: user, });
    } else {
      return res.status(404).json({ status: 404, message: "Wallet transaction not found successfully", data: {}, });
    }
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong" });
  }
};
exports.getWalletTransactionById = async (req, res, next) => {
  try {
    const users = await walletTransaction.findById({ _id: req.params.id }).populate('user');
    if (!users) {
      return res.status(404).json({ status: 404, message: "Wallet transaction not found successfully", data: {}, });
    }
    return res.status(200).json({ status: 200, message: "Wallet transaction successfully", data: users, });
  } catch (error) {
    return res.status(200).json({ error: `Something went wrong` });
  }
};
exports.getAllWalletTransactionByUserId = async (req, res, next) => {
  try {
    const user = await walletTransaction.find({ user: req.params.userId }).populate([{ path: 'user' }, { path: 'order', populate: { path: 'product' } }]);
    if (user.length > 0) {
      return res.status(200).json({ status: 200, message: "Wallet transaction successfully", data: user, });
    } else {
      return res.status(404).json({ status: 404, message: "Wallet transaction not found successfully", data: {}, });
    }
  } catch (error) {
    return res.status(200).json({ error: "Something went wrong" });
  }
};
const reffralCode = async () => {
  var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let OTP = '';
  for (let i = 0; i < 9; i++) {
    OTP += digits[Math.floor(Math.random() * 36)];
  }
  return OTP;
}
// exports.loginUser = catchAsyncErrors(async (req, res, next) => {
//   const { phone } = req.body;
//   if (!phone) {
//     return next(new ErrorHander("Please Your Phone No.", 400));
//   }
//   const user = await User.findOne({ phone, role: "User" })
//   // if (!user) {
//   //   return next(new ErrorHander("Invalid phone Number", 401));
//   // }
//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }
//   if (user) {
//     // const otp = await sendOtp(user, "account_verification");
//     const otp = await OTP.generateOTP()
//     let update = await User.findByIdAndUpdate({ _id: user._id }, { $set: { otp: otp } }, { new: true })
//     return res.status(201).json({ success: true, Id: update._id, otp: otp })
//   }

//   sendToken(user, 200, res);
// });