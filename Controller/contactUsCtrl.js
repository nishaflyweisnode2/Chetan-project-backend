const ContactUs = require("../Model/contactUs");
// const { createResponse } = require("../utils/response");

// Get the about us information
const create = async (req, res) => {
    try {
        const data = await ContactUs.findOne();
        if (data) {
            let obj = {
                title: req.body.title || data.title,
                content: req.body.content || data.content,
                email: req.body.email || data.email,
                whatApp: req.body.whatApp || data.whatApp,
                imageUrl: req.body.imageUrl || data.imageUrl,
            }
            let update = await ContactUs.findOneAndUpdate({ _id: data._id }, { $set: obj }, { new: true });
            res.status(200).json({
                details: update,
            });
        } else {
            const contactUs = await ContactUs.create(req.body);
            res.status(200).json({
                details: contactUs,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json("Server error");
    }
};
const getContactUs = async (req, res) => {
    try {
        const data = await ContactUs.findOne();
        // console.log(data);
        res.status(200).json({
            contactus: data
        })

    } catch (err) {
        res.status(400).send({ mesage: err.mesage });
    }
}

const deleteContactUs = async (req, res) => {
    try {
        const aboutUs = await ContactUs.findByIdAndDelete(req.params.id);
        if (!aboutUs) {
            res.status(404).json("ContactUs not found");
        } else {
            res.status(200).json("ContactUs deleted successfully");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
};
module.exports = { create, getContactUs, deleteContactUs };