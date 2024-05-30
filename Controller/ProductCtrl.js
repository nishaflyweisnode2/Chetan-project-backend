const Product = require("../Model/productModel");
const cloudinary = require('cloudinary').v2;
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Wishlist = require("../Model/WishlistModel");
const mongoose = require("mongoose");
const ErrorHander = require("../utils/errorhander");
cloudinary.config({ cloud_name: "djgrqoefp", api_key: "274167243253962", api_secret: "3mkqkDDusI5Hf4flGNkJNz4PHYg", });
const cutOffTime = require('../Model/cutOffTime');
const Order = require("../Model/ShoppingCartOrderModel");
const Subscription = require("../Model/subscriptionModel");

// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];
  for (var i = 0; i < req.files.length; i++) {
    images.push({ img: req.files[i].path })
  }
  let multipleSize = []
  if (req.body.isMultiple == 'true') {
    for (let i = 0; i < req.body.multipleSize.length; i++) {
      let obj = {
        price: req.body.multiplePrice[i],
        size: req.body.multipleSize[i]
      }
      multipleSize.push(obj)
    }
  }
  console.log(multipleSize)
  const data = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    images,
    sizeInWord: req.body.sizeInWord,
    size: req.body.size,
    type: req.body.type,
    isMultiple: req.body.isMultiple,
    multipleSize: multipleSize,
    colors: req.body.colors,
    category: req.body.category,
    productType: req.body.productType,
    subCategory: req.body.subCategory,
    includeGst: req.body.includeGst,
    Stock: req.body.Stock,
    isStockInfinite: req.body.isStockInfinite,
    companyName: req.body.companyName,
    deliveryPinCodes: req.body.deliveryPinCodes
  }
  const product = await Product.create(data);

  res.status(201).json({
    success: true,
    product,
  });
});
exports.searchAllProducts = catchAsyncErrors(async (req, res, next) => {
  const productsCount = await Product.length;
  let apiFeature = await Product.aggregate([
    {
      $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "Category" },
    },
    { $unwind: "$category" },
    {
      $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "SubCategory", },
    },
    { $unwind: "$subCategory" },
  ]);
  if (req.query.search != (null || undefined)) {
    let data1 = [
      {
        $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "Category" },
      },
      { $unwind: "$category" },
      {
        $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "SubCategory", },
      },
      { $unwind: "$subCategory" },
      {
        $match: {
          $or: [
            { "name": { $regex: req.query.search, $options: "i" }, },
          ]
        }
      }
    ]
    apiFeature = await Product.aggregate(data1);
  }
  res.status(200).json({ success: true, productsCount, apiFeature, });
});
// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  console.log("hi")
  const products = await Product.find().populate("category").populate("subCategory").populate("user");

  res.status(200).json({
    success: true,
    products,
  });
});
exports.getPopularProducts = catchAsyncErrors(async (req, res, next) => {
  const productsCount = await Product.countDocuments(); // Corrected to countDocuments
  let apiFeature = await Product.aggregate([
    {
      $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "Category" },
    },
    { $unwind: "$category" },
    {
      $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "SubCategory", },
    },
    { $unwind: "$subCategory" },
    { $sort: { ratings: -1 } }
  ]);

  if (req.query.search) { // Simplified condition
    let data1 = [
      {
        $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "Category" },
      },
      { $unwind: "$category" },
      {
        $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "SubCategory", },
      },
      { $unwind: "$subCategory" },
      {
        $match: {
          $or: [
            { "name": { $regex: req.query.search, $options: "i" }, },
          ]
        }
      },
      { $sort: { ratings: -1 } }
    ]
    apiFeature = await Product.aggregate(data1);
  }

  return res.status(200).json({ success: true, productsCount, apiFeature });
});

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'profilePicture name').populate("category").populate("subCategory")
    .exec();;

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
// Update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }
    let images = [];
    for (var i = 0; i < req.files.length; i++) {
      images.push({ img: req.files[i].path })
    }
    let multipleSize = []
    if (req.body.isMultiple == 'true') {
      for (let i = 0; i < req.body.multipleSize.length; i++) {
        let obj = {
          price: req.body.multiplePrice[i],
          size: req.body.multipleSize[i]
        }
        multipleSize.push(obj)
      }
    }
    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        images,
        sizeInWord: req.body.sizeInWord,
        size: req.body.size,
        type: req.body.type,
        isMultiple: req.body.isMultiple,
        multipleSize: multipleSize,
        colors: req.body.colors,
        category: req.body.category,
        productType: req.body.productType,
        subCategory: req.body.subCategory,
        includeGst: req.body.includeGst,
        Stock: req.body.Stock,
        isStockInfinite: req.body.isStockInfinite,
        companyName: req.body.companyName,
        deliveryPinCodes: req.body.deliveryPinCodes
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
});
// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById({ _id: req.params.id });
  if (!product) {
    return res.status(404).json({ success: 404, message: "Product not found", data: {} });
  }
  await deleteOrderMorningOrder(req.params.id)
  await deleteOrderEveningOrder(req.params.id)
  await deleteSubscription(req.params.id)
  await product.deleteOne();
  return res.status(200).json({ success: true, message: "Product Delete Successfully", });
});
async function deleteOrderMorningOrder(productId) {
  try {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds();
    const currentTimeString = `${currentHour}:${currentMinute}:${currentSecond}`;
    currentDate.setHours(0, 0, 0, 0);
    console.log("morningOrder currentTimeString----------------------------", currentTimeString);
    const CutOffTimes = await cutOffTime.findOne({ type: "morningOrder" });
    console.log("morningOrder CutOffTimes----------------------------", CutOffTimes.time);
    const currentTimeParts = currentTimeString.split(":");
    const currentHours = parseInt(currentTimeParts[0]);
    const currentMinutes = parseInt(currentTimeParts[1]);
    const currentSeconds = parseInt(currentTimeParts[2]);
    const cutOffTimeParts = CutOffTimes.time.split(":");
    const cutOffHours = parseInt(cutOffTimeParts[0]);
    const cutOffMinutes = parseInt(cutOffTimeParts[1]);
    const cutOffSeconds = parseInt(cutOffTimeParts[2]);
    if ((cutOffHours > currentHours) || (cutOffHours === currentHours && cutOffMinutes > currentMinutes) || (cutOffHours === currentHours && cutOffMinutes === currentMinutes && cutOffSeconds > currentSeconds)) {
      let orders = await Order.find({ product: productId, startDate: { $gt: currentDate }, cutOffOrderType: "morningOrder" });
      if (orders.length > 0) {
        for (let i = 0; i < orders.length; i++) {
          await Order.findByIdAndDelete({ _id: orders[i]._id });
        }
      }
    } else {
      let orders = await Order.find({ product: productId, startDate: { $gte: currentDate }, cutOffOrderType: "morningOrder" });
      if (orders.length > 0) {
        for (let i = 0; i < orders.length; i++) {
          await Order.findByIdAndDelete({ _id: orders[i]._id });
        }
      }
    }
  } catch (error) {
    console.log("562----------------------------", error);
  }
};
async function deleteOrderEveningOrder(productId) {
  try {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds();
    const currentTimeString = `${currentHour}:${currentMinute}:${currentSecond}`;
    currentDate.setHours(0, 0, 0, 0);
    console.log("currentTimeString----------------------------", currentTimeString);
    const CutOffTimes = await cutOffTime.findOne({ type: "eveningOrder" });
    console.log("CutOffTimes----------------------------", CutOffTimes.time);
    const currentTimeParts = currentTimeString.split(":");
    const currentHours = parseInt(currentTimeParts[0]);
    const currentMinutes = parseInt(currentTimeParts[1]);
    const currentSeconds = parseInt(currentTimeParts[2]);
    const cutOffTimeParts = CutOffTimes.time.split(":");
    const cutOffHours = parseInt(cutOffTimeParts[0]);
    const cutOffMinutes = parseInt(cutOffTimeParts[1]);
    const cutOffSeconds = parseInt(cutOffTimeParts[2]);
    if ((cutOffHours > currentHours) || (cutOffHours === currentHours && cutOffMinutes > currentMinutes) || (cutOffHours === currentHours && cutOffMinutes === currentMinutes && cutOffSeconds > currentSeconds)) {
      let orders = await Order.find({ product: productId, startDate: { $gte: currentDate }, cutOffOrderType: "eveningOrder" });
      if (orders.length > 0) {
        for (let i = 0; i < orders.length; i++) {
          await Order.findByIdAndDelete({ _id: orders[i]._id });
        }
      }
    }
  } catch (error) {
    console.log("562----------------------------", error);
  }
};
async function deleteSubscription(productId) {
  try {
    let orders = await Subscription.find({ product: productId, });
    if (orders.length > 0) {
      for (let i = 0; i < orders.length; i++) {
        await Subscription.findByIdAndDelete({ _id: orders[i]._id });
      }
    }
  } catch (error) {
    console.log("562----------------------------", error);
  }
};
// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Your review has been saved.',
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: `Something Went Wrong in ${error.message} `,
    });
  }

});
// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
exports.createWishlist = catchAsyncErrors(async (req, res, next) => {
  const product = req.params.id;
  //console.log(user)
  let wishList = await Wishlist.findOne({ user: req.user._id });
  if (!wishList) {
    wishList = new Wishlist({
      user: req.user,
    });
  }
  wishList.products.addToSet(product);
  await wishList.save();
  res.status(200).json({
    message: "product addedd to wishlist Successfully",
  });
});
exports.removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return next(new ErrorHander("Wishlist not found", 404));
  }
  const product = req.params.id;

  wishlist.products.pull(new mongoose.Types.ObjectId(product));

  await wishlist.save();
  res.status(200).json({
    success: true,
    message: "Removed From Wishlist",
  });
});
exports.myWishlist = catchAsyncErrors(async (req, res, next) => {
  let myList = await Wishlist.findOne({ user: req.user._id }).populate(
    "products"
  );

  if (!myList) {
    myList = await Wishlist.create({
      user: req.user._id,
    });
  }
  res.status(200).json({
    success: true,
    wishlist: myList,
  });
});
exports.getProductByCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const producyBycategory = await Product.find({ subCategory: req.params.id })

    res.status(200).json({
      message: "get Successfully",
      data: producyBycategory
    })

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})
exports.checkDelivery = catchAsyncErrors(async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const userPincode = req.body.userPincode;

    // Check if the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.', status: 404 });
    }

    // Check if the provided pincode is in the list of allowed pincodes for the product
    const canDeliver = product.deliveryPinCodes.includes(userPincode);

    if (canDeliver) {
      res.status(200).json({ message: 'Product can be delivered to the provided pincode.', status: 200 });
    } else {
      res.status(403).json({ message: 'Product cannot be delivered to the provided pincode.', status: 403 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', status: 500, error: error.message });
  }
});
exports.paginateProductSearch = async (req, res) => {
  try {
    const { search, fromDate, toDate, subCategory, category, status, page, limit } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { "name": { $regex: req.query.search, $options: "i" }, },
      ]
    }
    if (status) {
      query.status = status
    }
    if (subCategory) {
      query.subCategory = subCategory
    }
    if (category) {
      query.category = category
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
      populate: ('category subCategory')
    };
    let data = await Product.paginate(query, options);
    return res.status(200).json({ status: 200, message: "Product data found.", data: data });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
  }
};