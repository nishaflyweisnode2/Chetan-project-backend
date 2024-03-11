const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const DocumentSchema = schema({
        driverId: {
                type: schema.Types.ObjectId,
                ref: "driver"
        },
        amount: {
                type: String
        },
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("collectedAmount", DocumentSchema);
