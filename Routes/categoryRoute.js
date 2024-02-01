const {
  createCategory,
  updateCategory,
  getCategory,
  getallCategory,
  deleteCategory,
  removeCategory,
  createSubCategory,
  lengthCategory,
  getSubcategory,
  getSubcategorybyId,
  deletesubCategory,
  updateSubcategory
} = require("../Controller/categoryCtrl");
const { authorizeRoles } = require("../Middleware/auth");



const router = require("express").Router();

router.post("/api/v1/catg/create", createCategory);
router.put("/api/v1/catg/update/:id", updateCategory);
router.put("/api/v1/catg/update/sub/:id", updateSubcategory);
router.get("/api/v1/catg/new/:id", /* authorizeRoles("admin"), */ getCategory);
router.get("/api/v1/catg/", /* authorizeRoles("admin"), */ getallCategory);
router.delete("/api/v1/catg/delete/category/:id", deleteCategory);
router.delete("/api/v1/catg/delete/sub/category/:id", deletesubCategory);
router.delete("/api/v1/catg/delete/:id", authorizeRoles("admin"), removeCategory);
router.post("/api/v1/catg/subcategory", createSubCategory);
router.get("/api/v1/catg/total-categories", lengthCategory);
router.get("/api/v1/catg/subcategory/get", getSubcategory);
router.get("/api/v1/catg/subcategoryId/:categoryId", getSubcategorybyId);
module.exports = router;  