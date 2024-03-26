const Order = require("../Model/ShoppingCartOrderModel");
const logs = require("../Model/logs");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
const subscriptionCart = require("../Model/subscriptionCart");
const Subscription = require("../Model/subscriptionModel");
const User = require("../Model/userModel");
const Wallet = require('../Model/myWalletModel');
const moment = require('moment');
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Razorpay = require("razorpay");
const OrderReturn = require('../Model/OrderReturnModel')
const Address = require("../Model/addressModel");
const cutOffTime = require('../Model/cutOffTime');
const cron = require('node-cron');
const razorpayInstance = new Razorpay({ key_id: "rzp_test_8VsYUQmn8hHm69", key_secret: "Xcg3HItXaBuQ9OIpeOAFUgLI", });

//////////////////////////////////////////// user order section ////////////////////////////////////
const checkout = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id, });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      if (user.userStatus == "Approved") {
        if (user.driverAssign == true) {
          let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
          if (!cart) {
            return res.status(400).json({ success: false, msg: "Cart not found or empty." });
          }
          const allAddress = await Address.findById({ _id: user.addressId });
          if (!allAddress) {
            return res.status(404).json({ error: 'Address not found' });
          }
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
          const CutOffTimes = await cutOffTime.findOne({ _id: user.cutOffTimeId });
          if (CutOffTimes) {
            cutOffOrderType = CutOffTimes.type;
          }
          // if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffOrderType = CutOffTimes2.type; } else {
          //   cutOffOrderType = CutOffTimes1.type;
          // }
          let orders = [], pickUpBottleQuantity = 0, isPickUpBottle;
          for (let i = 0; i < cart.products.length; i++) {
            console.log(cart.products[i]);
            if (cart.products[i].product.type == "Bottle") {
              pickUpBottleQuantity = cart.products[i].quantity;
              isPickUpBottle = false;
            } else {
              pickUpBottleQuantity = 0;
              isPickUpBottle = true;
            }
            let obj = {
              user: req.user._id,
              driverId: user.driverId,
              collectionBoyId: user.collectionBoyId,
              address2: allAddress.address2,
              country: allAddress.state,
              state: allAddress.state,
              houseNumber: allAddress.houseNumber,
              street: allAddress.street,
              city: allAddress.city,
              pinCode: allAddress.pinCode,
              landMark: allAddress.landMark,
              unitPrice: cart.products[i].product.price,
              product: cart.products[i].product._id,
              companyName: cart.products[i].product.companyName,
              quantity: cart.products[i].quantity,
              total: cart.products[i].quantity * cart.products[i].product.price,
              ringTheBell: cart.products[i].ringTheBell,
              instruction: cart.products[i].instruction,
              pickUpBottleQuantity: pickUpBottleQuantity,
              productType: cart.products[i].product.type,
              isPickUpBottle: isPickUpBottle,
              discount: 0,
              shippingPrice: 0,
              startDate: cart.products[i].startDate,
              cutOffOrderType: cutOffOrderType,
              amountToBePaid: (cart.products[i].quantity * cart.products[i].product.price),
              collectedAmount: (cart.products[i].quantity * cart.products[i].product.price),
              orderType: "once",
              mode: user.paymentMode
            }
            if (user.paymentMode == "PrePaid") {
              let TotalAmount = (cart.products[i].quantity * cart.products[i].product.price)
              if (user.balance < parseFloat(TotalAmount)) {
                return res.status(403).json({ message: "InSufficent balance." })
              } else {
                const address = await Order.create(obj);
                await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                orders.push(address)
                let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
                await logs.create(obj1);
              }

            }
            if (user.paymentMode == "PostPaid") {
              const address = await Order.create(obj);
              await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
              orders.push(address)
              let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
              await logs.create(obj1);
            }
          }
          if (orders.length > 0) {
            await Cart.findOneAndDelete({ user: req.user._id });
          }
          return res.status(200).json({ success: true, msg: "Order created", orders, });
        } else {
          return res.status(401).json({ message: "You cannot place an order,  delivery boy not assigned." });
        }
      } else if (user.userStatus == "UnApproved") {
        return res.status(401).json({ message: "You cannot place order, as we are not serviceable at provided address." });
      } else {
        return res.status(401).json({ message: 'You cannot place order, Waiting for Amin approval.' });
      }
    }
  } catch (error) {
    next(error);
  }
};
const myOrders = catchAsyncErrors(async (req, res, next) => {
  try {
    const { toStartDate, fromStartDate, fromDate, toDate, page, orderType, limit } = req.query;
    let query = { user: req.user.id };
    if (orderType) {
      query.orderType = orderType;
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
      populate: 'user product'
    };
    let data = await Order.paginate(query, options);
    return res.status(200).json({ status: 200, message: "User data found.", data: data });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
  }
});
const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user product');
  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }
  return res.status(200).json({ success: true, order, });
});
const updateOrderDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const allAddress = await Address.findById({ _id: user.addressId });
    if (!allAddress) {
      return res.status(404).json({ error: 'Address not found' });
    }
    let TotalAmount = 0, total = 0;
    const allOrder = await Order.find({ _id: { $ne: req.params.id }, user: order.user, startDate: { $gte: order.startDate }, startDate: { $lte: order.startDate } });
    if (allOrder.length > 0) {
      for (let i = 0; i < allOrder.products.length; i++) {
        TotalAmount = allOrder[i].price * allOrder[i].quantity;
      }
    }
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
    const CutOffTimes = await cutOffTime.findOne({ _id: user.cutOffTimeId });
    if (CutOffTimes) {
      cutOffOrderType = CutOffTimes.type;
    }
    // if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffOrderType = CutOffTimes2.type; } else {
    //   cutOffOrderType = CutOffTimes1.type;
    // }
    if ((req.body.price != (null || undefined)) && (req.body.quantity != (null || undefined))) {
      TotalAmount = TotalAmount + (req.body.price * req.body.quantity);
      total = (req.body.price * req.body.quantity);
    } else {
      total = order.total;
    }
    if (TotalAmount < 80) {
      return res.status(403).json({ message: "Minimum 80 Rs order on that day." })
    }
    let obj = {
      user: req.user._id,
      driverId: user.driverId,
      collectionBoyId: user.collectionBoyId,
      address2: allAddress.address2,
      country: allAddress.state,
      state: allAddress.state,
      houseNumber: allAddress.houseNumber,
      street: allAddress.street,
      city: allAddress.city,
      pinCode: allAddress.pinCode,
      landMark: allAddress.landMark,
      unitPrice: req.body.price || order.unitPrice,
      size: req.body.size || order.size,
      product: order.product,
      quantity: req.body.quantity || order.quantity,
      total: total,
      ringTheBell: order.ringTheBell,
      instruction: order.instruction,
      pickUpBottleQuantity: order.pickUpBottleQuantity,
      productType: order.product.type,
      isPickUpBottle: order.isPickUpBottle,
      discount: order.discount,
      shippingPrice: order.shippingPrice,
      startDate: order.startDate,
      cutOffOrderType: cutOffOrderType,
      amountToBePaid: total || (order.amountToBePaid),
      collectedAmount: total || (order.collectedAmount),
      orderType: order.orderType,
      mode: order.paymentMode
    }
    let update = await Order.findByIdAndUpdate({ _id: driverData._id }, { $set: obj }, { new: true })
    return res.status(200).json({ success: true, message: "Order successfully updated", data: update });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById({ _id: id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const del = await Order.findByIdAndDelete({ _id: order._id });
    return res.status(201).json({ message: 'Order delete successfully', del });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().populate('user product')
  let totalAmount = 0;
  orders.forEach((orders) => {
    totalAmount += orders.totalPrice;
  });
  return res.status(200).json({ success: true, totalAmount, orders });
});
const updateOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
    if (order.status === "delivered") {
      return next(new ErrorHander("You have already delivered this order", 400));
    }
    if (req.body.status === "shipped") {
      order.status = "shipped";
    }
    if (req.body.status === "canceled") {
      order.status = "canceled";
    }
    if (req.body.status === "outforDelivery") {
      order.status = "Out For Delivery";
    }
    if (req.body.status === "delivered") {
      order.status = "delivered";
      order.deliveredAt = Date.now();
    }
    await order.save();
    return res.status(200).json({
      success: true,
      message: "Order successfully updated"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
const payBills = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const body = { user: req.user._id, paymentStatus: { $ne: "paid" } };
    if (fromDate && toDate) {
      body.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }
    let total = 0, orderIds = [];
    const data = await Order.find(body).populate('product');
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        total = total + data[i].collectedAmount
        orderIds.push(data[i]._id);
        console.log(orderIds);
      }
      return res.status(200).json({ data: data, total, fromDate, toDate, orderIds });
    } else {
      return res.status(404).json({ success: false, data: {} });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};
const payBillStatusUpdate = async (req, res) => {
  try {
    let orders = [];
    for (let i = 0; i < req.body.orderIds.length; i++) {
      const driverData = await Order.findOne({ _id: req.body.orderIds[i] })
      let update = await Order.findByIdAndUpdate({ _id: driverData._id }, { $set: { paymentMode: 'Online', paymentStatus: 'paid', collectedStatus: "Collected" } }, { new: true })
      orders.push(update)
    }
    return res.status(200).json({ message: "ok", result: orders })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message })
  }
};
const returnBottleOrder = async (req, res) => {
  try {
    const data = await Order.find({ user: req.params.userId, productType: "Bottle", isPickUpBottle: false }).populate('user product');
    if (data.length == 0) {
      return res.status(201).json({ message: "No Delivered Order " })
    } else {
      return res.status(200).json({ message: data })
    }
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}
const returnBottleOrderForAdmin = async (req, res) => {
  try {
    const orders = await Order.find({ productType: "Bottle", isPickUpBottle: false }).populate('user product');
    if (orders.length === 0) {
      return res.status(201).json({ message: "No Delivered Order " });
    } else {
      const consolidatedOrders = {};
      orders.forEach(order => {
        const key = `${order.product._id}_${order.user._id}`;
        if (!consolidatedOrders[key]) {
          consolidatedOrders[key] = {
            product: order.product,
            user: order.user,
            quantity: order.quantity,
            pickUpBottleQuantity: order.pickUpBottleQuantity
          };
        } else {
          consolidatedOrders[key].quantity += order.quantity;
          consolidatedOrders[key].pickUpBottleQuantity += order.pickUpBottleQuantity;
        }
      });
      const consolidatedOrdersArray = Object.values(consolidatedOrders);
      return res.status(200).json({ message: consolidatedOrdersArray });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
const createSubscription = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id, });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      if (user.userStatus == "Approved") {
        if (user.driverAssign == true) {
          let cart = await subscriptionCart.findOne({ userId: req.user._id }).populate({ path: "products.product", select: { review: 0 }, });
          if (!cart) {
            return res.status(400).json({ success: false, msg: "Cart not found or empty." });
          }
          const allAddress = await Address.findById({ _id: user.addressId });
          if (!allAddress) {
            return res.status(404).json({ error: 'Address not found' });
          }
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
          const CutOffTimes = await cutOffTime.findOne({ _id: user.cutOffTimeId });
          if (CutOffTimes) {
            cutOffOrderType = CutOffTimes.type;
          }
          // if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffOrderType = CutOffTimes2.type; } else {
          //   cutOffOrderType = CutOffTimes1.type;
          // }
          console.log(cart)
          let orders = [], TotalAmount = 0;
          for (let i = 0; i < cart.products.length; i++) {
            TotalAmount = cart.products[i].price * cart.products[i].quantity;
          }
          if (TotalAmount < 80) {
            return res.status(403).json({ message: "Minimum 80 Rs order only subscribed." })
          }
          for (let i = 0; i < cart.products.length; i++) {
            let obj = {
              userId: req.user._id,
              driverId: user.driverId,
              collectionBoyId: user.collectionBoyId,
              product: cart.products[i].product,
              price: cart.products[i].price,
              size: cart.products[i].size,
              quantity: cart.products[i].quantity,
              startDate: cart.products[i].startDate,
              orderCreateTill: cart.products[i].startDate,
              ringTheBell: cart.products[i].ringTheBell,
              instruction: cart.products[i].instruction,
              days: cart.products[i].days,
              daysWiseQuantity: cart.products[i].daysWiseQuantity,
              type: cart.products[i].type,
              alternateDay: cart.products[i].alternateDay,
              cutOffOrderType: cutOffOrderType,
            }
            console.log(obj)
            const banner = await Subscription.create(obj);
            if (banner) {
              orders.push(banner);
            }
          }
          if (orders.length > 0) {
            await subscriptionCart.findOneAndDelete({ userId: req.user._id });
            let obj1 = { description: `Subscription has been create by ${req.user.name}.`, title: 'Create subscription', user: req.user._id, }
            await logs.create(obj1);
            return res.status(201).json({ message: 'Create subscription successfully', orders });
          } else {
            let obj1 = { description: `Subscription has been create by ${req.user.name}.`, title: 'Create subscription', user: req.user._id, }
            await logs.create(obj1);
            return res.status(201).json({ message: 'Create subscription successfully', orders });
          }
        } else {
          return res.status(401).json({ message: "You cannot place an order,  delivery boy not assigned." });
        }
      } else if (user.userStatus == "UnApproved") {
        return res.status(401).json({ message: "You cannot place order, as we are not serviceable at provided address." });
      } else {
        return res.status(401).json({ message: 'You cannot place order, Waiting for Amin approval.' });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
const pauseSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const order = await Subscription.findById(subscriptionId);
    if (!order) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    const currentDate = new Date().toISOString().split('T')[0];
    if (currentDate >= order.pauseDate && currentDate <= order.resumeDate) {
      order.status = 'pause';
      order.endDate = new Date();
      let findUserOrder = await Order.find({ subscription: subscriptionId, orderType: "Subscription", startDate: { $gte: req.body.pauseDate, $lt: req.body.resumeDate, } });
      if (findUserOrder) {
        for (let i = 0; i < findUserOrder.length; i++) {
          await Order.findByIdAndUpdate({ _id: findUserOrder[i]._id }, { $set: { subscriptionStatus: "pause" } }, { new: true });
        }
      }
    } else {
      order.status = 'start';
    }
    order.pauseDate = req.body.pauseDate;
    order.resumeDate = req.body.resumeDate;
    await order.save();

    return res.status(201).json({ message: 'Subscription status updated successfully', order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update subscription status' });
  }
};
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const order = await Subscription.findById(subscriptionId);
    if (!order) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    let productId;
    if (req.body.productId != (null || undefined)) {
      const findProduct = await Product.findById({ _id: req.body.productId });
      if (!findProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      productId = findProduct._id;
    } else {
      productId = order.product;
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let obj = {
      userId: req.user._id,
      driverId: user.driverId,
      collectionBoyId: user.collectionBoyId,
      product: productId,
      size: req.body.size || order.size,
      price: req.body.price || order.price,
      alternateDay: req.body.alternateDay || order.alternateDay,
      quantity: req.body.quantity || order.quantity,
      startDate: req.body.startDate || order.startDate,
      ringTheBell: req.body.ringTheBell || order.ringTheBell,
      instruction: req.body.instruction || order.instruction,
      days: req.body.days || order.days,
      type: order.type,
      daysWiseQuantity: req.body.daysWiseQuantity || order.daysWiseQuantity,
    }
    const banner = await Subscription.findByIdAndUpdate({ _id: order._id }, { $set: obj }, { new: true });
    let obj1 = {
      description: `Subscription has been update by ${req.user.name}.`,
      title: 'Update subscription',
      user: req.user._id,
    }
    await logs.create(obj1);
    return res.status(201).json({ message: 'Create subscription successfully', banner });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
const getSubscriptionById = async (req, res, next) => {
  const order = await Subscription.findById(req.params.subscriptionId).populate('userId product');
  if (!order) {
    return res.status(404).json({ error: 'Subscription not found' });
  }
  return res.status(200).json({ success: true, order, });
};
const mySubscription = async (req, res, next) => {
  try {
    console.log(req.user)
    const subscriptions = await Subscription.find({ userId: req.user._id }).populate("userId product");
    return res.status(200).json({ subscriptions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get user subscriptions' });
  }
};
const deleteSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const order = await Subscription.findById(subscriptionId);
    if (!order) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    deleteOrderSubscription(subscriptionId)
    const del = await Subscription.findByIdAndDelete(subscriptionId);
    return res.status(201).json({ message: 'Subscription delete successfully', del });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
async function deleteOrderSubscription(subscriptionId) {
  try {
    const currentDate = moment().utc();
    let findUserOrder = await Order.find({ subscription: subscriptionId, orderType: "Subscription", startDate: { $gte: currentDate.startOf('day').toDate() } });
    if (findUserOrder) {
      for (let i = 0; i < findUserOrder.length; i++) {
        await Order.findByIdAndDelete({ _id: findUserOrder[i]._id });
      }
    }
  } catch (error) {
    console.log("562----------------------------", error);
  }
};
/////////////////////////////////////////////////////////// collection boy //////////////////////////
const updateCollectedDate = async (req, res) => {
  try {
    for (let i = 0; i < req.body.orderIds.length; i++) {
      const driverData = await Order.findOne({ _id: req.body.orderIds[i] })
      let update = await Order.findByIdAndUpdate({ _id: driverData._id }, { $set: { collectedDate: req.body.collectedDate, } }, { new: true })
    }
    return res.status(200).json({ message: "ok", result: {} })
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message })
  }
}
const getAllOrdersForAdmin = catchAsyncErrors(async (req, res, next) => {
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
  const today = new Date().toISOString().split('T')[0];
  const orders = await Order.find({ cutOffOrderType: cutOffOrderType, orderType: "Subscription", startDate: { $gte: new Date(`${today}T00:00:00.000Z`), $lte: new Date(`${today}T23:59:59.999Z`) } }).populate('user product');
  if (orders.length > 0) {
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
            product: order.product,
            quantity: order.quantity,
            date: order.startDate,
            cutOffOrderType: cutOffOrderType
          });
        }
      }
    });
    return res.status(200).json({ success: true, productQuantities });
  } else {
    return res.status(200).json({ success: false, });
  }
});
const getAllOneTimeOrdersForAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const { toStartDate, fromStartDate, fromDate, toDate, page, limit, orderType, userId, companyName } = req.query;
    let query = {};
    if (orderType) {
      query.orderType = orderType;
    }
    if (userId) {
      query.user = userId
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
    let data = await Order.paginate(query, options);
    return res.status(200).json({ status: 200, message: "User data found.", data: data });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
  }
});
const getAllOrdersForInvoice = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, fromDate, toDate, page, orderType, limit } = req.query;
    let query = { user: userId };
    if (orderType) {
      query.orderType = orderType;
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
      // populate: 'user product'
      populate: [{ path: 'user', populate: { path: "addressId" } }, { path: 'product' }]
    };
    let data = await Order.paginate(query, options);
    return res.status(200).json({ status: 200, message: "User data found.", data: data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
  }
});
const updateOrderDetailsByAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found with this Id' });
    }
    const user = await User.findOne({ _id: order.user });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let quantity, total, amountToBePaid, collectedAmount, unitPrice;
    if (req.body.price && req.body.quantity) {
      unitPrice = req.body.price || order.unitPrice;
      quantity = req.body.quantity || order.quantity;
      total = (unitPrice * quantity) || order.total;
      amountToBePaid = (req.body.price * req.body.quantity) || (order.amountToBePaid);
      collectedAmount = (req.body.price * req.body.quantity) || (order.collectedAmount);
    } else if (req.body.price && !req.body.quantity) {
      unitPrice = req.body.price || order.unitPrice;
      quantity = order.quantity;
      total = (unitPrice * quantity) || order.total;
      amountToBePaid = (req.body.price * quantity) || (order.amountToBePaid);
      collectedAmount = (req.body.price * quantity) || (order.collectedAmount);
    } else if (!req.body.price && req.body.quantity) {
      unitPrice = order.unitPrice;
      quantity = req.body.quantity || order.quantity;
      total = (unitPrice * quantity) || order.total;
      amountToBePaid = (order.unitPrice * req.body.quantity) || (order.amountToBePaid);
      collectedAmount = (order.unitPrice * req.body.quantity) || (order.collectedAmount);
    } else {
      unitPrice = order.unitPrice;
      quantity = order.quantity;
      total = order.total;
      amountToBePaid = (order.amountToBePaid);
      collectedAmount = (order.collectedAmount);
    }
    if (user.paymentMode == "PrePaid") {
      if (user.balance < parseFloat(amountToBePaid)) {
        return res.status(403).json({ message: "InSufficent balance." })
      } else {
        let obj = {
          user: order.user,
          unitPrice: unitPrice,
          product: order.product,
          quantity: quantity,
          total: total,
          amountToBePaid: amountToBePaid,
          collectedAmount: collectedAmount,
          mode: order.paymentMode
        }
        let update = await Order.findByIdAndUpdate({ _id: order._id }, { $set: obj }, { new: true })
        return res.status(200).json({ success: true, message: "Order successfully updated", data: update });
      }

    } else {
      let obj = {
        user: order.user,
        unitPrice: unitPrice,
        product: order.product,
        quantity: quantity,
        total: total,
        amountToBePaid: amountToBePaid,
        collectedAmount: collectedAmount,
        mode: order.paymentMode
      }
      let update = await Order.findByIdAndUpdate({ _id: order._id }, { $set: obj }, { new: true })
      return res.status(200).json({ success: true, message: "Order successfully updated", data: update });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
const checkoutForAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.body.userId, });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      if (user.userStatus == "Approved") {
        if (user.driverAssign == true) {
          const allAddress = await Address.findById({ _id: user.addressId });
          if (!allAddress) {
            return res.status(404).json({ error: 'Address not found' });
          }
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
          const product = await Product.findById({ _id: req.body.productId })
          let orders = [], pickUpBottleQuantity = 0, isPickUpBottle;
          if (product.type == "Bottle") {
            pickUpBottleQuantity = req.body.quantity;
            isPickUpBottle = false;
          } else {
            pickUpBottleQuantity = 0;
            isPickUpBottle = true;
          }
          let obj = {
            user: user._id,
            driverId: user.driverId,
            collectionBoyId: user.collectionBoyId,
            address2: allAddress.address2,
            country: allAddress.state,
            state: allAddress.state,
            houseNumber: allAddress.houseNumber,
            street: allAddress.street,
            city: allAddress.city,
            pinCode: allAddress.pinCode,
            landMark: allAddress.landMark,
            unitPrice: product.price,
            product: req.body.productId,
            quantity: req.body.quantity,
            total: req.body.quantity * product.price,
            instruction: req.body.instruction,
            pickUpBottleQuantity: pickUpBottleQuantity,
            productType: product.type,
            isPickUpBottle: isPickUpBottle,
            discount: 0,
            shippingPrice: 0,
            startDate: req.body.deliveryDate,
            cutOffOrderType: cutOffOrderType,
            amountToBePaid: (req.body.quantity * product.price) + 0,
            collectedAmount: (req.body.quantity * product.price) + 0,
            orderType: "once",
            mode: user.paymentMode,
          }
          if (user.paymentMode == "PrePaid") {
            let TotalAmount = (req.body.quantity * product.price)
            if (user.balance < parseFloat(TotalAmount)) {
              return res.status(403).json({ message: "InSufficent balance." })
            } else {
              const address = await Order.create(obj);
              await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
              orders.push(address)
              let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
              await logs.create(obj1);
            }

          }
          if (user.paymentMode == "PostPaid") {
            const address = await Order.create(obj);
            await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
            orders.push(address)
            let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
            await logs.create(obj1);
          }
          return res.status(200).json({ success: true, msg: "Order created", orders, });
        } else {
          return res.status(401).json({ message: "You cannot place an order,  delivery boy not assigned." });
        }
      } else if (user.userStatus == "UnApproved") {
        return res.status(401).json({ message: "You cannot place order, as we are not serviceable at provided address." });
      } else {
        return res.status(401).json({ message: 'You cannot place order, Waiting for Amin approval.' });
      }
    }
  } catch (error) {
    next(error);
  }
};











const mySubscriptionOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Subscription.find({ user: req.user._id, }).populate("userId product")
  console.log(orders);
  return res.status(200).json({
    success: true,
    orders,
  });
});
const getAllOrdersVender = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.aggregate([
    {
      $project: {
        orderItems: {
          $filter: {
            input: "$orderItems",
            as: "newOrderItems",
            cond: { "$$newOrderItems.venderId": req.user._id },
          },
        },
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    orders,
  });
});
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}
const getAllSubscription = async (req, res, next) => {
  try {
    const ordersWithSubscription = await Order.find({ subscription: 'Yes' }).populate("user").exec();
    return res.status(200).json({ success: true, orders: ordersWithSubscription });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
// const newOrder = catchAsyncErrors(async (req, res, next) => {
//   const {
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//   } = req.body;

//   // const productIds = orderItems.map((order) => order.product);
//   // let venders = []

//   // for (let i = 0; productIds.length > 0; i++) {
//   //   const product = await Product.findById(productIds[i]);
//   //   const vender = await Vender.aggregate([
//   //     { $match: { _id: product.user } },
//   //     { $project: { _id: 1 } },
//   //   ]);

//   // }

//   const order = await Order.create({
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     paidAt: Date.now(),
//     user: req.user._id,
//   });

// return  res.status(201).json({
//     success: true,
//     order,
//   });
// });

// // get Single Order

// const checkout = async (req, res, next) => {
//   try {
//     let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
//     if (!cart) {
//       return res.status(400).json({ success: false, msg: "Cart not found or empty." });
//     }
//     const user = await User.findOne({ _id: req.user._id });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     const allAddress = await Address.findById({ _id: user.addressId });
//     if (!allAddress) {
//       return res.status(404).json({ error: 'Address not found' });
//     }
//     const currentTime = new Date();
//     const currentHour = currentTime.getHours();
//     const currentMinute = currentTime.getMinutes();
//     const currentSecond = currentTime.getSeconds();
//     let currentSecond1, currentMinute1;
//     if (currentSecond < 10) { currentSecond1 = '' + 0 + currentSecond; } else { currentSecond1 = currentSecond };
//     if (currentMinute < 10) { currentMinute1 = '' + 0 + currentMinute; } else { currentMinute1 = currentMinute };
//     let cutOffOrderType;
//     const currentTimeString = `${currentHour}:${currentMinute1}:${currentSecond1}`;
//     const CutOffTimes1 = await cutOffTime.findOne({ type: "morningOrder" });
//     const CutOffTimes2 = await cutOffTime.findOne({ type: "eveningOrder" });
//     if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffOrderType = CutOffTimes2.type; } else {
//       cutOffOrderType = CutOffTimes1.type;
//     }
//     let orders = [], pickUpBottleQuantity = 0, isPickUpBottle;
//     for (let i = 0; i < cart.products.length; i++) {
//       console.log(cart.products[i]);
//       // if (cart.products[i].orderType == 'once') {
//       if (cart.products[i].product.type == "Bottle") {
//         pickUpBottleQuantity = cart.products[i].quantity;
//         isPickUpBottle = false;
//       } else {
//         pickUpBottleQuantity = 0;
//         isPickUpBottle = true;
//       }
//       let obj = {
//         user: req.user._id,
//         driverId: user.driverId,
//         collectionBoyId: user.collectionBoyId,
//         address2: allAddress.address2,
//         country: allAddress.state,
//         state: allAddress.state,
//         houseNumber: allAddress.houseNumber,
//         street: allAddress.street,
//         city: allAddress.city,
//         pinCode: allAddress.pinCode,
//         landMark: allAddress.landMark,
//         unitPrice: cart.products[i].product.price,
//         product: cart.products[i].product._id,
//         quantity: cart.products[i].quantity,
//         total: cart.products[i].quantity * cart.products[i].product.price,
//         ringTheBell: cart.products[i].ringTheBell,
//         instruction: cart.products[i].instruction,
//         pickUpBottleQuantity: pickUpBottleQuantity,
//         productType: cart.products[i].product.type,
//         isPickUpBottle: isPickUpBottle,
//         discount: 0,
//         shippingPrice: 0,
//         startDate: cart.products[i].startDate,
//         cutOffOrderType: cutOffOrderType,
//         amountToBePaid: (cart.products[i].quantity * cart.products[i].product.price) + 10,
//         collectedAmount: (cart.products[i].quantity * cart.products[i].product.price) + 10,
//         orderType: "once",
//         mode: user.paymentMode
//       }
//       if (user.paymentMode == "PrePaid") {
//         let TotalAmount = (cart.products[i].quantity * cart.products[i].product.price) + 10
//         let wallet = await Wallet.findOne({ userId: Data.user });
//         if (!wallet) {
//           return res.status(403).json({ message: "InSufficent balance." })
//         } else {
//           if (wallet.balance < parseFloat(TotalAmount)) {
//             return res.status(403).json({ message: "InSufficent balance." })
//           } else {
//             const address = await Order.create(obj);
//             await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
//             orders.push(address)
//             let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
//             await logs.create(obj1);
//           }
//         }
//       }
//       if (user.paymentMode == "PostPaid") {
//         const address = await Order.create(obj);
//         await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
//         orders.push(address)
//         let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
//         await logs.create(obj1);
//       }
//       // }
//       // if (cart.products[i].orderType == 'Subscription') {
//       //   let obj = {
//       //     userId: req.user._id,
//       //     driverId: user.driverId,
//       //     collectionBoyId: user.collectionBoyId,
//       //     address2: allAddress.address2,
//       //     country: allAddress.state,
//       //     state: allAddress.state,
//       //     houseNumber: allAddress.houseNumber,
//       //     street: allAddress.street,
//       //     city: allAddress.city,
//       //     pinCode: allAddress.pinCode,
//       //     landMark: allAddress.landMark,
//       //     unitPrice: cart.products[i].product.price,
//       //     product: cart.products[i].product._id,
//       //     quantity: cart.products[i].quantity,
//       //     ringTheBell: cart.products[i].ringTheBell,
//       //     instruction: cart.products[i].instruction,
//       //     discount: 0,
//       //     shippingPrice: 0,
//       //     cutOffOrderType: cutOffOrderType,
//       //     startDate: cart.products[i].startDate,
//       //     amountToBePaid: (cart.products[i].quantity * cart.products[i].product.price) + 10,
//       //     collectedAmount: (cart.products[i].quantity * cart.products[i].product.price) + 10,
//       //   }
//       //   const address = await Subscription.create(obj);
//       //   await address.populate([{ path: "product", select: { reviews: 0 } },]);
//       //   orders.push(address)
//       //   let obj1 = {
//       //     description: `Subscription has been create by ${req.user.name}.`,
//       //     title: 'Create subscription',
//       //     user: req.user._id,
//       //   }
//       //   await logs.create(obj1);
//       // }
//     }
//     return res.status(200).json({ success: true, msg: "Order created", orders, });
//   } catch (error) {
//     next(error);
//   }
// };
const placeOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ user: req.user._id, orderStatus: "unconfirmed", });
    if (!order) {
      return res.status(404).json({ message: "No unconfirmed order found" });
    }
    order.orderStatus = "confirmed";
    order.collectedStatus = "Onlines";
    await order.save();
    return res.status(200).json({ msg: "order id", data: order });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: `Could not place order ${error.message}` });
  }
};
const placeOrderCOD = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ msg: "There are no products in the user's cart." });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { grandTotal, discount, shippingPrice } = calculateOrderTotal(cart.products);
    if (grandTotal <= 0) {
      return res.status(400).json({ msg: "The order total should be greater than zero." });
    }
    const newOrder = new Order({
      user: userId,
      driverId: user.driverId,
      collectionBoyId: user.collectionBoyId,
      products: cart.products,
      grandTotal,
      discount,
      shippingPrice,
      amountToBePaid: grandTotal,
      collectedAmount: grandTotal,
      orderStatus: "confirmed",
    });
    await newOrder.save();
    return res.status(200).json({ msg: "Order placed successfully", orderId: newOrder._id, amount: grandTotal, });
  } catch (error) {
    console.log(error);
    //next(error);
    return res.status(500).json({ msg: "An error occurred while placing the order." });
  }
};
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id, orderType: "once" }).populate({ path: "product", select: { reviews: 0 } }).populate({ path: "coupon", select: "couponCode discount expirationDate" });
    return res.status(200).json({ success: true, msg: "orders of user", orders })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
};
const orderReturn = async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = await Order.findOne({ _id: orderId });
    if (!data) {
      return res.status(500).json({
        message: "OrderId is Not present "
      })
    } else {
      const Data = {
        user: data.user,
        orderId: orderId
      }
      const returnData = await OrderReturn.create(Data);
      if (returnData) {
        await Order.findByIdAndDelete({ _id: orderId });
        return res.status(200).json({
          details: returnData
        })
      }
    }
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}
const GetAllReturnOrderbyUserId = async (req, res) => {
  try {
    const data = await OrderReturn.find({ user: req.params.userId });
    if (data.length == 0) {
      return res.status(500).json({
        message: "No Return list found  this user "
      })
    } else {
      return res.status(200).json({
        message: data
      })
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    })
  }
}
const AllReturnOrder = async (req, res) => {
  try {
    const data = await OrderReturn.find();
    return res.status(200).json({ message: data })
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    })
  }
}
const GetReturnByOrderId = async (req, res) => {
  try {
    const data = await OrderReturn.findOne({ orderId: req.params.id });
    if (!data) {
      return res.status(500).json({
        message: "No Data Found "
      })
    }
    return res.status(200).json({
      message: data
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}
const getUnconfirmedOrders = async (req, res, next) => {
  try {
    // Fetch all orders with order status "unconfirmed"
    const unconfirmedOrders = await Order.find({ orderStatus: 'processed', paymentStatus: 'pending' })

    // Return the list of unconfirmed orders
    return res.status(200).json({ success: true, unconfirmedOrders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
const insertNewProduct = async (req, res, next) => {

  try {
    const orderId = req.params.orderId;
    const productId = req.params.productId;

    // Check if the order exists
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check if the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Add the product to the order
    const newProduct = {
      unitPrice: product.price,
      product: productId,
      quantity: 1, // You can adjust the quantity as needed
      total: product.price,
    };

    order.products.push(newProduct);

    // Update the grand total and amountToBePaid based on the new product
    order.grandTotal += newProduct.total;
    order.amountToBePaid += newProduct.total;
    order.collectedAmount += newProduct.total;

    // Save the updated order
    const updatedOrder = await order.save();

    return res.status(200).json({ success: true, message: 'Product added to the order successfully.', order: updatedOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
const subscription = async (req, res, next) => {
  try {
    const { user } = req.user._id;
    const { orderId } = req.params;
    console.log(user);
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required in the request body', });
    }
    const totalOrderAmount = order.grandTotal;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const numberOfDays = endMoment.diff(startMoment, 'days') + 1;
    const subscription = new Subscription({
      userId: req.user._id,
      driverId: order.driverId,
      collectionBoyId: order.collectionBoyId,
      orderId: order._id,
      startDate,
      endDate,
      totalOrderAmount,
      numberOfDays,
    });
    await subscription.save();
    // Schedule a cron job to check and deduct daily amount from user wallet
    cron.schedule('0 0 * * *', async () => {
      try {
        const currentDayStart = moment().startOf('day');
        const currentDayEnd = moment().endOf('day');
        const todaySubscription = await Subscription.findOne({
          userId: req.user._id,
          orderId: order._id,
          startDate: { $gte: currentDayStart.toDate() },
          endDate: { $lte: currentDayEnd.toDate() },
        });
        if (todaySubscription) {
          const user = await User.findById(req.user._id);
          const dailyAmount = calculateDailyAmount(todaySubscription);
          if (user.balance >= dailyAmount) {
            user.walletBalance -= dailyAmount;
            await user.save();
          } else {
            console.log('Insufficient balance for daily subscription.');
          }
        } else {
          console.log('No subscription found for the current day.');
        }
      } catch (error) {
        console.error(error);
      }
    });
    return res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
const calculateDailyAmount = (subscription) => {
  return subscription.totalOrderAmount / subscription.numberOfDays;
};
const addproductinOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { productId } = req.body;
    const { quantity } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }
    const product = await Product.findById(productId);
    console.log(product);
    const unitPrice = product.price || 0;
    const newProduct = {
      unitPrice,
      product: product,
      quantity,
      total: unitPrice * quantity,
    };
    order.products.push(newProduct);
    order.grandTotal += newProduct.total;
    await order.save();
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const deleteproductinOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const del = await Order.findByIdAndDelete({ _id: order._id });

    return res.status(200).json({ success: true, del });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};







const getAllOrdersForUser = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id, startDate: { $gte: req.query.fromStartDate, $lte: req.query.toStartDate } }).populate('user product');
  if (orders.length > 0) {
    const productQuantities = []; let grandTotal = 0;
    orders.forEach(order => {
      if (order.product) {
        let existingProduct = productQuantities.find(item => item.productId === order.product._id);
        if (existingProduct) {
          existingProduct.quantity += order.quantity;
          existingProduct.total += order.total;
          grandTotal += order.total;
        } else {
          productQuantities.push({
            productId: order.product._id,
            productName: order.product.name,
            product: order.product,
            quantity: order.quantity,
            total: order.total
          });
          grandTotal += order.total;
        }
      }
    });
    return res.status(200).json({ success: true, productQuantities, grandTotal: grandTotal, ordersLength: orders.length, orders, });
  } else {
    return res.status(200).json({ success: false, });
  }
});
module.exports = { deleteOrder, getAllOrdersForUser, getAllOneTimeOrdersForAdmin, getAllOrdersForInvoice, getSubscriptionById, checkoutForAdmin, updateOrderDetailsByAdmin, getAllOrdersForAdmin, returnBottleOrderForAdmin, updateOrderDetails, subscription, payBillStatusUpdate, returnBottleOrder, updateCollectedDate, createSubscription, pauseSubscription, updateSubscription, deleteSubscription, deleteproductinOrder, mySubscriptionOrders, payBills, addproductinOrder, mySubscription, getAllSubscription, insertNewProduct, getSingleOrder, myOrders, getAllOrders, getAllOrdersVender, updateOrder, checkout, placeOrder, placeOrderCOD, getOrders, orderReturn, GetAllReturnOrderbyUserId, AllReturnOrder, GetReturnByOrderId, getUnconfirmedOrders }