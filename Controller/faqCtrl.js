const Faq = require("../Model/faqModel");
// const { createResponse } = require("../utils/response");

// Get all FAQs
const getAllFaqs = async (req, res) => {
    const supportType = req.params.type;

    try {
      const supportData = await Faq.find({ type: supportType });
      res.json(supportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching support data.' });
    }
  };
  const getAll = async (req, res) => {
    const supportType = req.params.type;

    try {
      const supportData = await Faq.find();
      res.json(supportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching support data.' });
    }
  };

// Get a specific FAQ by ID
const getFaqById = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await Faq.findById(id);
        if (!faq) {
            return res.status(404).json( "Not Found");
        }
        return res.status(200).json( "faqs retrieved successfully", faq);
    } catch (err) {
        console.log(err);
        return res.status(500).json( "Error", err.message);
    }
};

// Create a new FAQ
const createFaq = async (req, res) => {
    console.log("hi");
    const { question, answer,type } = req.body;
    // try {
        if (!question || !answer) {
            return res.status(404).json(
                "questions and answers cannot be blank"
            );
        }
        const faq = await Faq.create(req.body);
        console.log("hi");
        res.status(201).json({
            success: true,
            faq,
          });
        };
      

// Update an existing FAQ by ID
const updateFaq = async (req, res) => {
    const { id } = req.params;
    //     const { question, answer } = req.body;
    try {
        const faq = await Faq.findByIdAndUpdate(id, req.body, { new: true });
        if (!faq) {
            return res.status(200).json( "Not Found");
        }
        return res.status(200).json( "FAQ Updated Successfully", faq);
    } catch (err) {
        console.log(err);
        return res.status(500).json( "Something went wrong", err.message);
    }
};

// Delete an existing FAQ by ID
const deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findById(req.params.id);
        
        if (!faq) {
            return res.status(404).json({ message: "Faq not found" });
        }
      
        await Faq.findByIdAndDelete(req.params.id);
      
        res.status(200).json({
            success: true,
            message: "Faq Deleted Successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = {
    getAllFaqs,
    getAll,

    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
};
