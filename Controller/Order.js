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
const razorpayInstance = new Razorpay({
  key_id: "rzp_test_8VsYUQmn8hHm69",
  key_secret: "Xcg3HItXaBuQ9OIpeOAFUgLI",
});

// Create new Order
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

//   res.status(201).json({
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

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user  Orders

const myOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Order.find({ user: req.user.id });
  
console.log(orders);
  res.status(200).json({
    success: true,
    orders,
  });
});

// get all Orders -- Admin
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  console.log("hi");
  const orders = await Order.find().populate('user') // Populate the 'user' field
  .populate('products.product'); 
  let totalAmount = 0;

  orders.forEach((orders) => {
    totalAmount += orders.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//get all Orders - Vender
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

  res.status(200).json({
    success: true,
    orders,
  });
});

// update Order Status -- Admin
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
    res.status(200).json({
      success: true,
      message: "Order successfully updated"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  
    res.status(200).json({ success: true, orders: ordersWithSubscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
  };


const checkout = async (req, res, next) => {
  try {
    const { address } = req.body;

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "products.product",
      select: { review: 0 },
    }).populate({ path: "coupon", select: "couponCode discount expirationDate", });

    if (!cart) {
      return res.status(400).json({ success: false, msg: "Cart not found or empty." });
    }

    const order = new Order({ user: req.user._id, address });

    let grandTotal = 0;

    const orderProducts = cart.products.map((cartProduct) => {
      const total = cartProduct.quantity * cartProduct.product.price;
      grandTotal += total;
      return {
        product: cartProduct.product._id,
        unitPrice: cartProduct.product.price,
        quantity: cartProduct.quantity,
        total,
      };
    });

    order.products = orderProducts;

    // You can uncomment the following code if you have the coupon feature implemented
    // if (cart.coupon) {
    //   order.coupon = cart.coupon._id;
    //   order.discount = 0.01 * cart.coupon.discount * grandTotal;
    // }

    order.grandTotal = grandTotal;
    order.shippingPrice = 10;
    order.amountToBePaid = grandTotal + order.shippingPrice - order.discount;

    await order.save();

    await order.populate([
      { path: "products.product", select: { reviews: 0 } },
      { path: "coupon", select: "couponCode discount expirationDate" },
    ]);

    // Clear the cart after successful checkout
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
    await order.save();
    return res.status(200).json({ msg: "order id", data: order });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Could not place order ${error.message}` });
  }
};
const placeOrderCOD = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Check if there is an unconfirmed order for the user
    // const unconfirmedOrder = await Order.findOne({
    //   user: userId,
    //   orderStatus: "unconfirmed",
    // });

    // if (unconfirmedOrder) {
    //   return res
    //     .status(400)
    //     .json({ msg: "There is already an unconfirmed order for this user." });
    // }

    // Fetch user's cart or create a new one
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ msg: "There are no products in the user's cart." });
    }

    // Calculate order total, including discounts and shipping price
    const { grandTotal, discount, shippingPrice } = calculateOrderTotal(
      cart.products
    );

    // Additional condition: Ensure the order total is greater than zero
    if (grandTotal <= 0) {
      return res
        .status(400)
        .json({ msg: "The order total should be greater than zero." });
    }

    // Create a new order
    const newOrder = new Order({
      user: userId,
      products: cart.products,
      grandTotal,
      discount,
      shippingPrice,
      amountToBePaid: grandTotal,
      orderStatus: "unconfirmed",
    });

    // Save the new order
    await newOrder.save();

    return res.status(200).json({
      msg: "Order placed successfully",
      orderId: newOrder._id,
      amount: grandTotal,
    });
  } catch (error) {
    console.log(error);
    //next(error);
    return res
      .status(500)
      .json({ msg: "An error occurred while placing the order." });
  }
};
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id, orderStatus: "confirmed" }).populate({ path: "products.product", select: { reviews: 0 } }).populate({ path: "coupon", select: "couponCode discount expirationDate" });
    return res.status(200).json({ success: true, msg: "orders of user", orders })
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
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
        res.status(200).json({
          details: returnData
        })
      }
    }
  } catch (err) {
    res.status(400).json({
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
      res.status(200).json({
        message: data
      })
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}
const AllReturnOrder = async (req, res) => {
  try {
    const data = await OrderReturn.find();
    res.status(200).json({
      message: data
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({
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
    res.status(200).json({
      message: data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

const getUnconfirmedOrders = async (req, res, next) => {
  try {
    // Fetch all orders with order status "unconfirmed"
    const unconfirmedOrders = await Order.find({ orderStatus: 'processed',paymentStatus:'pending' })
     
    // Return the list of unconfirmed orders
    res.status(200).json({ success: true, unconfirmedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// const getAllOrders = catchAsyncErrors(async (req, res, next) => {
//   const orders = await Order.find().populate({path: 'user', options: {strictPopulate: true}})

//   let totalAmount = 0;

//   orders.forEach((order) => {
//     totalAmount += order.totalPrice;
//   });

//   res.status(200).json({
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

  res.status(200).json({ success: true, message: 'Product added to the order successfully.', order: updatedOrder });
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
}
};


  
const subscription = async (req, res, next) => {
  try {
    const { user } = req.user._id;
    const { orderId } = req.params;
    console.log(user);

    // Get products from the user's order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { startDate, endDate } = req.body;

    // Check if startDate and endDate are present in the request body
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Both startDate and endDate are required in the request body',
      });
    }

    // Calculate the totalOrderAmount based on the order's total amount
    const totalOrderAmount = order.grandTotal;

    // Calculate the numberOfDays based on the subscription start and end dates
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const numberOfDays = endMoment.diff(startMoment, 'days') + 1; // Adding 1 to include both start and end days

    // Create a subscription for the specific order
    const subscription = new Subscription({
      userId: req.user._id,
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
        // Calculate the start and end dates for the current day
        const currentDayStart = moment().startOf('day');
        const currentDayEnd = moment().endOf('day');

        // Find the subscription for the current day
        const todaySubscription = await Subscription.findOne({
          userId: req.user._id,
          orderId: order._id,
          startDate: { $gte: currentDayStart.toDate() },
          endDate: { $lte: currentDayEnd.toDate() },
        });

        if (todaySubscription) {
          // Check if the user has enough balance in the wallet
          const user = await User.findById(req.user._id);
          const dailyAmount = calculateDailyAmount(todaySubscription);
          const wallet = await Wallet.find({ user });

          if (wallet.balance >= dailyAmount) {
            // Deduct the daily amount from the user's wallet
            user.walletBalance -= dailyAmount;
            await user.save();
          } else {
            // Handle insufficient balance
            console.log('Insufficient balance for daily subscription.');
          }
        } else {
          // Handle if no subscription is found for the current day
          console.log('No subscription found for the current day.');
        }
      } catch (error) {
        console.error(error);
      }
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

// Function to calculate the daily amount based on the subscription details
const calculateDailyAmount = (subscription) => {
  // Implement your logic to calculate the daily amount
  // For example, you can use the total order amount divided by the number of days in the subscription period
  return subscription.totalOrderAmount / subscription.numberOfDays;
};
const mySubscription = async (req, res, next) => {
  

  try {
    const { user } = req;

    // Find subscriptions for the logged-in user
    const subscriptions = await Subscription.find({ userId: user._id }).populate("userId").populate("orderId");

    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user subscriptions' });
  }
};
const addproductinOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { productId } = req.body;

    const {  quantity } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    // Fetch the product by ID
    const product = await Product.findById(productId);
console.log(product);
    // Assuming the product has a unit price property
    const unitPrice = product.price || 0;

    // Create a new product object
    const newProduct = {
      unitPrice,
      product: product, // Assuming the product has an _id property
      quantity,
      total: unitPrice * quantity,
    };

    // Add the new product to the order's products array
    order.products.push(newProduct);

    // Update the order's total and amountToBePaid
    order.grandTotal += newProduct.total;

    // Save the updated order
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const deleteproductinOrder = async (req, res, next) => {
  console.log("hi");
  try {
    const { orderId } = req.params;
    const { productId } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Find the index of the product in the order's products array
    const productIndex = order.products.findIndex(
      product => product && product.product && product.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in the order' });
    }

    // Remove the product from the order's products array
    const removedProduct = order.products.splice(productIndex, 1)[0];

    // Update the order's total and amountToBePaid
    order.grandTotal -= removedProduct.total;

    // Save the updated order
    await order.save();

    return res.status(200).json({ success: true, removedProduct, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};





module.exports = {
  subscription,
  deleteproductinOrder,
  addproductinOrder,
  mySubscription,
  getAllSubscription,
  insertNewProduct,
  getSingleOrder,
  myOrders,
  getAllOrders,
  getAllOrdersVender,
  updateOrder,
  checkout,
  placeOrder,
  placeOrderCOD,
  getOrders,
  orderReturn,
  GetAllReturnOrderbyUserId,
  AllReturnOrder,
  GetReturnByOrderId,
  getUnconfirmedOrders
}