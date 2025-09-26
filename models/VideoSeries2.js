const mongoose = require('mongoose');

const videoSeries2Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    videoSeries1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoSeries1',
        required: true
    }
});

// Prevent duplicate series 2 names within the same VideoSeries1
videoSeries2Schema.index({ name: 1, videoSeries1: 1 }, { unique: true });

module.exports = mongoose.model('VideoSeries2', videoSeries2Schema);