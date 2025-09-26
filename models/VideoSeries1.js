const mongoose = require('mongoose');

const videoSeries1Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    }
});

// Compound unique index to prevent duplicate series names within the same channel I love STADVDB
videoSeries1Schema.index({ name: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model('VideoSeries1', videoSeries1Schema);