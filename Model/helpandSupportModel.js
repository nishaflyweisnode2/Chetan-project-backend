const mongoose = require('mongoose');



const helpandSupport = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
    },
    email: {
        type: String
    }, 
    phone: {
        type: Number
    }, 
    query: {
        type: String
    }
})


const help = mongoose.model('help&suuport', helpandSupport);

module.exports = help