const Product = require("../Model/productModel");
const cloudinary = require('cloudinary').v2;
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const Wishlist = require("../Model/WishlistModel");
const mongoose = require("mongoose");
const ErrorHander = require("../utils/errorhander");
cloudinary.config({
  cloud_name: "dvwecihog",
  api_key: '364881266278834',
  api_secret: '5_okbyciVx-7qFz7oP31uOpuv7Q'
});


// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];
  for (var i = 0; i < req.files.length; i++) {
    images.push({ img: req.files[i].path })
  }
  const data = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    images,
    sizeInWord: req.body.sizeInWord,
    size: req.body.size,
    type: req.body.type,
    isMultiple: req.body.isMultiple,
    multipleSize: req.body.multipleSize,
    colors: req.body.colors,
    category: req.body.category,
    subCategory: req.body.subCategory,
    includeGst: req.body.includeGst,
    Stock: req.body.Stock,
    deliveryPinCodes: req.body.deliveryPinCodes
  }
  const product = await Product.create(data);

  res.status(201).json({
    success: true,
    product,
  });
});

exports.searchAllProducts = catchAsyncErrors(async (req, res, next) => {
  const productsCount = await Product.count();
  let apiFeature = await Product.aggregate([
    {
      $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" },
    },
    { $unwind: "$category" },
    {
      $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "subCategory", },
    },
    { $unwind: "$subCategory" },
  ]);
  if (req.query.search != (null || undefined)) {
    let data1 = [
      {
        $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" },
      },
      { $unwind: "$category" },
      {
        $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "subCategory", },
      },
      { $unwind: "$subCategory" },
      {
        $match: {
          $or: [
            { "category.name": { $regex: req.query.search, $options: "i" }, },
            { "subCategory.subCategory": { $regex: req.query.search, $options: "i" }, },
            { "name": { $regex: req.query.search, $options: "i" }, },
            { "description": { $regex: req.query.search, $options: "i" }, },
            { "colors": { $regex: req.query.search, $options: "i" }, }
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
  console.log("hi")
  const products = await Product.find().populate("category").populate("subCategory").sort({ ratings: -1 });

  return res.status(200).json({ success: true, products, });
});
// Get Product Details
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
        multipleSize: req.body.multipleSize,
        colors: req.body.colors,
        category: req.body.category,
        subCategory: req.body.subCategory,
        includeGst: req.body.includeGst,
        Stock: req.body.Stock,
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
    return next(new ErrorHander("Product not found", 404));
  }

  // Deleting Images From Cloudinary
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

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