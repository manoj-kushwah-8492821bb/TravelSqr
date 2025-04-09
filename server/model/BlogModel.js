// models/blog.js

const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2"); // Import Plugin
const { file } = require("pdfkit");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  introduction: {
    type: String,
    required: true,
  },
  tips: {
    type: [String],
    default: [], 
    required: true,
  },
  conclusion: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String], // Added Keywords Field
    default: [],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String
  }
});

// ✅ Add Pagination Plugin
blogSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Blog", blogSchema);
