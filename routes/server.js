const express = require('express');
const Video = require('../models/Video');
const Channel = require('../models/Channel');
const VideoSeries1 = require('../models/VideoSeries1');
const VideoSeries2 = require('../models/VideoSeries2');
const router = express.Router();

// Create a new video
router.post('/create', async (req, res) => {
    try {
        const { title, date, description, link, channel, videoSeries1, videoSeries2 } = req.body;

        // Validate required fields
        if (!title || !date || !description || !link || !channel || !videoSeries1 || !videoSeries2) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required: title, date, description, link, channel, videoSeries1, videoSeries2' 
            });
        }

        // Find or create channel document
        let channelDocument = await Channel.findOne({ name: channel });
        if (!channelDocument) {
            channelDocument = new Channel({ name: channel });
            await channelDocument.save();
        }

        // Find or create video series 1 document
        let videoSeries1Document = await VideoSeries1.findOne({ 
            name: videoSeries1, 
            channel: channelDocument._id 
        });
        if (!videoSeries1Document) {
            videoSeries1Document = new VideoSeries1({ 
                name: videoSeries1, 
                channel: channelDocument._id 
            });
            await videoSeries1Document.save();
        }

        // Find or create video series 2 document
        let videoSeries2Document = await VideoSeries2.findOne({ 
            name: videoSeries2, 
            videoSeries1: videoSeries1Document._id 
        });
        if (!videoSeries2Document) {
            videoSeries2Document = new VideoSeries2({ 
                name: videoSeries2, 
                videoSeries1: videoSeries1Document._id 
            });
            await videoSeries2Document.save();
        }

        // Create new video document
        const newVideo = new Video({
            title,
            date: new Date(date),
            description,
            link,
            channel: channelDocument._id,
            videoSeries1: videoSeries1Document._id,
            videoSeries2: videoSeries2Document._id
        });

        await newVideo.save();
        
        await newVideo.populate(['channel', 'videoSeries1', 'videoSeries2']);
        
        res.status(201).json({
            success: true,
            message: 'Video created successfully',
            data: {
                video: newVideo
            }
        });
        
    } catch (error) {
        console.error("Error creating video:", error);
        
        if (error.code === 11000) {
            res.status(400).json({ 
                success: false, 
                message: 'Video with this link already exists' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Error creating video',
                error: error.message 
            });
        }
    }
});

// Update an existing video
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        // Handle channel lookup if provided as name
        if (updateData.channel && typeof updateData.channel === 'string') {
            const channelDocument = await Channel.findOne({ name: updateData.channel });
            if (channelDocument) {
                updateData.channel = channelDocument._id;
            } else {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Channel not found' 
                });
            }
        }

        // Handle video series 1 lookup if provided as name
        if (updateData.videoSeries1 && typeof updateData.videoSeries1 === 'string') {
            const videoSeries1Document = await VideoSeries1.findOne({ 
                name: updateData.videoSeries1,
                channel: updateData.channel 
            });
            if (videoSeries1Document) {
                updateData.videoSeries1 = videoSeries1Document._id;
            } else {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Video Series 1 not found' 
                });
            }
        }

        // Handle video series 2 lookup if provided as name
        if (updateData.videoSeries2 && typeof updateData.videoSeries2 === 'string') {
            const videoSeries2Document = await VideoSeries2.findOne({ 
                name: updateData.videoSeries2,
                videoSeries1: updateData.videoSeries1 
            });
            if (videoSeries2Document) {
                updateData.videoSeries2 = videoSeries2Document._id;
            } else {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Video Series 2 not found' 
                });
            }
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate(['channel', 'videoSeries1', 'videoSeries2']);

        if (!updatedVideo) {
            return res.status(404).json({ 
                success: false, 
                message: 'Video not found' 
            });
        }

        res.json({
            success: true,
            message: 'Video updated successfully',
            data: {
                video: updatedVideo
            }
        });
        
    } catch (error) {
        console.error("Error updating video:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating video',
            error: error.message 
        });
    }
});

// Delete a video from the database
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedVideo = await Video.findByIdAndDelete(id)
            .populate(['channel', 'videoSeries1', 'videoSeries2']);

        if (!deletedVideo) {
            return res.status(404).json({ 
                success: false, 
                message: 'Video not found' 
            });
        }

        res.json({
            success: true,
            message: 'Video deleted successfully',
            data: {
                video: deletedVideo
            }
        });
        
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting video',
            error: error.message 
        });
    }
});

// Retrieve all videos
router.get('/get', async (req, res) => {
    try {
        const allVideos = await Video.find()
            .populate('channel')
            .populate('videoSeries1')
            .populate('videoSeries2')
            .sort({ date: -1 });
            
        res.json({
            success: true,
            message: 'Videos retrieved successfully',
            data: {
                count: allVideos.length,
                videos: allVideos
            }
        });
        
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving videos',
            error: error.message 
        });
    }
});

// Retrieve specific video by ID
router.get('/get/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const foundVideo = await Video.findById(id)
            .populate('channel')
            .populate('videoSeries1')
            .populate('videoSeries2');
            
        if (!foundVideo) {
            return res.status(404).json({ 
                success: false, 
                message: 'Video not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Video retrieved successfully',
            data: {
                video: foundVideo
            }
        });
        
    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving video',
            error: error.message 
        });
    }
});

// Retrieve all videos from a specific video series
router.get('/select-all/:series', async (req, res) => {
    try {
        const { series } = req.params;
        
        const videoSeries2Document = await VideoSeries2.findOne({ name: series });
        if (!videoSeries2Document) {
            return res.status(404).json({ 
                success: false,
                message: `Video Series 2 not found: ${series}` 
            });
        }

        const seriesVideos = await Video.find({ videoSeries2: videoSeries2Document._id })
            .populate('channel')
            .populate('videoSeries1')
            .populate('videoSeries2')
            .sort({ date: -1 });

        if (seriesVideos.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: `No videos found for series: ${series}` 
            });
        }

        res.json({
            success: true,
            message: 'Videos retrieved successfully',
            data: {
                series: series,
                count: seriesVideos.length,
                videos: seriesVideos
            }
        });
        
    } catch (error) {
        console.error("Error fetching series videos:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving series videos',
            error: error.message 
        });
    }
});

router.get('/get-latest/:channel', async (req, res) => {
    try {
        const { channel } = req.params;
        
        // Find the channel document by name
        const channelDocument = await Channel.findOne({ name: channel });
        if (!channelDocument) {
            return res.status(404).json({ 
                success: false,
                message: `Channel not found: ${channel}` 
            });
        }

        const latestVideoFromChannel = await Video.findOne({ channel: channelDocument._id })
            .populate('channel')
            .populate('videoSeries1')
            .populate('videoSeries2')
            .sort({ date: -1 })
            .limit(1);

        if (!latestVideoFromChannel) {
            return res.status(404).json({ 
                success: false,
                message: `No videos found for channel: ${channel}` 
            });
        }

        res.json({
            success: true,
            message: 'Latest video retrieved successfully',
            data: {
                channel: channel,
                latestVideo: latestVideoFromChannel
            }
        });
        
    } catch (error) {
        console.error("Error fetching latest video:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving latest video',
            error: error.message 
        });
    }
});

// Create a new channel
router.post('/api/channels', async (req, res) => {
    try {
        const { channelName } = req.body;
        
        // Validate required fields
        if (!channelName || !channelName.trim()) {
            return res.status(400).json({ 
                success: false,
                message: 'Channel name is required' 
            });
        }

        // Check if channel already exists
        const existingChannelDocument = await Channel.findOne({ name: channelName.trim() });
        if (existingChannelDocument) {
            return res.status(409).json({ 
                success: false,
                message: 'Channel already exists' 
            });
        }

        // Create new channel
        const newChannel = new Channel({ name: channelName.trim() });
        await newChannel.save();

        res.status(201).json({
            success: true,
            message: 'Channel created successfully',
            data: {
                channel: newChannel
            }
        });
        
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating channel',
            error: error.message 
        });
    }
});

// Create Video Series 1 (requires existing channel)
router.post('/api/series1', async (req, res) => {
    try {
        const { channel, series1Name } = req.body;
        
        if (!channel || !series1Name || !series1Name.trim()) {
            return res.status(400).json({ error: 'Channel and Series 1 name are required' });
        }

        // Check if channel exists
        const channelDoc = await Channel.findOne({ name: channel });
        if (!channelDoc) {
            return res.status(404).json({ error: 'Channel not found. Please create the channel first.'});
        }

        // Check if series1 already exists for this channel
        const existingSeries1 = await VideoSeries1.findOne({ 
            name: series1Name.trim(), 
            channel: channelDoc._id 
        });
        if (existingSeries1) {
            return res.status(409).json({ error: 'Video Series 1 already exists for this channel'});
        }

        const series1 = new VideoSeries1({ 
            name: series1Name.trim(), 
            channel: channelDoc._id 
        });
        await series1.save();
        await series1.populate('channel');

        res.status(201).json({
            message: 'Video Series 1 created successfully',
            series1: series1
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create Video Series 2 (require existing series1)
router.post('/api/series2', async (req, res) => {
    try {
        const { channel, videoSeries1, series2Name } = req.body;
        
        if (!channel || !videoSeries1 || !series2Name || !series2Name.trim()) {
            return res.status(400).json({ error: 'Channel, Video Series 1, and Series 2 name are required' });
        }

        // Check if channel exists
        const channelDoc = await Channel.findOne({ name: channel });
        if (!channelDoc) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Check if series1 exists
        const series1Doc = await VideoSeries1.findOne({ 
            name: videoSeries1, 
            channel: channelDoc._id 
        });
        if (!series1Doc) {
            return res.status(404).json({ error: 'Video Series 1 not found. Please create Video Series 1 first.' });
        }

    // Check if series2 already exists for this series1
        const existingSeries2 = await VideoSeries2.findOne({ 
            name: series2Name.trim(), 
            videoSeries1: series1Doc._id 
        });
        if (existingSeries2) {
            return res.status(409).json({ error: 'Video Series 2 already exists for this Video Series 1' });
        }

        const series2 = new VideoSeries2({ 
            name: series2Name.trim(), 
            videoSeries1: series1Doc._id 
        });
        await series2.save();
        await series2.populate('videoSeries1');

        res.status(201).json({
            message: 'Video Series 2 created successfully',
            series2: series2
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Retrieve all channel names
router.get('/api/channels', async (req, res) => {
    try {
        const allChannels = await Channel.find({}, 'name').sort({ name: 1 });
        const channelNamesList = allChannels.map(channel => channel.name);
        
        res.json({
            success: true,
            message: 'Channels retrieved successfully',
            data: channelNamesList
        });
        
    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error retrieving channels',
            error: error.message 
        });
    }
});

router.get('/api/series1/:channel', async (req, res) => {
    try {
        const { channel } = req.params;
        
        // Find the channel first
        const channelDoc = await Channel.findOne({ name: channel });
        if (!channelDoc) {
            return res.json([]);
        }

        const series1 = await VideoSeries1.find({ channel: channelDoc._id }, 'name').sort({ name: 1 });
        const series1Names = series1.map(s => s.name);
        res.json(series1Names);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/series2/:channel/:videoSeries1', async (req, res) => {
    try {
        const { channel, videoSeries1 } = req.params;
        
        // Find the channel first
        const channelDoc = await Channel.findOne({ name: channel });
        if (!channelDoc) {
            return res.json([]);
        }

        // Find the series1 document
        const series1Doc = await VideoSeries1.findOne({ 
            name: videoSeries1, 
            channel: channelDoc._id 
        });
        if (!series1Doc) {
            return res.json([]);
        }

        const series2 = await VideoSeries2.find({ videoSeries1: series1Doc._id }, 'name').sort({ name: 1 });
        const series2Names = series2.map(s => s.name);
        res.json(series2Names);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;