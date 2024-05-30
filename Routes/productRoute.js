const express = require("express");
const { searchAllProducts, createProduct, paginateProductSearch, getPopularProducts, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview, getAdminProducts, createWishlist, removeFromWishlist, myWishlist, checkDelivery, getProductByCategory } = require("../Controller/ProductCtrl");
const { isAuthenticatedUser, authorizeRoles } = require("../Middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: "djgrqoefp", api_key: "274167243253962", api_secret: "3mkqkDDusI5Hf4flGNkJNz4PHYg", });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images/image",
    allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
  },
});
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/api/v1/product/search", paginateProductSearch);
router.get("/api/v1/product/getPopularProducts", getPopularProducts);
router.get("/api/v1/product/by/category/:id", getProductByCategory);
router.post("/api/v1/product/add/wishlist/:id", isAuthenticatedUser, createWishlist);
router.put("/api/v1/product/remove/wishlist/:id", isAuthenticatedUser, removeFromWishlist);
router.get("/api/v1/product/wishlist/me", isAuthenticatedUser, myWishlist);
router.get("/api/v1/product/admin/products", getAdminProducts);
router.post("/api/v1/product/admin/product/new", upload.array("image"), createProduct);
router.put("/api/v1/product/update/:id", upload.array("image"), updateProduct)
router.delete("/api/v1/product/delete/:id", deleteProduct);
router.get("/api/v1/product/:id", getProductDetails);
router.put("/api/v1/product/review", isAuthenticatedUser, createProductReview);
router.get("/api/v1/product/reviews", getProductReviews)
router.delete("/api/v1/product/reviews", isAuthenticatedUser, deleteReview);
router.post("/api/v1/product/checkDelivery/:productId", checkDelivery);

module.exports = router;

