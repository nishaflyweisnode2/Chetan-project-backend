const driver = require('../Model/DriverRegistration');
const order = require('../Model/ShoppingCartOrderModel');
const User = require('../Model/userModel')
const jwt = require("jsonwebtoken");
const otpHelper = require("../utils/OTP-Generate");
const JWTkey = process.env.JWT_SECRET
const enquiry = require('../Model/enquiry');
const Address = require("../Model/addressModel");
const bankDetails = require("../Model/bankDetails");
const punchInModel = require("../Model/punchIn");
const collectionDeliveryPunchIn = require("../Model/cdPunchIn");
const walletTransaction = require("../Model/walletTransaction");
const moment = require('moment')
const cutOffTime = require('../Model/cutOffTime');
const Product = require("../Model/productModel");
const notDelivered = require('../Model/notDelivered');
const axios = require('axios');
const username = 'GIRORGANIC';
const password = 'Girorganic@789';
const from = 'GIRORG';
const indiaDltContentTemplateId = '1207170970346789539';
const indiaDltPrincipalEntityId = '1201162297097138491';
exports.sendOtp = async (req, res) => {
    try {
        const Data = await driver.findOne({ phone: req.body.phone, role: req.body.role })
        if (!Data) {
            const otp = await otpHelper.generateOTP(4);
            const to = `91${req.body.phone}`;
            const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
            const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
            await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
            const data = await driver.create({ phone: req.body.phone, otp: otp, });
            return res.status(200).json({ otp: data.otp, })
        } else {
            const otp = await otpHelper.generateOTP(4);
            const to = `91${req.body.phone}`;
            const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
            const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
            await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
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
            const token = jwt.sign({ user_id: user._id }, JWTkey, { expiresIn: "365d" });
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
            const to = `91${Data.phone}`;
            const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
            const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
            await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
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
            const otp = await otpHelper.generateOTP(4);
            const to = `91${phone}`;
            const text = `${otp} is your OTP for GIRORGANIC. Please do not share it with anyone.`;
            const apiUrl = 'http://api.ask4sms.in/sms/1/text/query';
            await axios.get(apiUrl, { params: { username, password, from, to, text, indiaDltContentTemplateId, indiaDltPrincipalEntityId } });
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
exports.createDriverForAdmin = async (req, res, next) => {
    try {
        const { phone, cutOffTimeId, name, area } = req.body;
        let findDriver = await driver.findOne({ phone, role: 'driver' });
        if (findDriver) {
            return res.status(409).json({ data: {}, message: "Already exist.", status: 409 });
        } else {
            const CutOffTimes = await cutOffTime.findById({ _id: cutOffTimeId });
            if (!CutOffTimes) {
                return res.status(404).json({ data: {}, message: "cutOffTime not found.", status: 404 });
            }
            const Driver = await driver.create({ phone, cutOffTimeId, area, name, role: 'driver' });
            if (Driver) {
                return res.status(201).json({ data: Driver, message: "Registration successfully", status: 200 });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    next();
}
exports.assignTimeSlotToDriver = async (req, res) => {
    try {
        const userData = await driver.findById({ _id: req.body.driverId })
        if (!userData) {
            return res.status(500).json({ message: "User not found " })
        } else {
            const CutOffTimes = await cutOffTime.findById({ _id: req.body.cutOffTimeId });
            if (!CutOffTimes) {
                return res.status(404).json({ data: {}, message: "cutOffTime not found.", status: 404 });
            }
            let update = await driver.findByIdAndUpdate({ _id: userData._id }, { $set: { cutOffTimeId: CutOffTimes._id }, }, { new: true });
            return res.status(200).json({ sucess: true, message: update })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
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
exports.updateDriverDetailsFromAdmin = async (req, res) => {
    try {
        const Data = await driver.findOne({ _id: { $ne: req.params.id }, phone: req.body.phone, role: req.body.role })
        if (Data) {
            return res.status(201).json({ message: "Phone is Already registered." })
        } else {
            if (req.body.cutOffTimeId != (null || undefined)) {
                const CutOffTimes = await cutOffTime.findById({ _id: req.body.cutOffTimeId });
                if (!CutOffTimes) {
                    return res.status(404).json({ data: {}, message: "cutOffTime not found.", status: 404 });
                }
                req.body.cutOffTimeId = CutOffTimes._id;
            } else {
                req.body.cutOffTimeId = Data.cutOffTimeId;
            }
            let obj = {
                name: req.body.name || Data.name,
                phone: req.body.phone || Data.phone,
                cutOffTimeId: req.body.cutOffTimeId,
                area: req.body.area || Data.area,
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
            let update = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { driverId: req.body.driverId, collectionBoyId: Data.collectionBoyId, cutOffTimeId: Data.cutOffTimeId, driverAssign: true }, }, { new: true });
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
            let update = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { driverId: null, collectionBoyId: null, cutOffTimeId: null, driverAssign: false }, }, { new: true });
            return res.status(200).json({ sucess: true, message: update })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}
exports.allAssignUserToDriver = async (req, res) => {
    try {
        const driverId = req.params.driverId;
        const collectionBoy = await driver.findOne({ _id: driverId, role: "driver" });
        if (!collectionBoy) {
            return res.status(404).json({ message: "Driver not found", data: {} });
        }
        let query = { driverId };
        const users = await User.find(query).populate('addressId').select();
        if (users.length > 0) {
            const transformedUsers = users.map(user => {
                return {
                    latitude: user.location.coordinates[1],
                    longitude: user.location.coordinates[0],
                    ...user.toObject()
                };
            });
            return res.status(200).json({ success: true, message: transformedUsers });
        } else {
            return res.status(200).json({ success: false, message: "No users found matching the search criteria." });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error.", error: err.message });
    }
};
exports.getUserbyId = async (req, res, next) => {
    const id = req.params.id;
    const users = await User.findById({ _id: id });
    if (!users) {
        return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400));
    }
    const todayDate = moment().startOf('day').format('YYYY-MM-DD');
    const orders = await order.find({ user: users.id, startDate: { $gte: new Date(todayDate), $lt: moment(todayDate).add(1, 'days').toDate() } }).populate('user product');
    if (orders.length > 0) {
        let productQuantities = [], grandTotal = 0, totalQuantities = 0;
        orders.forEach(order => {
            if (order.product) {
                let existingProduct = productQuantities.find(item => item.productId === order.product._id);
                if (existingProduct) {
                    existingProduct.quantity += order.quantity;
                    existingProduct.total += order.total;
                    grandTotal += order.total;
                    totalQuantities += order.quantity;
                } else {
                    productQuantities.push({
                        productId: order.product._id,
                        productName: order.product.name,
                        size: order.size ? order.size : null,
                        product: order.product,
                        quantity: order.quantity,
                        total: order.total
                    });
                    grandTotal += order.total;
                    totalQuantities += order.quantity;
                }
            }
        });
        return res.status(200).json({ success: true, productQuantities, grandTotal: grandTotal, totalPcs: totalQuantities });
    } else {
        return res.status(200).json({ success: false, });
    }
};
exports.createAddress = async (req, res, next) => {
    const users = await driver.findById({ _id: req.body.driver });
    if (!users) {
        return next(new ErrorHander(`Driver does not exist with Id: ${req.body.driver}`, 400));
    }
    const findAddress = await Address.findOne({ driver: req.body.driver });
    if (findAddress) {
        if (req.body.currentLat && req.body.currentLong) {
            let coordinates = [req.body.currentLat, req.body.currentLong];
            req.body.location = { type: "Point", coordinates };
        }
        await Address.findByIdAndUpdate({ _id: findAddress._id }, { $set: req.body }, { new: true });
        await driver.findByIdAndUpdate({ _id: users._id }, { $set: { addressId: findAddress._id } }, { new: true, });
    }
    if (req.body.currentLat && req.body.currentLong) {
        let coordinates = [req.body.currentLat, req.body.currentLong];
        req.body.location = { type: "Point", coordinates };
    }
    const address = await Address.create(req.body);
    await driver.findByIdAndUpdate({ _id: users._id }, { $set: { addressId: address._id } }, { new: true, });
    return res.status(201).json({ success: true, address, });
};
exports.getAddress = async (req, res, next) => {
    const allAddress = await Address.find({ driver: req.params.driverId });
    res.status(201).json({ success: true, allAddress, });
};
exports.updateAddress = async (req, res, next) => {
    if (req.body.currentLat && req.body.currentLong) {
        let coordinates = [req.body.currentLat, req.body.currentLong];
        req.body.location = { type: "Point", coordinates };
    }
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
        const Data = await order.findById({ _id: req.params.id }).populate('user product');
        if (!Data) {
            return res.status(201).json({ message: "No Data Found " })
        } else {
            const wallet = await User.findOne({ _id: Data.user, });
            if (!wallet) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (wallet.paymentMode == "PrePaid") {
                let update = await order.updateOne({ _id: req.params.id }, { delivered: true, orderStatus: "Deliverd" }, { new: true })
                if (update) {

                    if (wallet.balance < update.collectedAmount) {
                        return res.status(200).json({ message: "Delivered " })
                    } else {
                        let balance = parseInt(wallet.balance - Data.collectedAmount);
                        wallet.balance = balance;
                        await wallet.save();
                        console.log(wallet)
                        let id = await reffralCode();
                        let month = new Date(Date.now()).getMonth() + 1;
                        let obj = {
                            user: Data.user,
                            order: Data._id,
                            amount: parseFloat(Data.collectedAmount),
                            month: month,
                            paymentMode: "Online",
                            id: id,
                            type: "Wallet",
                            Status: "Paid",
                        }
                        const faq = await walletTransaction.create(obj);
                        if (faq) {
                            let obj = {
                                collectedAmount: Data.collectedAmount - Number(Data.collectedAmount),
                                paymentMode: "Online",
                                collectedStatus: "Collected"
                            }
                            let update = await order.findByIdAndUpdate({ _id: Data._id }, { $set: obj }, { new: true })
                            return res.status(200).json({ message: "Delivered " })
                        }
                    }

                }
            }
            if (wallet.paymentMode == "PostPaid") {
                await order.updateOne({ _id: req.params.id }, { delivered: true, orderStatus: "Deliverd" }, { new: true })
                return res.status(200).json({ message: "Delivered " })
            }
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}
exports.reasonOfReduceQuantity = async (req, res) => {
    try {
        const driverData = await order.findOne({ _id: req.params.id }).populate('product');
        driverData.reasonOfReduce = req.body.reasonOfReduce;
        driverData.quantity = req.body.quantity;
        driverData.total = req.body.quantity * driverData.product.price;
        driverData.amountToBePaid = (req.body.quantity * driverData.product.price) + driverData.shippingPrice;
        driverData.collectedAmount = (req.body.quantity * driverData.product.price) + driverData.shippingPrice;
        driverData.save();
        let obj = {
            user: driverData.user,
            driverId: driverData.driverId,
            collectionBoyId: driverData.collectionBoyId,
            product: driverData.product,
            orderId: driverData._id,
            quantity: driverData.quantity - req.body.quantity,
            reasonOfReduce: req.body.reasonOfReduce
        }
        await notDelivered.create(obj);
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
exports.getAllDrivers = async (req, res) => {
    try {
        const { search, fromDate, toDate, page, limit } = req.query;
        let query = { role: "driver" };
        if (search) {
            const phoneNumber = Number(search);
            if (!isNaN(phoneNumber)) {
                query.$or = [
                    { "phone": phoneNumber }
                ];
            } else {
                query.$or = [
                    { "name": { $regex: search, $options: "i" } },
                    { "email": { $regex: search, $options: "i" } },
                ];
            }
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
            populate: 'addressId'
        };
        console.log(query)
        let data = await driver.paginate(query, options);
        return res.status(200).json({ status: 200, message: "User data found.", data: data });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.AllDrivers = async (req, res) => {
    try {
        const Data = await driver.find({ role: "driver" }).populate('addressId')
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
exports.getAllDriverCompletedOrderForInvoice = async (req, res, next) => {
    try {
        const { toStartDate, fromStartDate, fromDate, orderStatus, toDate, page, limit, orderType, userId, driverId, companyName } = req.query;
        const users = await User.find({});
        let userData = [];
        let query = {
        };
        if (orderStatus) {
            query.orderStatus = orderStatus;
        }
        if (orderType) {
            query.orderType = orderType;
        }
        if (companyName) {
            query.companyName = companyName
        }
        if (fromStartDate && !toStartDate) {
            query.startDate = { $gte: fromStartDate };
        }
        if (!fromStartDate && toStartDate) {
            query.startDate = { $lte: toStartDate };
        }
        if (driverId) {
            query.driverId = driverId
        }
        if (fromStartDate && toStartDate) {
            query.$and = [
                { startDate: { $gte: fromStartDate } },
                { startDate: { $lte: toStartDate } },
            ]
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
        for (const user of users) {
            console.log(user)
            if (userId) {
                query.user = userId
            } else {
                query.user = (user._id).toString()
            }
            const userOrders = await order.find(query).populate([{ path: 'user', populate: { path: "addressId" } }, { path: 'product' }]).sort({ createdAt: -1 }).limit(Number(limit) || 100);
            if (userOrders.length > 0) {
                userData.push({ user: user.toObject(), orders: userOrders });
            }
        }
        return res.status(200).json({ status: 200, message: "User data found.", data: userData });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message });
    }
};
exports.getAllDriverCompletedOrderForAdmin = async (req, res, next) => {
    try {
        const { toStartDate, fromStartDate, fromDate, toDate, page, limit, orderType, userId, driverId, companyName } = req.query;
        let query = { orderStatus: "Deliverd" };
        if (orderType) {
            query.orderType = orderType;
        }
        if (userId) {
            query.user = userId
        }
        if (driverId) {
            query.driverId = driverId
        }
        if (companyName) {
            query.companyName = companyName
        }
        if (fromStartDate && !toStartDate) {
            query.startDate = { $gte: fromStartDate };
        }
        if (!fromStartDate && toStartDate) {
            query.startDate = { $lte: toStartDate };
        }
        if (fromStartDate && toStartDate) {
            query.$and = [
                { startDate: { $gte: fromStartDate } },
                { startDate: { $lte: toStartDate } },
            ]
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
            limit: Number(limit) || 100,
            sort: { createdAt: -1 },
            populate: [{ path: 'user', populate: { path: "addressId" } }, { path: 'product' }]
        };
        let data = await order.paginate(query, options);
        return res.status(200).json({ status: 200, message: "User data found.", data: data });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.driverCanceledOrder = async (req, res) => {
    try {
        const data = await order.find({ driverId: req.params.driverId, orderStatus: "canceled" }).populate('user product');
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
        console.log(req.body)
        const driverData1 = await order.findOne({ _id: req.params.id })
        if (!driverData1) {
            return res.status(404).json({ message: "Not found", result: {} })
        }
        const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { pickUpBottleQuantity: driverData1.pickUpBottleQuantity - req.body.pickUpBottleQuantity, commentOnPickUpBottle: req.body.commentOnPickUpBottle } }, { new: true })
        return res.status(200).json({ message: "ok", result: driverData })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.ChangePickUpBottleStatusFromAdmin = async (req, res) => {
    try {
        console.log(req.body)
        const driverData1 = await order.findOne({ _id: req.params.id })
        if (!driverData1) {
            return res.status(404).json({ message: "Not found", result: {} })
        }
        if (driverData1.pickUpBottleQuantity > 0) {
            if (driverData1.pickUpBottleQuantity < req.body.pickUpBottleQuantity) {
                const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { pickUpBottleQuantity: 0, isPickUpBottle: true } }, { new: true })
                return res.status(200).json({ message: "ok", result: driverData })
            }
            else if (driverData1.pickUpBottleQuantity == req.body.pickUpBottleQuantity) {
                const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { pickUpBottleQuantity: 0, isPickUpBottle: true } }, { new: true })
                return res.status(200).json({ message: "ok", result: driverData })
            } else {
                if ((driverData1.pickUpBottleQuantity - req.body.pickUpBottleQuantity) <= 0) {
                    const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { pickUpBottleQuantity: 0, isPickUpBottle: true } }, { new: true })
                    return res.status(200).json({ message: "ok", result: driverData })
                }
                if ((driverData1.pickUpBottleQuantity - req.body.pickUpBottleQuantity) > 0) {
                    const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { pickUpBottleQuantity: driverData1.pickUpBottleQuantity - req.body.pickUpBottleQuantity } }, { new: true })
                    return res.status(200).json({ message: "ok", result: driverData })
                }
            }
        }
        if (driverData1.pickUpBottleQuantity == 0) {
            const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { pickUpBottleQuantity: 0, isPickUpBottle: true } }, { new: true })
            return res.status(200).json({ message: "ok", result: driverData })
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.submitPickUpBottle = async (req, res) => {
    try {
        const driverData = await order.findByIdAndUpdate({ _id: req.params.id }, { $set: { isPickUpBottle: true } }, { new: true })
        return res.status(200).json({ message: "ok", result: driverData })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.AllSubmitPickUpBottle = async (req, res) => {
    try {
        const driverData = await order.find({ isPickUpBottle: false }).populate('user product');
        if (driverData.length > 0) {
            return res.status(200).json({ message: "ok", result: driverData })
        } else {
            return res.status(404).json({ message: "not found", result: {} })
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message })
    }
}
exports.PendingOrder = async (req, res) => {
    try {
        const data = await order.find({ driverId: req.params.id, orderStatus: "pending" }).populate([{ path: 'product', }, { path: 'user', populate: { path: 'addressId' } }]);
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
        const driverData1 = await order.findOne({ _id: req.params.id });
        if (!driverData1) {
            return res.status(404).json({ message: "Not found", result: {} })
        }
        const driverData = await order.findByIdAndUpdate({ _id: driverData1._id }, { $set: { orderStatus: req.body.status } }, { new: true })
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
                return res.status(409).json({ message: 'Delivery already started.' })
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
exports.allUserOrder = async (req, res) => {
    try {
        const month = req.query.month;
        if (!moment(month, 'MM').isValid()) {
            return res.status(400).json({ message: "Invalid month format. Please use MM format." });
        }
        const startDate = moment(month, 'MM').startOf('month');
        const endDate = moment(month, 'MM').endOf('month');
        const Data = await order.find({ user: req.params.id, createdAt: { $gte: startDate, $lte: endDate } }).populate('product user collectionBoyId driverId');
        if (Data.length === 0) {
            return res.status(404).json({ message: "No Data Found for the specified month." });
        }
        return res.status(200).json({ success: true, message: Data });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
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
exports.getAllDriverForAdmin = async (req, res, next) => {
    try {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentSecond = currentTime.getSeconds();
        let currentSecond1, currentMinute1;
        if (currentSecond < 10) { currentSecond1 = '' + 0 + currentSecond; } else { currentSecond1 = currentSecond };
        if (currentMinute < 10) { currentMinute1 = '' + 0 + currentMinute; } else { currentMinute1 = currentMinute };
        let cutOffOrderType, cutOffTimeId;
        const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
        const CutOffTimes1 = await cutOffTime.findOne({ type: "morningOrder" });
        const CutOffTimes2 = await cutOffTime.findOne({ type: "eveningOrder" });
        if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffTimeId = CutOffTimes2._id; cutOffOrderType = CutOffTimes2.type; } else {
            cutOffTimeId = CutOffTimes1._id;
            cutOffOrderType = CutOffTimes1.type;
        }
        const drivers = await driver.find({ role: "driver", cutOffTimeId: cutOffTimeId });
        const driversWithTotalQuantity = [];
        for (const driver of drivers) {
            const orders = await order.find({ driverId: driver._id, cutOffOrderType: cutOffOrderType, startDate: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) } });
            let totalQuantity = 0;
            orders.forEach(order => {
                totalQuantity += order.quantity;
            });
            driversWithTotalQuantity.push({ driver, totalQuantity });
        }
        if (driversWithTotalQuantity.length > 0) {
            return res.status(200).json({ success: true, driversWithTotalQuantity });
        } else {
            return res.status(200).json({ success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.DriverAllOrderProductWithQuantity = async (req, res) => {
    try {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentSecond = currentTime.getSeconds();
        let currentSecond1, currentMinute1;
        if (currentSecond < 10) { currentSecond1 = '' + 0 + currentSecond; } else { currentSecond1 = currentSecond };
        if (currentMinute < 10) { currentMinute1 = '' + 0 + currentMinute; } else { currentMinute1 = currentMinute };
        let cutOffOrderType, cutOffTimeId;
        const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
        const CutOffTimes1 = await cutOffTime.findOne({ type: "morningOrder" });
        const CutOffTimes2 = await cutOffTime.findOne({ type: "eveningOrder" });
        if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffTimeId = CutOffTimes2._id; cutOffOrderType = CutOffTimes2.type; } else {
            cutOffTimeId = CutOffTimes1._id;
            cutOffOrderType = CutOffTimes1.type;
        }
        const orders = await order.find({
            driverId: req.params.id,
            cutOffOrderType: cutOffOrderType,
            startDate: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) }
        }).populate('product');
        const productQuantities = [];
        orders.forEach(order => {
            if (order.product) {
                let existingProduct = productQuantities.find(item => item.productId === order.product._id);
                if (existingProduct) {
                    existingProduct.quantity += order.quantity;
                } else {
                    productQuantities.push({
                        productId: order.product._id,
                        productName: order.product.name,
                        quantity: order.quantity
                    });
                }
            }
        });

        return res.status(200).json({ success: true, productQuantities });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}
exports.getAllOrderByProductId = async (req, res, next) => {
    try {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentSecond = currentTime.getSeconds();
        let currentSecond1, currentMinute1;
        if (currentSecond < 10) { currentSecond1 = '' + 0 + currentSecond; } else { currentSecond1 = currentSecond };
        if (currentMinute < 10) { currentMinute1 = '' + 0 + currentMinute; } else { currentMinute1 = currentMinute };
        let cutOffOrderType;
        const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
        const CutOffTimes1 = await cutOffTime.findOne({ type: "morningOrder" });
        const CutOffTimes2 = await cutOffTime.findOne({ type: "eveningOrder" });
        if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffOrderType = CutOffTimes2.type; } else {
            cutOffOrderType = CutOffTimes1.type;
        }
        const findProduct = await Product.findById(req.params.id);
        if (!findProduct) {
            return res.status(404).json({ status: 404, message: "Product not found", });
        }
        const orders = await order.find({ product: findProduct._id, cutOffOrderType: cutOffOrderType, startDate: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) } }).populate({ path: "user", populate: { path: "addressId" } });
        if (orders.length > 0) {
            return res.status(200).json({ success: true, orders });
        } else {
            return res.status(404).json({ success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.activeBlockDriver = async (req, res, next) => {
    try {
        const users = await driver.findById({ _id: req.params.driverId });
        if (!users) {
            return next(new ErrorHander(`Driver does not exist with Id: ${req.params.driverId}`, 400));
        }
        if (users.status == "Block") {
            const updatedTeacher = await driver.findByIdAndUpdate({ _id: users._id }, { $set: { status: "Active" } }, { new: true });
            return res.json({ status: 200, message: "Driver Active successfully.", data: updatedTeacher });
        } else {
            const updatedTeacher = await driver.findByIdAndUpdate({ _id: users._id }, { $set: { status: "Block" } }, { new: true });
            return res.json({ status: 200, message: "Driver Block successfully.", data: updatedTeacher });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
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