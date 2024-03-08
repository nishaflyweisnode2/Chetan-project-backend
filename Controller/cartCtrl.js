const ErrorHander = require("../utils/errorhander");
const moment = require("moment");
const Cart = require("../Model/cartModel");
const Coupon = require("../Model/couponModel");
const Product = require("../Model/productModel");
const subscriptionCart = require("../Model/subscriptionCart");
const User = require("../Model/userModel");
const cutOffTime = require('../Model/cutOffTime');
/////////////////////////////////////////////////////////// normar cart ////////////////////
exports.addToCart = async (req, res, next) => {
  const { quantity, startDate, ringTheBell, instruction, days, type, size } = req.body;
  try {
    const product = req.params.id;
    let cart = await Cart.findOne({ user: req.user.id });
    console.log(req.user.id);
    if (!cart) { cart = await createCart(req.user.id); }
    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct.product.toString() == product;
    });
    if (productIndex < 0) {
      cart.products.push({ product, quantity, size, startDate, ringTheBell, instruction, days, type });
    } else {
      cart.products[productIndex].quantity++;
    }
    await cart.save();
    return res.status(200).json({ msg: "product added to cart", });
  } catch (error) {
    next(error);
  }
};
exports.updateQuantity = async (req, res, next) => {
  try {
    const productId = req.params.id; // Corrected variable name to match schema
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await createCart(req.user.id); // Assuming createCart is defined and working correctly
    }

    const productIndex = cart.products.findIndex(cartProduct => cartProduct.product.toString() === productId);
    if (productIndex === -1 && quantity > 0) {
      cart.products.push({ product: productId, quantity });
    } else if (productIndex >= 0 && quantity > 0) {
      cart.products[productIndex].quantity = quantity;
    }

    await cart.save();

    return res.status(200).json({ success: true, msg: "Cart updated" });
  } catch (error) {
    next(error);
  }
};
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(201).json({ message: "No Data Found" });
    }
    const cartResponse = await getCartResponse(cart, req, res);
    return res.status(200).json({ success: true, msg: "cart", cart: cartResponse });
  } catch (error) {
    next(error);
  }
};
exports.deleteCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndDelete({ user: userId });
    return res.status(200).json({ success: true, message: 'Cart deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
exports.deletProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    const productIndex = cart.products.findIndex(
      (product) => product.product.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    cart.products.splice(productIndex, 1);

    await cart.save();
    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.applyCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.id });
    console.log(req.params.id);

    const coupon = await Coupon.findOne({
      couponCode: req.body.couponCode,
      expirationDate: { $gte: new Date(moment().format('YYYY-MM-DD')) },
      activationDate: { $lte: new Date(moment().format('YYYY-MM-DD')) }
    });

    console.log('coupon===================', coupon);
    console.log('cartCoupon', cart);

    if (!coupon) {
      return next(new ErrorHander('Invalid coupon code', 400));
    }

    // Check if any product in the cart matches the coupon category
    const isCategoryMatch = cart.products.some((product) => {
      return product.product.category.toString() === coupon.category.toString();
    });

    if (!isCategoryMatch) {
      return next(new ErrorHander('Coupon category does not match any product in the cart', 400));
    }

    console.log('Coupon applied successfully');
    console.log('Cart before applying coupon:', cart);

    cart.coupon = coupon._id;
    await cart.save();

    console.log('Cart after applying coupon:', cart);

    return res.status(200).json({
      success: true,
      msg: 'Coupon applied successfully'
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/////////////////////////////////////////////////////////// subscription cart ///////////////////////////////
exports.createSubscriptionCart = async (req, res, next) => {
  try {
    const findProduct = await Product.findById({ _id: req.body.productId });
    if (!findProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let cart = await subscriptionCart.findOne({ userId: req.user._id });
    if (cart) {
      const productIndex = cart.products.findIndex((cartProduct) => {
        return cartProduct.product.toString() == req.body.productId;
      });
      if (productIndex < 0) {
        cart.products.push({ product: findProduct._id, price: req.body.price, size: req.body.size, quantity: req.body.quantity, startDate: req.body.startDate, ringTheBell: req.body.ringTheBell, instruction: req.body.instruction, days: req.body.days, type: req.body.type, alternateDay: req.body.alternateDay, });
      } else {
        cart.products[productIndex].quantity = req.body.quantity;
        cart.products[productIndex].price = req.body.price;
        cart.products[productIndex].size = req.body.size;
        cart.products[productIndex].startDate = req.body.startDate;
        cart.products[productIndex].ringTheBell = req.body.ringTheBell;
        cart.products[productIndex].instruction = req.body.instruction;
        cart.products[productIndex].days = req.body.days;
        cart.products[productIndex].type = req.body.type;
        cart.products[productIndex].alternateDay = req.body.alternateDay;
      }
      let banner = await cart.save();
      return res.status(201).json({ message: 'Create subscription successfully', banner });
    } else {
      let products = [{ product: findProduct._id, price: req.body.price, size: req.body.size, quantity: req.body.quantity, startDate: req.body.startDate, ringTheBell: req.body.ringTheBell, instruction: req.body.instruction, days: req.body.days, type: req.body.type, alternateDay: req.body.alternateDay, }]
      let banner = await subscriptionCart.create({ userId: req.user._id, products: products });
      return res.status(201).json({ message: 'Create subscription successfully', banner });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
exports.updateSubscriptionCart = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const order = await subscriptionCart.findById(subscriptionId);
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
    const banner = await subscriptionCart.findByIdAndUpdate({ _id: order._id }, { $set: obj }, { new: true });
    return res.status(201).json({ message: 'Create subscription successfully', banner });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to place order' });
  }
};
exports.mySubscriptionCart = async (req, res, next) => {
  try {
    const cart = await subscriptionCart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(201).json({ message: "No Data Found" });
    }
    const cartResponse = await getSubscriptionCartResponse(cart, req, res);
    return res.status(200).json({ success: true, msg: "cart", cart: cartResponse });
  } catch (error) {
    next(error);
  }
};
const getSubscriptionCartResponse = async (cart, req, res) => {
  try {
    await cart.populate([{ path: "products.product", select: { reviews: 0 } },]);
    if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) {
      cart.coupon = undefined;
      cart.save();
    }
    const cartResponse = cart.toObject();
    console.log("-------------", cartResponse);
    let discount = 0;
    let total = 0;
    cartResponse.products = cartResponse.products.filter((cartProduct) => {
      if (!cartProduct.product || cartProduct.quantity === 0) {
        return false;
      }
      cartProduct.total = cartProduct.price * cartProduct.quantity;
      total += cartProduct.total;
      return true;
    });
    if (cartResponse.products.length === 0) {
      cart.quantity = 0;
      cart.subTotal = 0;
      await cart.save();
      return res.status(500).json({ message: "No valid products in the cart" });
    }
    if (cartResponse.coupon) {
      discount = 0.01 * cart.coupon.discount * total;
    }
    const shipping = 10;
    cartResponse.subTotal = total;
    cartResponse.discount = discount;
    cartResponse.shipping = 10;
    cartResponse.total = total - discount;
    cartResponse.total = total + shipping;
    return cartResponse;
  } catch (error) {
    throw error;
  }
};
exports.deleteSubscriptionCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await subscriptionCart.findOneAndDelete({ userId: userId });
    return res.status(200).json({ success: true, message: 'Cart deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
exports.deleteSubscriptionCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    let cart = await subscriptionCart.findOne({ user: userId });
    const productIndex = cart.products.findIndex(
      (product) => product.product.toString() === id
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    cart.products.splice(productIndex, 1);
    await cart.save();
    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////
const createCart = async (userId) => {
  try {
    const cart = await Cart.create({ user: userId });

    return cart;
  } catch (error) {
    throw error;
  }
};
const getCartResponse = async (cart, req, res) => {
  try {
    await cart.populate([{ path: "products.product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
    if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) {
      cart.coupon = undefined;
      cart.save();
    }
    const cartResponse = cart.toObject();
    console.log("-------------", cartResponse);
    let discount = 0;
    let total = 0;
    // Filter out products that are null or have a quantity of 0
    cartResponse.products = cartResponse.products.filter((cartProduct) => {
      if (!cartProduct.product || cartProduct.quantity === 0) {
        return false;
      }
      cartProduct.total = cartProduct.product.price * cartProduct.quantity;
      total += cartProduct.total;
      return true;
    });
    if (cartResponse.products.length === 0) {
      cart.quantity = 0;
      cart.subTotal = 0;
      await cart.save();
      return res.status(500).json({ message: "No valid products in the cart" });
    }
    if (cartResponse.coupon) {
      discount = 0.01 * cart.coupon.discount * total;
    }
    const shipping = 10;
    cartResponse.subTotal = total;
    cartResponse.discount = discount;
    cartResponse.shipping = 10;
    cartResponse.total = total - discount;
    cartResponse.total = total + shipping;
    return cartResponse;
  } catch (error) {
    throw error;
  }
};
const orderByCOD = async (req, res) => {
  try {

  } catch (err) {
    console.log(err)
    throw err
  }
}
exports.decreaseQty = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user._id; // Assuming you're using user authentication

  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Check if the product is in the cart
    const cartItem = cart.products.find(item => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Decrease the quantity by 1 if it's greater than 1
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      return res.status(400).json({ message: 'Minimum quantity reached' });
    }

    // Update the cart
    await cart.save();

    res.status(200).json({ message: 'Quantity decreased in cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error decreasing quantity in cart' });
  }
};
exports.decreaseQty1 = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id; // Assuming you have user authentication

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item with the given product ID in the cart
    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct.product.toString() == product;
    });

    if (!productIndex) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }

    // Decrease the quantity by 1 (assuming you want to decrease by 1)
    if (productIndex.quantity > 1) {
      productIndex.quantity -= 1;
    } else {
      // Remove the item from the cart if the quantity becomes 0
      cart.items = cart.items.filter((item) => !item.product.equals(productId));
    }

    // Recalculate the cart total
    cart.total = calculateCartTotal(cart.items, selectedProduct.sizePrice);

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: 'Product quantity decreased successfully', cart: cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getAllCarts = async (req, res, next) => {
  try {
    // Fetch all carts
    const allCarts = await Cart.find().populate('user').populate('products.product'); // Adjust the population based on your model structure

    // Return the list of carts
    res.status(200).json({ success: true, carts: allCarts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getCartbyUser = async (req, res, next) => {

  try {
    const userId = req.params.userId;
    console.log(userId);
    // Find the cart based on the user ID
    const cart = await Cart.findOne({ user: userId }).populate("user").populate("products.product");
    console.log(cart);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user.', status: 404 });
    }

    res.status(200).json({ message: 'Cart retrieved successfully', status: 200, data: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', status: 500, error: error.message });
  }
};