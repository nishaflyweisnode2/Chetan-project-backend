const Coupon = require("../Model/couponModel");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const moment = require("moment");
const orderModel = require("../Model/ShoppingCartOrderModel");

exports.createCoupon = async (req, res, next) => {
  try {
      console.log("enetred create coupon");
    const couponExists = await Coupon.findOne({
      couponCode: req.body.couponCode,
    });

    if (couponExists) {
      return next(new ErrorHander("coupon with code already exists", 400));
    }

    req.body.activationDate = req.body.activationDate || new Date(moment().format("YYYY-MM-DD"));

    if (
      !moment(new Date()).isSameOrBefore(req.body.activationDate, "day") ||
      !moment(req.body.expirationDate).isAfter(req.body.activationDate, "day")
    ) {
        return next(new ErrorHander("invalid activation or expiration date", 400));
    }

    const coupon = await Coupon.create(req.body);

    return res.status(200).json({
        success: true,
        msg: "coupon created",
        coupon
    })
  } catch (error) {
    next(error);
  }
};

exports.getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find({}).populate("category");

        return res.status(200).json({
            success: true,
            msg: "coupons",
            coupons
        })
    } catch(error) {
        next (error);
    }
}

exports.getActiveCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find({
            expirationDate: {$gte: new Date(moment().format("YYYY-MM-DD"))},
            activationDate: {$lte: new Date(moment().format("YYYY-MM-DD"))}
        })

        return res.status(200).json({
            success: true,
            msg: "active coupons",
            coupons
        })
    } catch (error) {
        next (error);
    }
}

exports.deleteCoupon = async (req, res, next) => {
    try {
        await Coupon.findByIdAndDelete(req.params.couponId);

        return res.status(200).json({
            msg: "coupon deleted"
        })
    } catch (error) {
        next (error);
    }
}

exports.updateCoupon = async (req, res, next) => {
    try {
      const couponId = req.params.id;
      const { couponCode, discount, activationDate, expirationDate,minOrder ,category} = req.body;
  
      // Check if the coupon with the given ID exists
      const existingCoupon = await Coupon.findById(couponId);
  
      if (!existingCoupon) {
        return next(new ErrorHander('Coupon not found.', 404));
      }
  
      // Update the existing coupon
      existingCoupon.couponCode = couponCode || existingCoupon.couponCode;
      existingCoupon.discount = discount || existingCoupon.discount;
      existingCoupon.activationDate = activationDate || existingCoupon.activationDate;
      existingCoupon.expirationDate = expirationDate || existingCoupon.expirationDate;
      existingCoupon.minOrder = minOrder || existingCoupon.minOrder;
      existingCoupon.category = category || existingCoupon.category;

  
      // Save the updated coupon to the database
      const updatedCoupon = await existingCoupon.save();
  
      res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: updatedCoupon,
      });
    } catch (error) {
      next(error);
    }
  };
  