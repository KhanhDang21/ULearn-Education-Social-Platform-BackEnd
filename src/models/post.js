const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false
    },
    imageId: {
      type: String,
      trim: true
    },
    content: {
      type: String
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    react: {
      type: Number,
      default: 0
    },
    status: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema); 