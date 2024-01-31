// class ApiFeatures {
//   constructor(query, queryStr) {
//     this.query = query;
//     this.queryStr = queryStr;
//   }

//   search() {
//     const keyword = this.queryStr.keyword
//       ? {
//         name: {
//           $regex: this.queryStr.keyword,
//           $options: "i",
//         },
//       }
//       : {};

//     this.query = this.query.find({ ...keyword });
//     this.query = this.query.aggregate([
//       {
//         $match: { ...keyword },
//       },
//       {
//         $group: {
//           "category": "$category.parentCategory",
//           "images": "$images.url",
//           "productId": "$_id"
//         }
//       },
//       {
//         $project: {
//           "id": "$productId",
//           "rating": 1,
//           "name": 1,
//           "price": 1,
//           "category": "$category",
//         }
//       }
//     ]);
//     return this;
//   }

//   filter() {
//     const queryCopy = { ...this.queryStr };

//     const removeFields = ["keyword", "page", "limit"];

//     removeFields.forEach((key) => delete queryCopy[key]);

//     let queryStr = JSON.stringify(queryCopy);
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

//     this.query = this.query.find(JSON.parse(queryStr));

//     return this;
//   }

//   pagination(resultPerPage) {
//     const currentPage = Number(this.queryStr.page) || 1;

//     const skip = resultPerPage * (currentPage - 1);

//     this.query = this.query.limit(resultPerPage).skip(skip);

//     return this;
//   }
// }



// module.exports = ApiFeatures;


const productModel = require("../Model/productModel");
const productServices = {

  searchProduct: async (validatedBody) => {
    let productRes = await productModel.find({ });
    if (productRes) {
      let data = validatedBody.search || ""
      let data1 = [
        {
          $lookup: {
            from: "categories",
            let: {
              categoryId: "$categoryId"
            },
            as: "categoryDetails",
            pipeline: [{
              $match: {
                $expr: { $eq: ["$$categoryId", "$_id"] },
              }
            }]
          },
        }, {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true
          }
        }, {
          $match: {
            $or: [{ "categoryDetails.categoryName": { $regex: data, $options: "i" } }, { "item": { $regex: data, $options: "i" } }]
          }
        }, {
          $match: { "status": "ACTIVE" },
        },
        { $sort: { createdAt: -1 } },
      ]
      return productModel.aggregate(data1)

    }
  }


}
module.exports = { productServices };