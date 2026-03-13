const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: String,
  postId: String,
  userId: String
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);
