const driver = require('../Model/DriverRegistration');
const order = require('../Model/ShoppingCartOrderModel');
const User = require('../Model/userModel')
const jwt = require("jsonwebtoken");
const otpHelper = require("../utils/OTP-Generate");
const { error } = require('console');
const JWTkey = process.env.JWT_SECRET
const OTP = require("../utils/OTP-Generate")
const enquiry = require('../Model/enquiry');
const Order = require("../Model/ShoppingCartOrderModel");
const punchInModel = require("../Model/punchIn");
const collectionDeliveryPunchIn = require("../Model/cdPunchIn");
const Address = require("../Model/addressModel");
const collectedAmount = require("../Model/collectedAmount");
const moment = require('moment')
const axios = require('axios');
const username = 'GIRORGANIC';
const password = 'Girorganic@789';
const from = 'GIRORG';
const orderTransaction = require("../Model/orderTransaction");
const indiaDltContentTemplateId = '1207170970346789539';
const indiaDltPrincipalEntityId = '1201162297097138491';
exports.sendOtp = async (req, res) => {
        try {
                const Data = await driver.findOne({ phone: req.body.phone, role: "collectionBoy" })
                if (!Data) {
                        return res.status(404).json({ data: {}, message: "User not found.", status: 404 });
                        // const otp = await otpHelper.generateOTP(4);
                        // const to = `91${req.body.phone}`;
                        // const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
                        // const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
                        // await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
                        // const data = await driver.create({ phone: req.body.phone, otp: otp, });
                        // return res.status(200).json({ otp: data.otp, })
                } else {
                        const otp = await otpHelper.generateOTP(4);
                        // const to = `91${req.body.phone}`;
                        // const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
                        // const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
                        // await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
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
                const token = jwt.sign({ user_id: user._id }, JWTkey, { expiresIn: "365d" });
                return res.status(200).json({ token: token, Id: user._id })
        } catch (err) {
                console.log(error)
                return res.status(400).json({ message: err.message })
        }
};
exports.createCollectionBoy = async (req, res, next) => {
        try {
                const { phone } = req.body;
                let findDriver = await driver.findOne({ phone, role: "collectionBoy" });
                if (findDriver) {
                        return res.status(409).json({ data: {}, message: "Already exist.", status: 409 });
                } else {
                        const otp = OTP.generateOTP();
                        // const to = `91${req.body.phone}`;
                        // const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
                        // const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
                        // await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
                        const Driver = await driver.create({ phone, otp, role: "collectionBoy" });
                        if (Driver) {
                                return res.status(201).json({ data: Driver, message: "Registration successfully", status: 200 });
                        }
                }
        } catch (error) {
                return res.status(500).json({ message: error.message });
        }
        next();
}
exports.createCollectionBoyByAdmin = async (req, res, next) => {
        try {
                const { phone, name } = req.body;
                let findDriver = await driver.findOne({ phone, role: "collectionBoy" });
                if (findDriver) {
                        return res.status(409).json({ data: {}, message: "Already exist.", status: 409 });
                } else {
                        const Driver = await driver.create({ phone, name, role: "collectionBoy" });
                        if (Driver) {
                                return res.status(201).json({ data: Driver, message: "Registration successfully", status: 200 });
                        }
                }
        } catch (error) {
                return res.status(500).json({ message: error.message });
        }
        next();
}
exports.updateCollectionBoyByAdmin = async (req, res) => {
        try {
                const Data1 = await driver.findOne({ _id: req.params.id, role: "collectionBoy" })
                if (!Data1) {
                        return res.status(404).json({ message: "collectionBoy not found" })
                }
                const Data = await driver.findOne({ _id: { $ne: req.params.id }, phone: req.body.phone, role: "collectionBoy" })
                if (Data) {
                        return res.status(201).json({ message: "Phone is Already regtration" })
                }
                let obj = {
                        name: req.body.name || Data1.name,
                        phone: req.body.phone || Data1.phone,
                }
                const data = await driver.findOneAndUpdate({ _id: req.params.id }, { $set: obj }, { new: true });
                return res.status(200).json({ success: true, details: data })
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.UpdateCollectionBoyStatus = async (req, res, next) => {
        try {
                const users = await driver.findById({ _id: req.params.id });
                if (!users) {
                        return next(new ErrorHander(`Driver does not exist with Id: ${req.params.id}`, 400));
                }
                const data = await driver.findByIdAndUpdate({ _id: users._id }, { $set: { status: req.body.status } }, { new: true });
                return res.status(200).json({ success: true, data, });
        } catch (error) {
                return res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
        }
};
exports.AddCollectionBoyDetails = async (req, res) => {
        try {
                const Data1 = await driver.findOne({ _id: req.params.id, role: "collectionBoy" })
                if (!Data1) {
                        return res.status(404).json({ message: "collectionBoy not found" })
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
exports.CollectionBoysWithCollectedAmount = async (req, res) => {
        try {
                const { startDate, endDate } = req.query;
                if (!startDate || !endDate) {
                        const collectionBoys = await driver.find({ role: "collectionBoy" }).populate('driverId')
                        const result = [];
                        for (const collectionBoy of collectionBoys) {
                                const collectedAmounts = await collectedAmount.find({ driverId: collectionBoy._id, })
                                let totalCollectedAmount = 0;
                                collectedAmounts.forEach(amount => {
                                        totalCollectedAmount += parseFloat(amount.amount);
                                });
                                result.push({ collectionBoy, totalCollectedAmount });
                        }
                        return res.status(200).json({ success: true, data: result });
                } else {
                        const startDateTime = new Date(startDate);
                        const endDateTime = new Date(endDate);
                        if (startDateTime >= endDateTime) {
                                return res.status(400).json({ success: false, message: "Start date should be before end date" });
                        }
                        const collectionBoys = await driver.find({ role: "collectionBoy" }).populate('driverId')
                        const result = [];
                        for (const collectionBoy of collectionBoys) {
                                const collectedAmounts = await collectedAmount.find({
                                        driverId: collectionBoy._id,
                                        createdAt: { $gte: startDateTime, $lte: endDateTime }
                                });
                                let totalCollectedAmount = 0;
                                collectedAmounts.forEach(amount => {
                                        totalCollectedAmount += parseFloat(amount.amount);
                                });
                                result.push({ collectionBoy, totalCollectedAmount });
                        }
                        return res.status(200).json({ success: true, data: result });
                }
        } catch (err) {
                return res.status(500).json({ success: false, message: err.message });
        }
}
exports.AllCollectionBoys = async (req, res) => {
        try {
                const Data = await driver.find({ role: "collectionBoy" }).populate('driverId')
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
                        for (let i = 0; i < req.body.driverId.length; i++) {
                                const Data = await driver.findOne({ _id: req.body.driverId[i], role: "driver" })
                                if (!Data) {
                                        return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                                }
                                const userData12 = await User.find({ driverId: req.body.driverId[i] })
                                if (userData12) {
                                        for (let i = 0; i < userData12.length; i++) {
                                                let update = await User.findByIdAndUpdate({ _id: userData12[i]._id }, { $set: { collectionBoyId: req.body.collectionBoyId }, }, { new: true });
                                        }
                                        let update = await driver.findByIdAndUpdate({ _id: userData._id }, { $addToSet: { driverId: req.body.driverId[i] } }, { new: true });
                                }
                        }
                        return res.status(200).json({ sucess: true, message: "Collection Boy Assigned Successfully" })
                }
        } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
        }
}
exports.unAssignDriverToCollectionBoy = async (req, res) => {
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
                                        let update = await User.findByIdAndUpdate({ _id: userData12[i]._id }, { $set: { collectionBoyId: null }, }, { new: true });
                                }
                                let update = await driver.findByIdAndUpdate({ _id: userData._id }, { $pull: { driverId: req.body.driverId } }, { new: true });
                        }
                        return res.status(200).json({ sucess: true, message: "Collection Boy unassigned Successfully" })
                }
        } catch (err) {
                console.log(err)
                return res.status(400).json({ message: err.message })
        }
}
exports.allAssignUserToCollectionBoy = async (req, res) => {
        try {
                const collectionBoyId = req.params.collectionBoyId;
                const collectionBoy = await driver.findOne({ _id: collectionBoyId, role: "collectionBoy" });
                if (!collectionBoy) {
                        return res.status(404).json({ message: "Driver not found", data: {} });
                }
                const searchQuery = req.query.search;
                let query = { collectionBoyId };
                if (searchQuery) {
                        query.$or = [
                                { name: { $regex: searchQuery, $options: "i" } },
                        ];
                        const addressMatches = await Address.find({ $or: [{ address2: { $regex: searchQuery, $options: "i" } }, { country: { $regex: searchQuery, $options: "i" } }] });
                        if (addressMatches.length > 0) {
                                const addressIds = addressMatches.map(address => address._id);
                                query.addressId = { $in: addressIds };
                        }
                }
                const users = await User.find(query).populate('driverId addressId');
                if (users.length > 0) {
                        return res.status(200).json({ success: true, message: users });
                } else {
                        return res.status(200).json({ success: false, message: "No users found matching the search criteria." });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).json({ message: "Server error.", error: err.message });
        }
};
exports.allCollectedOrder = async (req, res) => {
        try {
                const data = await Order.find({ collectionBoyId: req.params.collectionBoyId, collectedStatus: "Collected" }).populate([{ path: 'product', }, { path: 'user', populate: { path: 'addressId' } }]);
                if (data.length == 0) {
                        return res.status(201).json({ message: "No Delivered Order " })
                } else {
                        return res.status(200).json({ message: data })
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.allFeaturedOrder = async (req, res) => {
        try {
                const data = await Order.find({ collectionBoyId: req.params.collectionBoyId, collectedStatus: "featured" }).populate([{ path: 'product', }, { path: 'user', populate: { path: 'addressId' } }]);
                if (data.length == 0) {
                        return res.status(201).json({ message: "No Delivered Order " })
                } else {
                        return res.status(200).json({ message: data })
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.ChangeToFeaturedOrder = async (req, res) => {
        try {
                const driverData = await Order.findOne({ _id: req.params.id })
                let update = await Order.findByIdAndUpdate({ _id: driverData._id }, { $set: { featuredDate: req.body.featuredDate, collectedStatus: "featured" } }, { new: true })
                return res.status(200).json({ message: "ok", result: update })
        } catch (err) {
                console.log(err);
                return res.status(400).json({ error: err.message })
        }
}
exports.allPendingCollectedOrder = async (req, res) => {
        try {
                const data = await Order.find({ collectionBoyId: req.params.collectionBoyId, driverId: req.params.driverId, collectedStatus: "pending" }).populate([{ path: 'product', }, { path: 'user', populate: { path: 'addressId' } }]);
                if (!data || data.length == 0) {
                        return res.status(404).json({ message: "Pending Order not found" })
                }
                return res.status(200).json({ message: data })
        } catch (err) {
                console.log(err);
                return res.status(400).json({ message: err.message })
        }
}
exports.allDriverOfCollectionBoy = async (req, res) => {
        try {
                const collectionBoyId = req.params.collectionBoyId;
                const collectionBoy = await driver.findOne({ _id: collectionBoyId, role: "collectionBoy" }).populate('driverId');
                if (!collectionBoy) {
                        return res.status(404).json({ message: "Driver not found", data: {} });
                }
                if (collectionBoy.driverId.length > 0) {
                        return res.status(200).json({ success: true, message: collectionBoy.driverId });
                } else {
                        return res.status(200).json({ success: false, message: "No users found matching the search criteria." });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).json({ message: "Server error.", error: err.message });
        }
};
exports.ChangeStatus = async (req, res) => {
        try {
                const driverData = await order.findOne({ _id: req.params.id })
                if (!driverData) {
                        return res.status(404).json({ message: "Not found", result: {} })
                }
                let wallet = await User.findOne({ _id: driverData.user });
                if (!wallet) {
                        return res.status(404).json({ message: 'Wallet not found for the user' });
                }
                let id = await reffralCode()
                let pendingAmount = 0, advancedAmount = 0, collectedStatus;
                if (driverData.collectedAmount == Number(req.query.collectedAmount)) {
                        collectedStatus = "Collected";
                }
                if (driverData.collectedAmount > Number(req.query.collectedAmount)) {
                        collectedStatus = "pending";
                        pendingAmount = driverData.collectedAmount - Number(req.query.collectedAmount)
                }
                if (driverData.collectedAmount < Number(req.query.collectedAmount)) {
                        collectedStatus = "Collected"
                        advancedAmount = Number(req.query.collectedAmount) - driverData.collectedAmount;
                }
                let obj = {
                        collectedAmount: driverData.collectedAmount - Number(req.query.collectedAmount),
                        paymentMode: req.query.paymentMode1,
                        collectedStatus: collectedStatus
                }
                let order1 = [];
                order1.push(driverData._id)
                let obj1 = {
                        user: wallet._id,
                        collectionBoyId: wallet.collectionBoyId,
                        id: id,
                        order: order1,
                        pendingAmount: pendingAmount,
                        advancedAmount: advancedAmount,
                        orderAmount: driverData.amountToBePaid,
                        paidAmount: req.query.collectedAmount,
                        Status: "Paid"
                }
                let update = await order.findByIdAndUpdate({ _id: driverData._id }, { $set: obj }, { new: true })
                if (update) {
                        await orderTransaction.create(obj1);
                        return res.status(200).json({ message: "ok", result: update })
                }
        } catch (err) {
                console.log(err);
                return res.status(400).json({ error: err.message })
        }
}
exports.attendanceMark = async (req, res) => {
        try {
                let user = await driver.findOne({ _id: req.params.id });
                if (!user) {
                        return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                } else {
                        var currDate = new Date();
                        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        let hour = currDate.getHours();
                        let minute = currDate.getMinutes();
                        let second = currDate.getSeconds();
                        let year = currDate.getFullYear();
                        let month = currDate.getMonth() + 1;
                        let date = currDate.getDate();
                        let day = weekday[currDate.getDay()];
                        let dateMonth = await dateMonthCalculate(date, month)
                        let fullDate = `${dateMonth}-${year}`
                        let punchIn = await hourCalculate(hour, minute, second);
                        let attendanceFind = await punchInModel.findOne({ driverId: user._id, date: fullDate });
                        if (attendanceFind) {
                                return res.status(409).json({ message: 'Already' })
                        } else {
                                if (req.body.lat && req.body.long) {
                                        coordinates = [parseFloat(req.body.lat), parseFloat(req.body.long)]
                                        req.body.punchInLocation = { type: "Point", coordinates };
                                }
                                let punchInLocationWord = req.body.punchInLocationWord;
                                let obj = {
                                        driverId: user._id,
                                        currentDate: date,
                                        month: month,
                                        year: year,
                                        date: fullDate,
                                        day: day,
                                        punchIn: punchIn,
                                        punchInLocationWord: punchInLocationWord,
                                        punchInLocation: req.body.punchInLocation,
                                };
                                let result2 = await punchInModel.create(obj);
                                return res.status(200).json({ sucess: true, message: result2 })
                        }
                }
        } catch (error) {
                return res.status(500).json({ message: error.message })
        }
}
exports.driverAttendanceList = async (req, res) => {
        try {
                let user = await driver.findOne({ _id: req.params.id });
                if (!user) {
                        return res.status(404).json({ message: "Driver not found", status: 404, data: {}, })
                } else {
                        var currDate = new Date();
                        let year = currDate.getFullYear();
                        let month = currDate.getMonth() + 1;
                        let query;
                        if ((req.body.month != (null || undefined)) && (req.body.year != (null || undefined))) {
                                query = { month: req.body.month, year: req.body.year, driverId: user._id };
                        } else {
                                query = { month: month, year: year, driverId: user._id };
                        }
                        var options = {
                                page: parseInt(req.body.page) || 1,
                                limit: parseInt(req.body.limit) || 31,
                                sort: { createdAt: -1 },
                        };
                        punchInModel.paginate(query, options, (err, result) => {
                                if (err) {
                                        return res.status(500).json({ message: err.message })
                                } else if (result.docs.length == false) {
                                        return res.status(404).json({ message: "Punch in not found", status: 404, data: {}, })
                                } else {
                                        return res.status(200).json({ message: "Punch in found", status: 200, data: result })
                                }
                        });
                }
        }
        catch (error) {
                return res.status(500).json({ message: error.message })
        }
};
exports.startCollection = async (req, res) => {
        try {
                let user = await driver.findOne({ _id: req.params.id });
                if (!user) {
                        return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                } else {
                        var currDate = new Date();
                        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        let hour = currDate.getHours();
                        let minute = currDate.getMinutes();
                        let second = currDate.getSeconds();
                        let year = currDate.getFullYear();
                        let month = currDate.getMonth() + 1;
                        let date = currDate.getDate();
                        let day = weekday[currDate.getDay()];
                        let dateMonth = await dateMonthCalculate(date, month)
                        let fullDate = `${dateMonth}-${year}`
                        let punchIn = await hourCalculate(hour, minute, second);
                        let attendanceFind = await collectionDeliveryPunchIn.findOne({ driverId: user._id, date: fullDate });
                        if (attendanceFind) {
                                return res.status(409).json({ message: 'Already' })
                        } else {
                                let obj = {
                                        driverId: user._id,
                                        currentDate: date,
                                        month: month,
                                        year: year,
                                        date: fullDate,
                                        day: day,
                                        punchIn: punchIn,
                                };
                                let result2 = await collectionDeliveryPunchIn.create(obj);
                                return res.status(200).json({ sucess: true, message: result2 })
                        }
                }
        } catch (error) {
                return res.status(500).json({ message: error.message })
        }
}
exports.endCollection = async (req, res) => {
        try {
                let user = await driver.findOne({ _id: req.params.id });
                if (!user) {
                        return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
                } else {
                        var currDate = new Date();
                        let hour = currDate.getHours();
                        let minute = currDate.getMinutes();
                        let second = currDate.getSeconds();
                        let year = currDate.getFullYear();
                        let month = currDate.getMonth() + 1;
                        let date = currDate.getDate();
                        let dateMonth = await dateMonthCalculate(date, month)
                        let fullDate = `${dateMonth}-${year}`
                        let punchOut = await hourCalculate(hour, minute, second);
                        let result2 = await collectionDeliveryPunchIn.findOne({ driverId: user._id, date: fullDate, punchType: "Punch In" });
                        if (result2) {
                                let difference = await totalTime1(result2.punchIn, punchOut);
                                let obj = {
                                        punchOut: punchOut,
                                        totalTime: difference.totalTime,
                                        punchType: "Punch Out"
                                }
                                let result3 = await collectionDeliveryPunchIn.findOneAndUpdate({ driverId: user._id, date: fullDate, }, { $set: obj }, { new: true });
                                return res.status(200).json({ status: 200, message: 'End Delivery successfully.', data: result3 })
                        } else {
                                return res.status(404).json({ status: 404, message: 'First Start your Delivery', data: {} })
                        }
                }
        } catch (error) {
                return res.status(500).json({ message: error.message })
        }
}
const totalTime1 = async (punchIn, punchOut) => {
        var startTime = punchIn;
        var endTime = punchOut;
        var todayDate = moment(new Date()).format("MM-DD-YYYY"); //Instead of today date, We can pass whatever date        
        var startDate = new Date(`${todayDate} ${startTime}`);
        var endDate = new Date(`${todayDate} ${endTime}`);
        var timeDiff = Math.abs(startDate.getTime() - endDate.getTime());
        var hh = Math.floor(timeDiff / 1000 / 60 / 60);
        hh = ('0' + hh).slice(-2)
        timeDiff -= hh * 1000 * 60 * 60;
        var mm = Math.floor(timeDiff / 1000 / 60);
        mm = ('0' + mm).slice(-2)
        timeDiff -= mm * 1000 * 60;
        var ss = Math.floor(timeDiff / 1000);
        ss = ('0' + ss).slice(-2)
        let totalTime = `${hh}:${mm}:${ss}`
        let obj = { totalTime: totalTime, hr: hh, min: mm, sec: ss }
        return obj;
};
const dateMonthCalculate = async (date, month) => {
        let month1, date1;
        if (month < 10) {
                month1 = '' + 0 + month;
        } else {
                month1 = month
        }
        if (date < 10) {
                date1 = '' + 0 + date;
        }
        else {
                date1 = date
        }
        let dateMonth = `${date1}-${month1}`;
        return dateMonth;
};
const hourCalculate = async (hour, minute, second) => {
        let hr1, min1, sec1;
        if (hour < 10) {
                hr1 = '' + 0 + hour;
        } else {
                hr1 = hour
        }
        if (minute < 10) {
                min1 = '' + 0 + minute;
        } else {
                min1 = minute
        }
        if (second < 10) {
                sec1 = '' + 0 + second;
        } else {
                sec1 = second
        }
        let punchIn = hr1 + ':' + min1 + ':' + sec1;
        return punchIn;
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}