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
router.get("/api/v1/faqs/:type", getAllFaqs);
router.get("/api/v1/faqs/", getAll);

// Route for getting a single FAQ by ID
router.get("/api/v1/faqs/:id", getFaqById);

// Route for creating a new FAQ
router.post("/api/v1/faqs/", createFaq);

// Route for updating an existing FAQ
router.put("/api/v1/faqs/:id", updateFaq);

// Route for deleting an existing FAQ
router.delete("/api/v1/faqs/:id", deleteFaq);

module.exports = router;
