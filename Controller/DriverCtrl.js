const driver = require('../Model/DriverRegistration');
const order = require('../Model/ShoppingCartOrderModel');
const User = require('../Model/userModel')
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
const Address = require("../Model/addressModel");
const bankDetails = require("../Model/bankDetails");
const punchInModel = require("../Model/punchIn");
const collectionDeliveryPunchIn = require("../Model/cdPunchIn");
const moment = require('moment')
exports.sendOtp = async (req, res) => {
    try {
        const Data = await driver.findOne({ phone: req.body.phone, role: req.body.role })
        if (!Data) {
            const otp = await otpHelper.generateOTP(4);
            const data = await driver.create({ phone: req.body.phone, otp: otp, });
            return res.status(200).json({ otp: data.otp, })
        } else {
            const otp = await otpHelper.generateOTP(4);
            const data = await driver.findByIdAndUpdate({ _id: Data._id }, { $set: { otp: otp } }, { new: true });
            return res.status(200).json({ otp: otp, data: data._id })
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}
exports.accountVerificationOTP = async (req, res, next) => {
    try {
        const Data = await driver.findOne({ _id: req.params.id })
        if (!Data) {
            return res.status(404).json({ message: 'Not found', })
        } else {
            const user = await driver.findOne({ _id: Data._id, otp: req.body.otp })
            console.log("user", user)
            if (!user) {
                return next(new ErrorHander("Invalid OTP!", 400))
            }
            const token = jwt.sign({ user_id: user._id }, JWTkey,);
            return res.status(200).json({ token: token, user: user })
        }
    } catch (err) {
        console.log(error)
        return res.status(400).json({ message: err.message })
    }
};
exports.reSendOtp = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: req.params.id })
        if (!Data) {
            return res.status(404).json({ message: 'Data not found', })
        } else {
            const otp = await otpHelper.generateOTP(4);
            const data = await driver.findByIdAndUpdate({ _id: Data._id }, { $set: { otp: otp } }, { new: true });
            return res.status(200).json({ otp: otp, data: data._id })
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}
exports.createDriver = async (req, res, next) => {
    try {
        const { phone, role } = req.body;
        let findDriver = await driver.findOne({ phone, role: role });
        if (findDriver) {
            return res.status(409).json({ data: {}, message: "Already exist.", status: 409 });
        } else {
            const otp = OTP.generateOTP();
            const Driver = await driver.create({ phone, otp, role: role });
            if (Driver) {
                return res.status(201).json({ data: Driver, message: "Registration successfully", status: 200 });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    next();
}
exports.getProfile = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: req.params.id })
        if (!Data) {
            return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
        } else {
            return res.status(200).json({ success: true, message: "Profile found successfully", details: Data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.AddDeriverDetails = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: { $ne: req.params.id }, phone: req.body.phone, role: req.body.role })
        if (Data) {
            return res.status(201).json({ message: "Phone is Already registered." })
        } else {
            let image;
            if (req.file) {
                image = req.file.path
            } else {
                image = Data.image
            }
            let obj = {
                name: req.body.name || Data.name,
                gender: req.body.gender || Data.gender,
                phone: req.body.phone || Data.phone,
                image: image,
            }
            const data = await driver.findOneAndUpdate({ _id: req.params.id }, { $set: obj }, { new: true });
            return res.status(200).json({ success: true, details: data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.addEnquiry = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: req.params.id, role: "driver" })
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
exports.getAllTodayEnquiry = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: req.params.id })
        if (!Data) {
            return res.status(404).json({ status: 404, message: "User Not found", data: {} })
        }
        const todayDate = moment().startOf('day').format('YYYY-MM-DD');
        const todayEnquiries = await enquiry.find({ driverId: Data._id, createdAt: { $gte: new Date(todayDate), $lt: moment(todayDate).add(1, 'days').toDate() } });
        if (todayEnquiries.length > 0) {
            return res.status(200).json({ status: 200, message: "Today's enquiries found successfully", data: todayEnquiries });
        } else {
            return res.status(404).json({ status: 404, message: "Today's enquiries not found", data: [] });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.assignUserToDriver = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.body.userId })
        if (!userData) {
            return res.status(500).json({ message: "User not found " })
        } else {
            const Data = await driver.findOne({ _id: req.body.driverId, role: "driver" })
            if (!Data) {
                return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
            }
            let update = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { driverId: req.body.driverId, collectionBoyId: Data.collectionBoyId }, }, { new: true });
            return res.status(200).json({ sucess: true, message: update })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}
exports.unAssignUserToDriver = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.body.userId })
        if (!userData) {
            return res.status(500).json({ message: "User not found " })
        } else {
            const Data = await driver.findOne({ _id: req.body.driverId, role: "driver" })
            if (!Data) {
                return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
            }
            let update = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { driverId: null, collectionBoyId: null }, }, { new: true });
            return res.status(200).json({ sucess: true, message: update })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}
exports.allAssignUserToDriver = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: req.params.driverId, role: "driver" })
        if (!Data) {
            return res.status(201).json({ message: "Driver not found", status: 404, data: {}, })
        }
        const userData12 = await User.find({ driverId: Data._id });
        if (userData12.length > 0) {
            return res.status(200).json({ sucess: true, message: userData12 })
        } else {
            return res.status(200).json({ sucess: false, message: {} })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}
exports.getUserbyId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const users = await User.findById(id);
        if (!users) {
            return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
        }
        const Data = await order.find({ user: users._id }).populate('product user');
        if (Data.length == 0) {
            return res.status(201).json({ message: "No Data Found " })
        }
        return res.status(200).json({ success: true, users, order: Data });
    } catch (error) {
        return res.status(200).json({ error: `Something went wrong with Id: ${req.params}` });
    }
};
exports.createAddress = async (req, res, next) => {
    req.body.driver = req.body.driver;
    const address = await Address.create(req.body);
    return res.status(201).json({ success: true, address, });
};
exports.getAddress = async (req, res, next) => {
    const allAddress = await Address.find({ driver: req.params.driverId });
    res.status(201).json({ success: true, allAddress, });
};
exports.updateAddress = async (req, res, next) => {
    const newAddressData = req.body;
    const address = await Address.findByIdAndUpdate({ _id: req.params.id }, { $set: newAddressData }, { new: true, });
    res.status(201).json({ success: true, address, });
};
exports.deleteAddress = async (req, res, next) => {
    const address = await Address.findById(req.params.id);
    if (!address) {
        return next(new ErrorHander(`Address does not exist with Id: ${req.params.id}`, 400));
    }
    await address.deleteOne();
    res.status(200).json({ success: true, message: "Address Deleted Successfully", });
};
exports.updateBankDetails = async (req, res) => {
    try {
        let user = await driver.findById(req.params.id);
        if (!user) {
            res.status(404).send({ message: "Data not found", status: 404, data: [] });
        } else {
            const data1 = await bankDetails.findOne({ driver: user._id });
            if (data1) {
                let obj = {
                    bankName: req.body.bankName,
                    accountNumber: req.body.accountNumber,
                    holderName: req.body.holderName,
                    upiId: req.body.upiId,
                    type: "bankdetails",
                    ifsc: req.body.ifsc,
                    driver: user._id,
                };
                let update = await bankDetails.findByIdAndUpdate({ _id: data1._id }, obj, { new: true, });
                res.status(200).send({ message: "Data update successfully", status: 200, data: update, });
            } else {
                let obj = {
                    bankName: req.body.bankName,
                    accountNumber: req.body.accountNumber,
                    holderName: req.body.holderName,
                    upiId: req.body.upiId,
                    ifsc: req.body.ifsc,
                    driver: user._id,
                };
                console.log(obj);
                const address = await bankDetails.create(obj);
                res.status(200).send({ message: "Data saved successfully", status: 200, data: address, });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", status: 500 });
    }
};
exports.getBankDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const banks = await bankDetails.find({ driver: userId });
        if (!banks) {
            return res.status(404).send({ message: "Bank details not found for the user", status: 404, data: {}, });
        }
        return res.status(200).send({ message: "Bank details found successfully", status: 200, data: banks, });
    } catch (error) {
        res.status(500).json({ error: "Failed to get user bank details" });
    }
};
exports.updateDocument = async (req, res) => {
    try {
        const existingUser = await bankDetails.findOne({ driver: req.params.id });
        if (!existingUser) {
            return res.status(404).json({ msg: "User not found" });
        }
        req.body.drivingLicense = req.file.path;
        const user = await bankDetails.findOneAndUpdate({ _id: existingUser._id }, { $set: { drivingLicense: req.body.drivingLicense, completeProfile: true }, }, { new: true });
        return res.status(200).json({ msg: "Profile updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.DriverAllOrder = async (req, res) => {
    try {
        const Data = await order.find({ driverId: req.params.id });
        if (Data.length == 0) {
            return res.status(201).json({ message: "No Data Found " })
        }
        return res.status(200).json({ sucess: true, message: Data })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.DriverSingleOrder = async (req, res) => {
    const Id = req.params.id
    try {
        const Data = await order.findById(Id).populate('user product');
        if (!Data) {
            return res.status(201).json({ message: "No Data Found " })
        }
        return res.status(200).json({ sucess: true, message: Data })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.GetPriceByDriverId = async (req, res) => {
    try {
        const data = await order.find({ driverId: req.params.driverId });
        console.log(data)
        const Data = data.map(d => {
            return result = { price: d.price, orderId: d._id, products: d.order.products }
        })
        let total = 0;
        for (let i = 0; i < Data.length; i++) {
            (total) += parseInt(Data[i].price)
        }
        console.log(total)
        return res.status(200).json({ message: Data, total: total })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
}
exports.DeliveredOrder = async (req, res) => {
    try {
        await order.updateOne({ _id: req.params.id }, { delivered: true, orderStatus: "Deliverd" }, { new: true })
        return res.status(200).json({ message: "Delivered " })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}
exports.reasonOfReduceQuantity = async (req, res) => {
    try {
        const driverData = await order.findOne({ _id: req.params.id })
        driverData.reasonOfReduce = req.body.reasonOfReduce;
        driverData.quantity = req.body.quantity;
        driverData.total = req.body.quantity * driverData.unitPrice,
            driverData.amountToBePaid = (req.body.quantity * driverData.unitPrice) + driverData.shippingPrice,
            driverData.save();
        return res.status(200).json({ message: "ok", result: driverData })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.logout = async (req, res, next) => {
    res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true, });
    res.status(200).json({ success: true, message: "Logged Out", });
};
exports.AllDrivers = async (req, res) => {
    try {
        const Data = await driver.find({ role: "driver" })
        if (Data.length == 0) {
            return res.status(201).json({ message: "No Data Found " })
        } else {
            return res.status(200).json({ message: Data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.driverCompleted = async (req, res) => {
    try {
        const data = await order.find({ driverId: req.params.driverId, orderStatus: "Deliverd" }).populate('user product');
        if (data.length == 0) {
            return res.status(201).json({ message: "No Delivered Order " })
        } else {
            return res.status(200).json({ message: data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.driverCanceledOrder = async (req, res) => {
    try {
        const data = await order.find({ driverId: req.params.driverId, canceled: "canceled" }).populate('user product');
        if (data.length == 0) {
            return res.status(201).json({ message: "No canceled Order" })
        } else {
            return res.status(200).json({ message: data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.pickUpBottleOrder = async (req, res) => {
    try {
        const data = await order.find({ driverId: req.params.driverId, productType: "Bottle" }).populate('user product');
        if (data.length == 0) {
            return res.status(201).json({ message: "No Delivered Order " })
        } else {
            return res.status(200).json({ message: data })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.ChangePickUpBottleStatus = async (req, res) => {
    try {
        const driverData = await order.findOne({ _id: req.params.id })
        driverData.pickUpBottleQuantity = req.body.pickUpBottleQuantity;
        driverData.commentOnPickUpBottle = req.body.commentOnPickUpBottle
        driverData.save();
        return res.status(200).json({ message: "ok", result: driverData })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.submitPickUpBottle = async (req, res) => {
    try {
        const driverData = await order.findOne({ _id: req.params.id })
        driverData.isPickUpBottle = true;
        driverData.save();
        return res.status(200).json({ message: "ok", result: driverData })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.PendingOrder = async (req, res) => {
    try {
        const data = await order.find({ $and: [{ driverId: req.params.id }, { orderStatus: "pending" }] }).populate('user product');
        if (!data || data.length == 0) {
            return res.status(404).json({ message: "Pending Order not found" })
        }
        return res.status(200).json({ message: data })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
}
exports.getTodayOrder = async (req, res) => {
    try {
        let total = 0;
        const data = await order.find({ $and: [{ driverId: req.params.id }, { orderStatus: "pending" }] }).populate('product');
        if (!data || data.length == 0) {
            return res.status(404).json({ message: "Pending Order not found" })
        }
        for (let i = 0; i < data.length; i++) {
            total = total + data[i].quantity
        }
        return res.status(200).json({ message: { data, total } })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
}
// exports.AcceptOrder = async (req, res) => {
//     try {
//         const data = await order.find({ $and: [{ driverId: req.params.id }, { status: "Accept" }] });
//         console.log(data)
//         return res.status(200).json({ message: data })
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ message: err.message })
//     }
// }
exports.ChangeStatus = async (req, res) => {
    try {
        const driverData = await order.findOne({ _id: req.params.id })
        driverData.orderStatus = req.body.status
        driverData.save();
        return res.status(200).json({ message: "ok", result: driverData })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.DeleteDriver = async (req, res) => {
    try {
        await driver.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ message: "Driver Deleted ", })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "ok", error: err.message })
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
exports.startDelivery = async (req, res) => {
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
exports.endDelivery = async (req, res) => {
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

// exports.DeleteAssignOrder = async (req, res) => {
//     try {
//         await order.findByIdAndDelete({ _id: req.params.id });
//         return res.status(200).json({ message: "Assign Order Deleted " })
//     } catch (err) {
//         return res.status(400).json({ message: err.message })
//     }
// }
// exports.AssignOrdertoDriver = async (req, res) => {
//     try {
//         const orderData = await order.findById({ _id: req.body.orderId });
//         const productId = orderData.products[0].product;
//         const productData = await product.findOne({ _id: productId });
//         const userData = await User.findById({ _id: orderData.user })
//         if (!orderData) {
//             return res.status(500).json({ message: "Order not found " })
//         } else {
//             const userData12 = await assignUserToDriver.findById({ userId: orderData.user, driverId: req.body.driverId })
//             if (userData12) {
//                 await assignUserToDriver.findByIdAndUpdate({ _id: userData12._id }, { $set: { userId: orderData.user, driverId: req.body.driverId }, }, { new: true });
//             } else {
//                 await assignUserToDriver.create({ userId: orderData.user, driverId: req.body.driverId, });
//             }
//             const data = {
//                 orderId: req.body.orderId,
//                 driverId: req.body.driverId,
//                 image: productData.images[0].img,
//                 price: orderData.amountToBePaid,
//                 returnitem: req.body.returnitem,
//                 pickuporder: req.body.dilverdAddress,
//                 payment: req.body.payment,
//                 useraddress: orderData.address,
//                 username: userData.name,
//                 userMobile: userData.phone
//             }
//             const DOrder = await order.create(data);
//             return res.status(200).json({ sucess: true, message: DOrder })
//         }
//     } catch (err) {
//         console.log(err)
//         return res.status(400).json({ message: err.message })
//     }
// }
// exports.DriverAccept = async (req, res) => {
//     try {
//         const data = await order.findOneAndUpdate({ _id: req.params.id }, { status: "Accept" }, { new: true },)
//         return res.status(200).json({ message: "Accepted" })
//     } catch (err) {
//         return res.status(400).json({ message: err.message })
//     }
// }
// exports.DriverReject = async (req, res) => {
//     try {
//         const Data = await order.findById({ _id: req.params.id })
//         if (!Data) {
//             return res.status(500).json({ message: "Driver_Order ID is not found " })
//         }
//         const data = await order.findOneAndUpdate({ _id: req.params.id }, { status: "Reject" }, { new: true },)
//         const RData = await rejectOrder.create({ driverId: Data.driverId, reasons: req.body.reason })
//         return res.status(200).json({ message: "Reject" })
//     } catch (err) {
//         return res.status(400).json({ message: err.message })
//     }
// }