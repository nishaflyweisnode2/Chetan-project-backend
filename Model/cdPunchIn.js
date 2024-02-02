const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const DocumentSchema = schema({
        driverId: {
                type: schema.Types.ObjectId,
                ref: "driver"
        },
        userId: {
                type: schema.Types.ObjectId,
                ref: "user"
        },
        currentDate: {
                type: Number
        },
        month: {
                type: String
        },
        year: {
                type: String
        },
        date: {
                type: String
        },
        day: {
                type: String
        },
        punchIn: {
                type: String
        },
        punchOut: {
                type: String
        },
        punchType: {
                type: String,
                enum: ["Punch In", "Punch Out"],
                default: "Punch In"
        },
        totalTime: {
                type: String
        },
        workingTime: {
                type: String
        },
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("collectionDeliveryPunchIn", DocumentSchema);
