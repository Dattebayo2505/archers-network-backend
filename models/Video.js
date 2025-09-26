const mongoose = require('mongoose');

// Require everything, no nullable
const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    videoSeries1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoSeries1',
        required: true
    },
    videoSeries2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoSeries2',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Video', videoSchema);