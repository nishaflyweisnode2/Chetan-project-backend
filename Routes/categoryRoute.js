const { createCategory, updateCategory, getCategory, getallCategory, getallCategoryForAdmin, deleteCategory, removeCategory, createSubCategory, lengthCategory, getSubcategory, getSubcategorybyId, deletesubCategory, updateSubcategory } = require("../Controller/categoryCtrl");
const { authorizeRoles } = require("../Middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: "dbcnha741", api_key: "865815848694583", api_secret: "j90xHfvjplpGsIlQxLw0De0SiwU", });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images/image",
    allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "webp", "WEBP"],
  },
});
const upload = multer({ storage: storage });
const router = require("express").Router();
router.post("/api/v1/catg/create", upload.single("image"), createCategory);
router.put("/api/v1/catg/update/:id", upload.single("image"), updateCategory);
router.put("/api/v1/catg/update/sub/:id", upload.single("image"), updateSubcategory);
router.get("/api/v1/catg/new/:id", /* authorizeRoles("admin"), */ getCategory);
router.get("/api/v1/catg/", /* authorizeRoles("admin"), */ getallCategory);
router.get("/api/v1/catg/CategoryForAdmin", /* authorizeRoles("admin"), */ getallCategoryForAdmin);
router.delete("/api/v1/catg/delete/category/:id", deleteCategory);
router.delete("/api/v1/catg/delete/sub/category/:id", deletesubCategory);
router.delete("/api/v1/catg/delete/:id", authorizeRoles("admin"), removeCategory);
router.post("/api/v1/catg/subcategory", upload.single("image"), createSubCategory);
router.get("/api/v1/catg/total-categories", lengthCategory);
router.get("/api/v1/catg/subcategory/get", getSubcategory);
router.get("/api/v1/catg/subcategoryId/:categoryId", getSubcategorybyId);
module.exports = router;