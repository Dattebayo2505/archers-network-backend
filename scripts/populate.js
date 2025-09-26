require('dotenv').config();
const mongoose = require('mongoose');
const Channel = require('../models/Channel');
const VideoSeries1 = require('../models/VideoSeries1');
const VideoSeries2 = require('../models/VideoSeries2');
const Video = require('../models/Video');

async function populateDatabase() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arch_db';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Clear existing data to avoid conflicts when run again
        console.log('Clearing existing data...');
        await Video.deleteMany({});
        await VideoSeries2.deleteMany({});
        await VideoSeries1.deleteMany({});
        await Channel.deleteMany({});

        // Create Channels
        console.log('Creating channels...');
        const channelData = [
            { name: 'NCA' },
            { name: 'ENT' },
            { name: 'ADS' }
        ];

        const channels = await Channel.insertMany(channelData);
        console.log('Channels created:', channels.map(c => c.name));

        const ncaChannel = channels.find(c => c.name === 'NCA');

        // Video Series 1 under NCA
        console.log('Creating Video Series 1...');
        const series1 = new VideoSeries1({
            name: "Archers Recap",
            channel: ncaChannel._id
        });
        await series1.save();
        console.log('Video Series 1 created:', series1.name);

        // Video Series 2 under Archers Recap
        console.log('Creating Video Series 2...');
        const series2 = new VideoSeries2({
            name: "seARCHlight",
            videoSeries1: series1._id
        });
        await series2.save();
        console.log('Video Series 2 created:', series2.name);

        const sampleVideo = new Video({
            title: "Archers Network EP.1 - Orientation 2025",
            date: new Date('2025-09-20T10:00:00Z'),
            description: "A comprehensive review of the first episode of Archers Network, covering the various recent events in DLSU.",
            link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            channel: ncaChannel._id,
            videoSeries1: series1._id,
            videoSeries2: series2._id
        });

        await sampleVideo.save();
        console.log('Sample video created:', sampleVideo.title);

        console.log('\n=== DATABASE POPULATION SUMMARY ===');
        
        const allChannels = await Channel.find();
        console.log('\nChannels:');
        allChannels.forEach(channel => {
            console.log(`- ${channel.name} (ID: ${channel._id})`);
        });

        const allSeries1 = await VideoSeries1.find().populate('channel');
        console.log('\nVideo Series 1:');
        allSeries1.forEach(series => {
            console.log(`- ${series.name} under ${series.channel.name} (ID: ${series._id})`);
        });

        const allSeries2 = await VideoSeries2.find().populate('videoSeries1');
        console.log('\nVideo Series 2:');
        allSeries2.forEach(series => {
            console.log(`- ${series.name} under ${series.videoSeries1.name} (ID: ${series._id})`);
        });

        const allVideos = await Video.find().populate(['channel', 'videoSeries1', 'videoSeries2']);
        console.log('\nVideos:');
        allVideos.forEach(video => {
            console.log(`- "${video.title}"`);
            console.log(`  Channel: ${video.channel.name}`);
            console.log(`  Series 1: ${video.videoSeries1.name}`);
            console.log(`  Series 2: ${video.videoSeries2.name}`);
            console.log(`  Link: ${video.link}`);
            console.log(`  Date: ${video.date}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

populateDatabase();