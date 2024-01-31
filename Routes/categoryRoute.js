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

router.post("/create", createCategory);
router.put("/update/:id", updateCategory);
router.put("/update/sub/:id", updateSubcategory);


router.get("/new/:id", /* authorizeRoles("admin"), */ getCategory);
router.get("/", /* authorizeRoles("admin"), */ getallCategory);
router.delete("/delete/category/:id", deleteCategory);
router.delete("/delete/sub/category/:id", deletesubCategory);
router.delete("/delete/:id", authorizeRoles("admin"), removeCategory);
router.post("/subcategory", createSubCategory);
router.get("/total-categories", lengthCategory);

router.get("/subcategory/get", getSubcategory);
router.get("/subcategoryId/:categoryId", getSubcategorybyId);

module.exports = router;  