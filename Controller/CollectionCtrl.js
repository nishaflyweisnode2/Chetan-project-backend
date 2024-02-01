const driver = require('../Model/DriverRegistration');
const order = require('../Model/ShoppingCartOrderModel');
const User = require('../Model/userModel')
const DriverOrder = require('../Model/Driver-OrderModel')
const rejectOrder = require('../Model/RejectReasonsModel')
const address = require('../Model/addressModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otpHelper = require("../utils/OTP-Generate");
const { error } = require('console');
const product = require('../Model/productModel')
const JWTkey = process.env.JWT_SECRET
const OTP = require("../utils/OTP-Generate")
const enquiry = require('../Model/enquiry');
const Order = require("../Model/ShoppingCartOrderModel");
exports.sendOtp = async (req, res) => {
        try {
                const Data = await driver.findOne({ phone: req.body.phone, role: "collectionBoy" })
                if (!Data) {
                        const otp = await otpHelper.generateOTP(4);
                        const data = await driver.create({ phone: req.body.phone, otp: otp, });
                        return res.status(200).json({ otp: data.otp, })
                } else {
                        const otp = await otpHelper.generateOTP(4);
                        const data = await driver.updateOne({ _id: Data._id }, { otp: otp }, { new: true });
                        return res.status(200).json({ otp: otp, })
                }
        } catch (error) {
                console.log(error);
                throw error;
        }
}
exports.accountVerificationOTP = async (req, res, next) => {
        try {
                const user = await driver.findOne({ otp: req.body.otp, role: "collectionBoy" })
                console.log("user", user)
                if (!user) {
                        return next(new ErrorHander("Invalid OTP!", 400))
                }
                const token = jwt.sign({ user_id: user._id }, JWTkey,);
                return res.status(200).json({ token: token, Id: user._id })
        } catch (err) {
                console.log(error)
                return res.status(400).json({ message: err.message })
        }
};
exports.createCollectionBoy = async (req, res, next) => {
        try {
                const { name, email, phone } = req.body;
                let findDriver = await driver.findOne({ email, phone, role: "collectionBoy" });
                if (findDriver) {
                        return res.status(409).json({ data: {}, message: "Already exist.", status: 409 });
                } else {
                        const otp = OTP.generateOTP();
                        const Driver = await driver.create({ name, email, phone, otp, role: "collectionBoy" });
                        if (Driver) {
                                return res.status(201).json({ data: Driver, message: "Registration successfully", status: 200 });
                        }
                }
        } catch (error) {
                return res.status(500).json({ message: error.message });
        }
        next();
}
exports.AddCollectionBoyDetails = async (req, res) => {
        try {
                const Data1 = await driver.findOne({ _id: { $ne: req.params.id }, email: req.body.email, role: "collectionBoy" })
                if (Data1) {
                        return res.status(201).json({ message: "Email is Already regtration" })
                }
                const Data = await driver.findOne({ _id: { $ne: req.params.id }, email: req.body.email, role: "collectionBoy" })
                if (Data) {
                        return res.status(201).json({ message: "Email is Already regtration" })
                }
                let obj = {
                        name: req.body.name || Data1.name,
                        email: req.body.email || Data1.email,
                        image: req.body.image || Data1.image,
                }
                const data = await driver.findOneAndUpdate({ _id: req.params.id }, { $set: obj }, { new: true });
                return res.status(200).json({ success: true, details: data })
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.AllCollectionBoys = async (req, res) => {
        try {
                const Data = await driver.find({ role: "collectionBoy" })
                if (Data.length == 0) {
                        return res.status(201).json({ message: "No Data Found " })
                } else {
                        return res.status(200).json({ message: Data })
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.DeleteCollectionBoy = async (req, res) => {
        try {
                await driver.findByIdAndDelete({ _id: req.params.id });
                return res.status(200).json({ message: "CollectionBoy Deleted ", })
        } catch (err) {
                console.log(err);
                return res.status(400).json({ message: "ok", error: err.message })
        }
}
exports.getProfile = async (req, res) => {
        try {
                const Data = await driver.findOne({ _id: req.params.id, role: "collectionBoy" })
                if (!Data) {
                        return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                } else {
                        return res.status(200).json({ success: true, message: "Profile found successfully", details: Data })
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.addEnquiry = async (req, res) => {
        try {
                const Data = await driver.findOne({ _id: req.params.id, role: "collectionBoy" })
                if (!Data) {
                        return res.status(404).json({ status: 404, message: "User Not found", data: {} })
                } else {
                        let obj = { driverId: Data._id, name: req.body.name, mobile: req.body.mobile, address: req.body.address, startDate: req.body.startDate, products: req.body.products }
                        const Driver = await enquiry.create(obj);
                        if (Driver) {
                                return res.status(200).json({ status: 200, message: "Enquiry create successfully", data: Driver });
                        }
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.assignDriverToCollectionBoy = async (req, res) => {
        try {
                const userData = await driver.findById({ _id: req.body.collectionBoyId, role: "collectionBoy" })
                if (!userData) {
                        return res.status(500).json({ message: "User not found " })
                } else {
                        const Data = await driver.findOne({ _id: req.body.driverId, role: "driver" })
                        if (!Data) {
                                return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                        }
                        const userData12 = await User.find({ driverId: req.body.driverId })
                        if (userData12) {
                                for (let i = 0; i < userData12.length; i++) {
                                        let update = await User.findByIdAndUpdate({ _id: userData12[i]._id }, { $set: { collectionBoyId: req.body.collectionBoyId }, }, { new: true });
                                }
                                return res.status(200).json({ sucess: true, message: "Collection Boy Assigned Successfully" })
                        }
                }
        } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
        }
}
exports.allAssignUserToCollectionBoy = async (req, res) => {
        try {
                const Data = await driver.findOne({ _id: req.params.collectionBoyId, role: "collectionBoy" })
                if (!Data) {
                        return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                }
                const userData12 = await User.findById({ collectionBoyId: req.params.collectionBoyId })
                if (userData12) {
                        return res.status(200).json({ sucess: true, message: update })
                } else {
                        return res.status(200).json({ sucess: false, message: {} })
                }
        } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
        }
}
exports.allCollectedOrder = async (req, res) => {
        try {
                const data = await Order.find({ collectionBoyId: req.params.collectionBoyId, collectedStatus: "Collected" });
                if (data.length == 0) {
                        return res.status(201).json({ message: "No Delivered Order " })
                } else {
                        return res.status(200).json({ message: data })
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.allPendingCollectedOrder = async (req, res) => {
        try {
                const data = await Order.find({ collectionBoyId: req.params.collectionBoyId, collectedStatus: "pending" });
                if (!data || data.length == 0) {
                        return res.status(404).json({ message: "Pending Order not found" })
                }
                return res.status(200).json({ message: data })
        } catch (err) {
                console.log(err);
                return res.status(400).json({ message: err.message })
        }
}