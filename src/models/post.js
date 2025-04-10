const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'UserId is required!'],
            trim: true,
        },
        imageId: {
            type: String,
            trim: true
        },
        content: {
            type: String
        },
        comments: [{
            type: mongoose.Types.ObjectId,
        }],
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