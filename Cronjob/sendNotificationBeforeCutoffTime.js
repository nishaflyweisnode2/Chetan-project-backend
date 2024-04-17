const notify = require('../Model/notificationModel');
const Order = require("../Model/ShoppingCartOrderModel");
const User = require("../Model/userModel");
const moment = require('moment');
const cutOffTime = require('../Model/cutOffTime');
const cronJob = require('cron').CronJob;
new cronJob('*/30 * * * * *', async function () {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDayStart = new Date(tomorrow.setHours(0, 0, 0, 0));
        const nextDayEnd = new Date(tomorrow.setHours(23, 59, 59, 999));
        const currentTime = new Date();
        const currentHour = currentTime.getHours() + 5;
        const currentHour1 = currentTime.getHours() + 6;
        const currentMinute = currentTime.getMinutes() + 30;
        const currentSecond = currentTime.getSeconds();
        let currentSecond1, currentMinute1;
        if (currentSecond < 10) { currentSecond1 = '' + 0 + currentSecond; } else { currentSecond1 = currentSecond };
        if (currentMinute < 10) { currentMinute1 = '' + 0 + currentMinute; } else { currentMinute1 = currentMinute };
        const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
        const currentTimeString1 = `${currentHour1}:${currentMinute1}:${currentSecond1}`;
        let findCutOffTime = await cutOffTime.findOne({ type: 'morningOrder' });
        if (findCutOffTime) {
                let findUser = await User.find({ role: "User", cutOffTimeId: findCutOffTime._id });
                if (findUser.length > 0) {
                        findUser.forEach(async (user) => {
                                let grandTotal = 0;
                                let findOrder = await Order.find({ userId: user._id, startDate: { $gte: nextDayStart, $lt: nextDayEnd }, cutOffOrderType: findCutOffTime.type });
                                if (findOrder.length > 0) {
                                        findOrder.forEach(async (order) => {
                                                grandTotal += order.amountToBePaid;
                                        })
                                }
                                if (user.balance < grandTotal) {
                                        if (currentTimeString1 > findCutOffTime.time >= currentTimeString) {
                                                let data = {
                                                        message: 'You have not enough balance to order for tomorrow morning. So please recharge your wallet. Otherwise your order will be cancelled.',
                                                        user: user._id,
                                                        for: "user",
                                                };
                                                const Data = await notify.create(data);
                                        }
                                }
                        })
                }
        }
}).start()
// }).stop()
new cronJob('*/30 * * * * *', async function () {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDayStart = new Date(tomorrow.setHours(0, 0, 0, 0));
        const nextDayEnd = new Date(tomorrow.setHours(23, 59, 59, 999));
        const currentTime = new Date();
        const currentHour = currentTime.getHours() + 5;
        const currentMinute = currentTime.getMinutes() + 30;
        const currentSecond = currentTime.getSeconds();
        let currentSecond1, currentMinute1;
        if (currentSecond < 10) { currentSecond1 = '' + 0 + currentSecond; } else { currentSecond1 = currentSecond };
        if (currentMinute < 10) { currentMinute1 = '' + 0 + currentMinute; } else { currentMinute1 = currentMinute };
        const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
        let findCutOffTime = await cutOffTime.findOne({ type: 'morningOrder' });
        if (findCutOffTime) {
                let findUser = await User.find({ role: "User", cutOffTimeId: findCutOffTime._id });
                if (findUser.length > 0) {
                        findUser.forEach(async (user) => {
                                let grandTotal = 0;
                                let findOrder = await Order.find({ userId: user._id, startDate: { $gte: nextDayStart, $lt: nextDayEnd }, cutOffOrderType: findCutOffTime.type });
                                if (findOrder.length > 0) {
                                        findOrder.forEach(async (order) => {
                                                grandTotal += order.amountToBePaid;
                                        })
                                }
                                if (user.balance < grandTotal) {
                                        if (currentTimeString > findCutOffTime.time) {
                                                let findOrder = await Order.find({ userId: user._id, startDate: { $gte: nextDayStart, $lt: nextDayEnd }, cutOffOrderType: findCutOffTime.type });
                                                if (findOrder.length > 0) {
                                                        findOrder.forEach(async (order) => {
                                                                const del = await Order.findByIdAndDelete({ _id: order._id });
                                                        })
                                                }
                                        }
                                }
                        })
                }
        }
}).start()
// }).stop()