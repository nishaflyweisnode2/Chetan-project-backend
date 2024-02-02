const Order = require("../Model/ShoppingCartOrderModel");
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
  const orders = await Order.find({ user: req.user.id });

  console.log(orders);
  return res.status(200).json({
    success: true,
    orders,
  });
});
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Order.find().populate('user') // Populate the 'user' field
    .populate('products.product');
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
    const { address } = req.body;
    let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
    if (!cart) {
      return res.status(400).json({ success: false, msg: "Cart not found or empty." });
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const order = new Order({ user: req.user._id, driverId: user.driverId, collectionBoyId: user.collectionBoyId, address });
    let grandTotal = 0;
    const orderProducts = cart.products.map((cartProduct) => {
      const total = cartProduct.quantity * cartProduct.product.price;
      grandTotal += total;
      return { product: cartProduct.product._id, unitPrice: cartProduct.product.price, quantity: cartProduct.quantity, total, };
    });
    order.products = orderProducts;
    order.grandTotal = grandTotal;
    order.shippingPrice = 10;
    order.amountToBePaid = grandTotal + order.shippingPrice - order.discount;
    await order.save();
    await order.populate([{ path: "products.product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
    // await Cart.findOneAndDelete({ user: req.user._id });
    return res.status(200).json({ success: true, msg: "Order created", order, });
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
    const orders = await Order.find({ user: req.user._id, orderStatus: "confirmed" }).populate({ path: "products.product", select: { reviews: 0 } }).populate({ path: "coupon", select: "couponCode discount expirationDate" });
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
const mySubscription = async (req, res, next) => {
  try {
    const { user } = req;
    const subscriptions = await Subscription.find({ userId: user._id }).populate("userId").populate("orderId");
    return res.status(200).json({ subscriptions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get user subscriptions' });
  }
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
    const { productId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const productIndex = order.products.findIndex(
      product => product && product.product && product.product.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in the order' });
    }
    const removedProduct = order.products.splice(productIndex, 1)[0];
    order.grandTotal -= removedProduct.total;
    await order.save();
    return res.status(200).json({ success: true, removedProduct, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const payBills = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const body = { user: req.user._id, status: "delivered", paymentStatus: { $ne: "paid" } };
    if (fromDate && toDate) {
      body.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }
    let total = 0, orderIds = [];
    const data = await Order.find(body);
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        total = total + data[i].amountToBePaid
        orderIds.push(data[i]._id);
        console.log(orderIds);
      }
      return res.status(200).json({ data: { data, total, fromDate, toDate, orderIds } });
    } else {
      return res.status(404).json({ success: false, data: {} });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};
module.exports = { subscription, deleteproductinOrder, payBills, addproductinOrder, mySubscription, getAllSubscription, insertNewProduct, getSingleOrder, myOrders, getAllOrders, getAllOrdersVender, updateOrder, checkout, placeOrder, placeOrderCOD, getOrders, orderReturn, GetAllReturnOrderbyUserId, AllReturnOrder, GetReturnByOrderId, getUnconfirmedOrders }