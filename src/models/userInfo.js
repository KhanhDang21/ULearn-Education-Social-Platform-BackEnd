const mongoose = require('mongoose');

const userInfoSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required!'],
            trim: true,
        },
        bio: {
            type: String,
        },
        university:{
            type: String,
        },
        imageId: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('UserInfo', userInfoSchema);