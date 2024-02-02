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
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { phone, address, name, email } = req.body;
  try {
    let findUser = await User.findOne({ phone, role: "User" });
    if (findUser) {
      return res.status(409).json({ data: {}, message: "Already exit.", status: 409, });
    } else {
      const otp = OTP.generateOTP();
      const user = await User.create({ phone, otp, address, name, email });
      if (user) {
        return res.status(201).json({ status: 200, message: "Registration susscessfully", data: user, });
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
      return res.status(404).json({
        error: "User not found",
      });
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
    return res.status(404).json({
      error: "User not found",
    });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.id !== id) {
    return res.status(409).json({
      error: "Email already exists",
    });
  }

  user.email = email;
  user.name = name;
  user.gender = gender;

  // Update user's last updated date
  user.updatedAt = new Date();

  await user.save();

  res.status(200).json({
    data: user,
    success: true,
  });
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
    const message = `Your OTP is: ${otp}`;

    // const twilioResponse = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: '+91' + phone,

    // });

    // console.log(`SMS sent with SID: ${twilioResponse.sid}`);

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

    // Check if OTP is valid
    const isOTPValid = user.otp === req.body.otp;
    if (!isOTPValid) {
      return res.status(400).send({ message: "Invalid OTP" });
    }


    // Generate JWT token
    const Token = token.generateJwtToken(user._id);

    // Update user's OTP status
    user.otp = null;
    user.phoneVerified = true;
    await user.save();

    return res.status(200).send({
      message: "OTP verified successfully",
      Token,
    });
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

    // Generate new OTP
    const otp = OTP.generateOTP();

    // Update user's OTP
    user.otp = otp;
    await user.save();

    // Send OTP
    // const message = `Your OTP is ${otp}`;
    // await sendOTP(user.phone, message);

    return res.status(200).send({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
exports.userPhoto = async (req, res, next) => {
  console.log("hi");
  try {
    const teacherId = req.params.userId;
    let image;
    if (req.file) {
      image = req.file.path;
    }
    // console.log(req.file);
    // return;

    const updatedTeacher = await User.findByIdAndUpdate(teacherId, {
      name: req.body.name,

      phone: req.body.phone,
      profilePicture: image
    }, { new: true });
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
      return res.status(200).json({ status: 200, message: "Vacation updated successfully", data: existingVacation });
    } else {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const totalDays = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
      const newVacation = await vacation.create({ userId: users._id, totalDay: totalDays, startDate: req.body.startDate, endDate: req.body.endDate });
      return res.status(201).json({ status: 200, message: "Vacation successfully created", data: newVacation });
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