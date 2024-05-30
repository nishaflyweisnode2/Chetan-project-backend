const Category = require("../Model/categoryModel");
const SubCategory = require("../Model/SubCategoryModel");
const Product = require("../Model/productModel");

const catchAsyncErrors = require("../Middleware/catchAsyncErrors");

///////////
const imagePattern = "[^\\s]+(.*?)\\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$";
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

const createCategory = async (req, res) => {
  try {
    let findCategory = await Category.findOne({ name: req.body.name });
    console.log(req.body.name)
    if (findCategory) {
      res.status(409).json({ message: "category already exit.", status: 404, data: {} });
    } else {
      upload.single("image")(req, res, async (err) => {
        if (err) { return res.status(400).json({ msg: err.message }); }
        if (req.file.size > 5 * 1024 * 1024) {
          res.status(403).json({ message: "image size more than  5 mb.", status: 403, data: {} });
        }
        const fileUrl = req.file ? req.file.path : "";
        const data = { name: req.body.name, image: fileUrl };
        const category = await Category.create(data);
        res.status(200).json({ message: "category add successfully.", status: 200, data: category });
      })
    }

  } catch (error) {
    res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
  }
};
////////////////////////////////////////// UPDATE CATEGORY  //////////////////////////////////

const updateCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
      if (req.file.size > 5 * 1024 * 1024) {
        res.status(403).json({ message: "image size more than  5 mb.", status: 403, data: {} });
      }
      fileUrl = req.file ? req.file.path : "";
    } else {
      fileUrl = category.image;
    }
    category.image = fileUrl
    category.name = req.body.name;
    let update = await category.save();
    res.status(200).json({ message: "Updated Successfully", data: update });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", status: 500, error: error.message });
  }
});
const updateSubcategory = async (req, res) => {
  const { id } = req.params;
  const subcategory = await SubCategory.findById(id);
  if (!subcategory) {
    res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
  }
  let fileUrl;
  if (req.file) {
    if (req.file.size > 5 * 1024 * 1024) {
      res.status(403).json({ message: "image size more than  5 mb.", status: 403, data: {} });
    }
    fileUrl = req.file ? req.file.path : "";
  } else {
    fileUrl = subcategory.image;
  }
  subcategory.image = fileUrl;
  subcategory.subCategory = req.body.subCategory;
  subcategory.parentCategory = req.body.parentCategory;
  let update = await subcategory.save();
  res.status(200).json({ message: "Updated Successfully", data: update });
};
////////////////////////////////////////// DELETE CATEGORY  //////////////////////////////////

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const getaCategory = await Category.findById(id);
    // const { id } = req.params;
    // const category = await Category.findById(id);
    // console.log(category);
    // if (!category) {
    //   res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    // } else {
    const deletedCategory = await Category.findByIdAndDelete(getaCategory);
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
};
const deletesubCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const getaCategory = await SubCategory.findById(id);
    // const { id } = req.params;
    // const category = await Category.findById(id);
    // console.log(category);
    // if (!category) {
    //   res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    // } else {
    const deletedCategory = await SubCategory.findByIdAndDelete(getaCategory);
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
};


////////////////////////////////////////// REMOVE CATEGORY  //////////////////////////////////

const removeCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) new ErrorHander("Category Not Found !", 404);

  const subCategory = await SubCategory.find({ parentCategory: id });

  subCategory.map(
    async (item) => await SubCategory.deleteOne({ _id: item.id })
  );

  category.remove();

  res.status(200).json({ message: "Category Deleted Successfully !" });
});

////////////////////////////////////////// GET CATEGORY  //////////////////////////////////

const getCategory = catchAsyncErrors(async (req, res) => {
  console.log("hi");
  const { id } = req.params;
  try {
    const getCategory = await Category.findById(id);
    if (!getCategory) {
      return res.status(404).json({ message: "No Category Found", status: 404, data: {} });
    } else {
      return res.json(getaCategory);
    }
  } catch (error) {
    throw new Error(error);
  }
});

////////////////////////////////////////// GET ALL CATEGORY  //////////////////////////////////

// const getallCategory = catchAsyncErrors(async (req, res) => {
//   try {
//     const categories = await Category.find();
//     return res.status(201).json({ success: true, categories, });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getallCategory = catchAsyncErrors(async (req, res) => {
  try {
    const categories1 = await Category.find();
    if (categories1.length === 0) {
      return res.status(404).json({ message: "No Category Found", status: 404, data: {} });
    } else {
      const categoriesWithData = await Promise.all(categories1.map(async (item) => {
        const productsCount = await Product.countDocuments({ category: item._id });
        if (productsCount > 0) {
          return item;
        }
      }));
      const categories = categoriesWithData.filter((category) => category !== undefined);
      return res.status(200).json({ success: true, categories });
    }
  } catch (error) {
    throw new Error(error);
  }
});
////////////////////////////////////////// CREATE SUB-CATEGORY  //////////////////////////////////

const createSubCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    let findSubCategorys = await SubCategory.findOne({ subCategory: req.body.subCategory });
    console.log(req.body.subCategory)
    if (findSubCategorys) {
      res.status(409).json({ message: "SubCategory already exit.", status: 404, data: {} });
    } else {
      upload.single("image")(req, res, async (err) => {
        if (err) { return res.status(400).json({ msg: err.message }); }
        const fileUrl = req.file ? req.file.path : "";
        const data = { parentCategory: req.body.parentCategory, subCategory: req.body.subCategory, image: fileUrl };
        const SubCategorys = await SubCategory.create(data);
        res.status(200).json({ message: "SubCategory add successfully.", status: 200, data: SubCategorys });
      })
    }

  } catch (error) {
    res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
  }
});

//   try {
//   const { parentCategory, subCategory, image } = req.body;

//   // Check if the subcategory already exists
//   const existingSubCategory = await SubCategory.findOne({ subCategory });
//   if (existingSubCategory) {
//     return res.status(400).json({ message: "Subcategory already exists" });
//   }

//   const newSubCategory = new SubCategory({
//     parentCategory,
//     subCategory,
//     image,
//   });

//   // Save the new subcategory to the database
//   const createdSubCategory = await newSubCategory.save();

//   res.status(201).json({
//     success: true,
//     subCategory: createdSubCategory,
//   });
// } catch (error) {
//   console.error(error);
//   res.status(500).json({ message: "Internal Server Error" });
// }
// });

////////////////////////////////////////// TOTAL CATEGORY  //////////////////////////////////

const lengthCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Category.find();
    res.status(200).json({
      total: data.length,
    });
    console.log(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
    });
  }
});

const getSubcategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const subcategories = await SubCategory.find().populate("parentCategory");
    res.status(200).json(subcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
});


const getSubcategorybyId = catchAsyncErrors(async (req, res, next) => {
  const categoryId = req.params.categoryId;

  try {
    const subcategories = await SubCategory.find({ parentCategory: categoryId });
    res.status(200).json(subcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
});

module.exports = {
  getSubcategorybyId,
  createCategory,
  updateCategory,
  updateSubcategory,
  removeCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  createSubCategory,
  lengthCategory,
  getSubcategory,
  deletesubCategory
}