const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
    },
    imageId: {
      type: String,
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    status: {
      type: Boolean,
      default: true 
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Group', groupSchema);
