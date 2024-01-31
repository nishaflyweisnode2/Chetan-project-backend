const express = require("express");
const router = express.Router();

const {
    getAllFaqs,
    getAll,

    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
} = require("../Controller/faqCtrl");

// Route for getting all FAQs
router.get("/:type", getAllFaqs);
router.get("/", getAll);

// Route for getting a single FAQ by ID
router.get("/:id", getFaqById);

// Route for creating a new FAQ
router.post("/", createFaq);

// Route for updating an existing FAQ
router.put("/:id", updateFaq);

// Route for deleting an existing FAQ
router.delete("/:id", deleteFaq);

module.exports = router;
