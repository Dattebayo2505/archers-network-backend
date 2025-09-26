    require('dotenv').config();
    const express = require('express');
    const mongoose = require('mongoose');
    const server = require('./routes/server');
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));

    // Routes
    app.use('/', server);

    // Mongo Connection - Copy below to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arch_db';
    
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB successfully');
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error);
        });

    // Routes
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Video Management API',
        status: 'Server is running',
        database: 'Connected to MongoDB',
        structure: 'Hierarchical: Channel → Video Series 1 → Video Series 2',
        endpoints: [
            'POST /create - Add a video to the database',
            'PUT /update/:id - Edit a video',
            'DELETE /delete/:id - Delete a video from the database',
            'GET /get/:id - Get video data',
            'GET /select-all/:series - Get all videos from a specific video series',
            'GET /get-latest/:channel - Get the latest video released by a certain channel'
        ]
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Express server listening at http://localhost:${port}`);
    });