const Order = require("../Model/ShoppingCartOrderModel");
const logs = require("../Model/logs");
const Product = require("../Model/productModel");
const Subscription = require("../Model/subscriptionModel");
const User = require("../Model/userModel");
const moment = require('moment');
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Address = require("../Model/addressModel");
const cutOffTime = require('../Model/cutOffTime');
const cronJob = require('cron').CronJob;
///////////////////// create order morningOrder///////////////////////////
new cronJob('*/30 * * * * *', async function () {
  console.log('Alternate morningOrder Cron job executed at:', new Date());
  let findState = await Subscription.find({ cutOffOrderType: "morningOrder", type: "Alternate", orderCreateTill: { $gte: moment().startOf('day').toDate(), $lte: moment().endOf('day').toDate() }, firstTimeOrder: false, }).populate([{ path: 'userId', populate: { path: "addressId" } }, { path: 'product' }]);
  if (findState.length > 0) {
    for (let i = 0; i < findState.length; i++) {
      const startDate = new Date(findState[i].startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      let push = [];
      for (; startDate <= endDate; startDate.setDate(startDate.getDate() + findState[i].alternateDay)) {
        let findData = await Order.findOne({ subscription: findState[i]._id, user: findState[i].userId._id, product: findState[i].product._id, startDate: startDate, orderType: "Subscription" });
        if (!findData) {
          push.push(new Date(startDate));
        }
      }
      console.log(push)
      if (push.length == 0) {
        let findState1 = await Subscription.findByIdAndUpdate({ _id: findState[i]._id }, { $set: { orderCreateTill: endDate, firstTimeOrder: true, } }, { new: true });
      } else {
        await createOrder(push, findState[i]._id)
      }
    }
  }
}).start()
// }).stop()
///////////////////// create order eveningOrder///////////////////////////
new cronJob('*/30 * * * * *', async function () {
  console.log('Alternate eveningOrder Cron job executed at:', new Date());
  let findState = await Subscription.find({ cutOffOrderType: "eveningOrder", type: "Alternate", firstTimeOrder: false, orderCreateTill: { $gte: moment().startOf('day').toDate(), $lte: moment().endOf('day').toDate() } }).populate([{ path: 'userId', populate: { path: "addressId" } }, { path: 'product' }]);
  if (findState.length > 0) {
    for (let i = 0; i < findState.length; i++) {
      const startDate = new Date(findState[i].startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      let push = [];
      for (; startDate <= endDate; startDate.setDate(startDate.getDate() + findState[i].alternateDay)) {
        let findData = await Order.findOne({ subscription: findState[i]._id, user: findState[i].userId._id, product: findState[i].product._id, startDate: startDate, orderType: "Subscription" });
        if (!findData) {
          push.push(new Date(startDate));
        }
      }
      if (push.length == 0) {
        let findState1 = await Subscription.findByIdAndUpdate({ _id: findState[i]._id }, { $set: { orderCreateTill: endDate, firstTimeOrder: true, } }, { new: true });
      } else {
        await createOrder(push, findState[i]._id)
      }
    }
  }
}).start()
// }).stop()
async function createOrder(push, subscriptionId) {
  try {
    let findState = await Subscription.findById({ _id: subscriptionId }).populate([{ path: 'userId', populate: { path: "addressId" } }, { path: 'product' }]);
    if (findState) {
      console.log(findState)
      for (let i = 0; i < push.length; i++) {
        if (findState.product.type == "Bottle") {
          pickUpBottleQuantity = findState.quantity;
          isPickUpBottle = false;
        } else {
          pickUpBottleQuantity = 0;
          isPickUpBottle = true;
        }
        let obj = {
          subscription: findState._id,
          user: findState.userId._id,
          driverId: findState.userId.driverId,
          collectionBoyId: findState.userId.collectionBoyId,
          address2: findState.userId.addressId._id ? findState.userId.addressId.address2 : undefined,
          houseNumber: findState.userId.addressId._id ? findState.userId.addressId.houseNumber : undefined,
          street: findState.userId.addressId._id ? findState.userId.addressId.street : undefined,
          city: findState.userId.addressId._id ? findState.userId.addressId.city : undefined,
          pinCode: findState.userId.addressId._id ? findState.userId.addressId.pinCode : undefined,
          landMark: findState.userId.addressId._id ? findState.userId.addressId.landMark : undefined,
          unitPrice: findState.price,
          product: findState.product._id,
          companyName: findState.product.companyName,
          quantity: findState.quantity,
          total: findState.quantity * findState.price,
          ringTheBell: findState.ringTheBell,
          instruction: findState.instruction,
          pickUpBottleQuantity: pickUpBottleQuantity,
          productType: findState.product.type,
          isPickUpBottle: isPickUpBottle,
          discount: 0,
          shippingPrice: 0,
          startDate: push[i],
          cutOffOrderType: findState.cutOffOrderType,
          amountToBePaid: (findState.quantity * findState.price),
          collectedAmount: (findState.quantity * findState.price),
          orderType: "Subscription",
          mode: findState.userId.paymentMode,
          subscriptionStatus: "start"
        };
        console.log(obj)
        let findData = await Order.findOne({ subscription: findState._id, user: findState.userId._id, product: findState.product._id, startDate: push[i] });
        if (findData) {
          console.log("666")
        } else {
          console.log("364")
          const address = await Order.create(obj);
          console.log(address)
        }
      }
    }
  } catch (error) {
    console.log("Slots error.", error);
  }
}
////////////////////////////////// after 1 month daily one /////// morningOrder////////////////
new cronJob('* * * * * *', async function () {
  console.log('Alternate morningOrder after 1 month Cron job executed at:', new Date());
  const currentDate = moment().utc();
  let findState = await Subscription.find({ cutOffOrderType: "morningOrder", type: "Alternate", firstTimeOrder: true }).populate([{ path: 'userId', populate: { path: "addressId" } }, { path: 'product' }]);
  if (findState.length > 0) {
    for (let i = 0; i < findState.length; i++) {
      const startDate = new Date(findState[i].orderCreateTill);
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate());
      let push = [];
      console.log("======================================================", startDate)
      for (; startDate <= endDate; startDate.setDate(startDate.getDate() + findState[i].alternateDay)) {
        const date = new Date(startDate);
        if (date < currentDate) {
          push.push(new Date(startDate));
        }
      }
      console.log(push)
      if (push.length == 1) {
        await createOrder1(push, findState[i]._id)
      }
    }
  }
}).start();
// }).stop()
async function createOrder1(push, subscriptionId) {
  try {
    let findState = await Subscription.findById({ _id: subscriptionId }).populate([{ path: 'userId', populate: { path: "addressId" } }, { path: 'product' }]);
    if (findState) {
      console.log(findState)
      for (let i = 0; i < push.length; i++) {
        if (findState.product.type == "Bottle") {
          pickUpBottleQuantity = findState.quantity;
          isPickUpBottle = false;
        } else {
          pickUpBottleQuantity = 0;
          isPickUpBottle = true;
        }
        let obj = {
          subscription: findState._id,
          user: findState.userId._id,
          driverId: findState.userId.driverId,
          collectionBoyId: findState.userId.collectionBoyId,
          address2: findState.userId.addressId._id ? findState.userId.addressId.address2 : undefined,
          houseNumber: findState.userId.addressId._id ? findState.userId.addressId.houseNumber : undefined,
          street: findState.userId.addressId._id ? findState.userId.addressId.street : undefined,
          city: findState.userId.addressId._id ? findState.userId.addressId.city : undefined,
          pinCode: findState.userId.addressId._id ? findState.userId.addressId.pinCode : undefined,
          landMark: findState.userId.addressId._id ? findState.userId.addressId.landMark : undefined,
          unitPrice: findState.price,
          product: findState.product._id,
          companyName: findState.product.companyName,
          quantity: findState.quantity,
          total: findState.quantity * findState.price,
          ringTheBell: findState.ringTheBell,
          instruction: findState.instruction,
          pickUpBottleQuantity: pickUpBottleQuantity,
          productType: findState.product.type,
          isPickUpBottle: isPickUpBottle,
          discount: 0,
          shippingPrice: 0,
          startDate: push[i],
          cutOffOrderType: findState.cutOffOrderType,
          amountToBePaid: (findState.quantity * findState.price),
          collectedAmount: (findState.quantity * findState.price),
          orderType: "Subscription",
          mode: findState.userId.paymentMode,
          subscriptionStatus: "start"
        };
        console.log(obj)
        let findData = await Order.findOne({ subscription: findState._id, user: findState.userId._id, product: findState.product._id, startDate: push[i] });
        if (findData) {
          console.log("666")
        } else {
          console.log("364")
          const address = await Order.create(obj);
          if (address) {
            let findState1 = await Subscription.findByIdAndUpdate({ _id: findState._id }, { $set: { orderCreateTill: push[i], firstTimeOrder: true, } }, { new: true });
          }
        }
      }
    }
  } catch (error) {
    console.log("Slots error.", error);
  }
}
////////////////////////////////// after 1 month daily one /////// eveningOrder ///////////////
new cronJob('* * * * * *', async function () {
  console.log('Alternate eveningOrder after 1 month Cron job executed at:', new Date());
  const currentDate = moment().utc();
  let findState = await Subscription.find({ cutOffOrderType: "eveningOrder", type: "Alternate", firstTimeOrder: true }).populate([{ path: 'userId', populate: { path: "addressId" } }, { path: 'product' }]);
  if (findState.length > 0) {
    for (let i = 0; i < findState.length; i++) {
      const startDate = new Date(findState[i].orderCreateTill);
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate());
      let push = [];
      console.log("======================================================", startDate)
      for (; startDate <= endDate; startDate.setDate(startDate.getDate() + findState[i].alternateDay)) {
        const date = new Date(startDate);
        if (date < currentDate) {
          push.push(new Date(startDate));
        }
      }
      console.log(push)
      if (push.length == 1) {
        await createOrder1(push, findState[i]._id)
      }
    }
  }
}).start();
// }).stop()
