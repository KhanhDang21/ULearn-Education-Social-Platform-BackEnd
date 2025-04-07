const { Timestamp } = require('firebase-admin/firestore');
const mongoose = require('mongoose');

const imageSchema = mongoose.Schema(
    {
        data: Buffer,
        contentType: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Image', imageSchema);