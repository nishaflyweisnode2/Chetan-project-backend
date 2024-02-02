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
        punchInLocationWord: {
                type: String
        },
        punchInLocation: {
                type: {
                        type: String,
                        default: "Point"
                },
                coordinates: {
                        type: [Number],
                        default: [0, 0]
                },
        },
        attendanceStatus: {
                type: String,
                enum: ['PRESENT', 'ABSENT'],
                default: 'PRESENT'
        },
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("punchIn", DocumentSchema);
