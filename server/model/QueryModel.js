const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2"); // Import Plugin

const querySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
        },
        email: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending"
        },
        remark: {
            type: String
        }
    },
    { timestamps: true }
);

// ✅ Add Pagination Plugin
querySchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Query", querySchema);
