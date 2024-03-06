const Order = require("../Model/ShoppingCartOrderModel");
const logs = require("../Model/logs");
const Product = require("../Model/productModel");
const Cart = require("../Model/cartModel");
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
const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }
  return res.status(200).json({ success: true, order, });
});
const myOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Order.find({ user: req.user.id, orderType: "once" });

  console.log(orders);
  return res.status(200).json({
    success: true,
    orders,
  });
});
const mySubscriptionOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Subscription.find({ user: req.user._id, }).populate("userId product")

  console.log(orders);
  return res.status(200).json({
    success: true,
    orders,
  });
});
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Order.find().populate('user') // Populate the 'user' field
    .populate('product');
  let totalAmount = 0;

  orders.forEach((orders) => {
    totalAmount += orders.totalPrice;
  });

  return res.status(200).json({
    success: true,
    totalAmount,
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
const checkout = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
    if (!cart) {
      return res.status(400).json({ success: false, msg: "Cart not found or empty." });
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
    if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) { cutOffOrderType = CutOffTimes2.type; } else {
      cutOffOrderType = CutOffTimes1.type;
    }
    let orders = [], pickUpBottleQuantity = 0, isPickUpBottle;
    for (let i = 0; i < cart.products.length; i++) {
      console.log(cart.products[i]);
      // if (cart.products[i].orderType == 'once') {
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
        quantity: cart.products[i].quantity,
        total: cart.products[i].quantity * cart.products[i].product.price,
        ringTheBell: cart.products[i].ringTheBell,
        instruction: cart.products[i].instruction,
        pickUpBottleQuantity: pickUpBottleQuantity,
        productType: cart.products[i].product.type,
        isPickUpBottle: isPickUpBottle,
        discount: 0,
        shippingPrice: 10,
        startDate: cart.products[i].startDate,
        cutOffOrderType: cutOffOrderType,
        amountToBePaid: (cart.products[i].quantity * cart.products[i].product.price) + 10,
        collectedAmount: (cart.products[i].quantity * cart.products[i].product.price) + 10,
        orderType: "once",
        mode: user.paymentMode
      }
      if (user.paymentMode == "PrePaid") {
        let TotalAmount = (cart.products[i].quantity * cart.products[i].product.price) + 10
        let wallet = await Wallet.findOne({ userId: Data.user });
        if (!wallet) {
          return res.status(200).json({ message: "InSufficent balance." })
        } else {
          if (wallet.balance < parseFloat(TotalAmount)) {
            return res.status(200).json({ message: "InSufficent balance." })
          } else {
            const address = await Order.create(obj);
            await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
            orders.push(address)
            let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
            await logs.create(obj1);
          }
        }
      }
      if (user.paymentMode == "PostPaid") {
        const address = await Order.create(obj);
        await address.populate([{ path: "product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
        orders.push(address)
        let obj1 = { description: `Order has been create by ${user.name}.`, title: 'Create order', user: user._id, }
        await logs.create(obj1);
      }
      // }
      // if (cart.products[i].orderType == 'Subscription') {
      //   let obj = {
      //     userId: req.user._id,
      //     driverId: user.driverId,
      //     collectionBoyId: user.collectionBoyId,
      //     address2: allAddress.address2,
      //     country: allAddress.state,
      //     state: allAddress.state,
      //     houseNumber: allAddress.houseNumber,
      //     street: allAddress.street,
      //     city: allAddress.city,
      //     pinCode: allAddress.pinCode,
      //     landMark: allAddress.landMark,
      //     unitPrice: cart.products[i].product.price,
      //     product: cart.products[i].product._id,
      //     quantity: cart.products[i].quantity,
      //     ringTheBell: cart.products[i].ringTheBell,
      //     instruction: cart.products[i].instruction,
      //     discount: 0,
      //     shippingPrice: 10,
      //     cutOffOrderType: cutOffOrderType,
      //     startDate: cart.products[i].startDate,
      //     amountToBePaid: (cart.products[i].quantity * cart.products[i].product.price) + 10,
      //     collectedAmount: (cart.products[i].quantity * cart.products[i].product.price) + 10,
      //   }
      //   const address = await Subscription.create(obj);
      //   await address.populate([{ path: "product", select: { reviews: 0 } },]);
      //   orders.push(address)
      //   let obj1 = {
      //     description: `Subscription has been create by ${req.user.name}.`,
      //     title: 'Create subscription',
      //     user: req.user._id,
      //   }
      //   await logs.create(obj1);
      // }
    }
    return res.status(200).json({ success: true, msg: "Order created", orders, });
  } catch (error) {
    next(error);
  }
};
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
// const getAllOrders = catchAsyncErrors(async (req, res, next) => {
//   const orders = await Order.find().populate({path: 'user', options: {strictPopulate: true}})

//   let totalAmount = 0;

//   orders.forEach((order) => {
//     totalAmount += order.totalPrice;
//   });

// return  res.status(200).json({
//     success: true,
//     totalAmount,
//     orders,
//   });
// });
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
const createSubscription = async (req, res, next) => {
  try {
    const findProduct = await Product.findById({ _id: req.body.productId });
    if (!findProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
    if ((CutOffTimes2.time < CutOffTimes1.time) && (currentTimeString < CutOffTimes2.time)) {
      cutOffOrderType = CutOffTimes2.type;
    } else {
      cutOffOrderType = CutOffTimes1.type;
    }
    let obj = {
      userId: req.user._id,
      driverId: user.driverId,
      collectionBoyId: user.collectionBoyId,
      productId: findProduct._id,
      price: req.body.price,
      size: req.body.size,
      quantity: req.body.quantity,
      startDate: req.body.startDate,
      ringTheBell: req.body.ringTheBell,
      instruction: req.body.instruction,
      days: req.body.days,
      type: req.body.type,
      alternateDay: req.body.alternateDay,
      cutOffOrderType: cutOffOrderType,
    }
    const banner = await Subscription.create(obj);
    if (banner) {
      let obj1 = {
        description: `Subscription has been create by ${req.user.name}.`,
        title: 'Create subscription',
        user: req.user._id,
      }
      await logs.create(obj1);
      return res.status(201).json({ message: 'Create subscription successfully', banner });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to place order' });
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
      productId = order.productId;
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let obj = {
      userId: req.user._id,
      driverId: user.driverId,
      collectionBoyId: user.collectionBoyId,
      productId: productId,
      size: req.body.size || order.size,
      price: req.body.price || order.price,
      alternateDay: req.body.alternateDay || order.alternateDay,
      quantity: req.body.quantity || order.quantity,
      startDate: req.body.startDate || order.startDate,
      ringTheBell: req.body.ringTheBell || order.ringTheBell,
      instruction: req.body.instruction || order.instruction,
      days: req.body.days || order.days,
      type: req.body.type || order.type,
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
const mySubscription = async (req, res, next) => {
  try {
    consol.log(req.user)
    const subscriptions = await Subscription.find({ userId: req.user._id }).populate("userId productId");
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
    const del = await Subscription.findByIdAndDelete(subscriptionId);

    return res.status(201).json({ message: 'Subscription delete successfully', del });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to place order' });
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
          const wallet = await Wallet.find({ user });
          if (wallet.balance >= dailyAmount) {
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
module.exports = { returnBottleOrderForAdmin, subscription, payBillStatusUpdate, returnBottleOrder, updateCollectedDate, createSubscription, pauseSubscription, updateSubscription, deleteSubscription, deleteproductinOrder, mySubscriptionOrders, payBills, addproductinOrder, mySubscription, getAllSubscription, insertNewProduct, getSingleOrder, myOrders, getAllOrders, getAllOrdersVender, updateOrder, checkout, placeOrder, placeOrderCOD, getOrders, orderReturn, GetAllReturnOrderbyUserId, AllReturnOrder, GetReturnByOrderId, getUnconfirmedOrders }