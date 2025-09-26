// Global variables
let currentVideos = [];
let selectedVideoId = null;

// Load channels on page load
document.addEventListener('DOMContentLoaded', function() {
    loadChannels();
    loadAllVideos();
});

// Load channels for all dropdowns
async function loadChannels() {
    try {
        const response = await fetch('/api/channels');
        const responseData = await response.json();
        
        const channels = responseData.success ? responseData.data : responseData;
        
        // Update all channel dropdowns
        const channelSelects = ['videoChannel', 'series1Channel', 'series2Channel', 'updateVideoChannel', 'filterChannel', 'latestVideoChannel'];
        channelSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const isFilter = selectId === 'filterChannel';
                select.innerHTML = isFilter ? '<option value="">All Channels</option>' : '<option value="">Select Channel</option>';
                channels.forEach(channel => {
                    const option = document.createElement('option');
                    option.value = channel;
                    option.textContent = channel;
                    select.appendChild(option);
                });
            }
        });

        // Update channel list
        const channelList = document.getElementById('channelList');
        if (channelList) {
            channelList.innerHTML = '';
            channels.forEach(channel => {
                const listItem = document.createElement('li');
                listItem.textContent = channel;
                channelList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error loading channels:', error);
    }
}



async function loadAllVideos() {
    try {
        const response = await fetch('/get');
        const responseData = await response.json();
        
        if (responseData.success) {
            currentVideos = responseData.data.videos || [];
        } else {
            currentVideos = responseData.videos || [];
        }
        
        displayVideos(currentVideos);
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Display videos in the list
function displayVideos(videos) {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    if (videos.length === 0) {
        videoList.innerHTML = '<div class="no-videos">No videos found</div>';
        return;
    }

    videoList.innerHTML = '';
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.dataset.videoId = video._id;
        
        const date = new Date(video.date).toLocaleDateString();
        const channelName = video.channel ? video.channel.name : 'Unknown';
        const series1Name = video.videoSeries1 ? video.videoSeries1.name : 'Unknown';
        const series2Name = video.videoSeries2 ? video.videoSeries2.name : 'Unknown';
        
        videoItem.innerHTML = `
            <div class="video-title">${video.title}</div>
            <div class="video-meta">
                ${channelName} → ${series1Name} → ${series2Name} | ${date}
            </div>
            <div class="video-description">${video.description}</div>
            <div class="video-actions">
                <button class="primary-btn btn edit-video-btn" data-video-id="${video._id}">Edit</button>
                <button class="danger-btn btn delete-video-btn" data-video-id="${video._id}">Delete</button>
                <a href="${video.link}" target="_blank" class="secondary-btn btn">View</a>
            </div>
        `;
        
        videoList.appendChild(videoItem);
    });

    // event listeners for edit and delete buttonss
    document.querySelectorAll('.edit-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.dataset.videoId;
            editVideo(videoId);
        });
    });

    document.querySelectorAll('.delete-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.dataset.videoId;
            deleteVideo(videoId);
        });
    });
}

function setupVideoChannelListener() {
    const videoChannelSelect = document.getElementById('videoChannel');
    if (videoChannelSelect) {
        videoChannelSelect.addEventListener('change', async function() {
            const channel = this.value;
            if (!channel) return;

            try {
                const response = await fetch(`/api/series1/${encodeURIComponent(channel)}`);
                const series1List = await response.json();
                
                const select = document.getElementById('videoSeries1');
                select.innerHTML = '<option value="">Select Video Series 1</option>';
                series1List.forEach(series1 => {
                    const option = document.createElement('option');
                    option.value = series1;
                    option.textContent = series1;
                    select.appendChild(option);
                });

                // Clear series 2
                document.getElementById('videoSeries2').innerHTML = '<option value="">Select Video Series 2</option>';
            } catch (error) {
                console.error('Error loading series 1:', error);
            }
        });
    }
}

function setupVideoSeries1Listener() {
    const videoSeries1Select = document.getElementById('videoSeries1');
    if (videoSeries1Select) {
        videoSeries1Select.addEventListener('change', async function() {
            const channel = document.getElementById('videoChannel').value;
            const series1 = this.value;
            if (!channel || !series1) return;

            try {
                const response = await fetch(`/api/series2/${encodeURIComponent(channel)}/${encodeURIComponent(series1)}`);
                const series2List = await response.json();
                
                const select = document.getElementById('videoSeries2');
                select.innerHTML = '<option value="">Select Video Series 2</option>';
                series2List.forEach(series2 => {
                    const option = document.createElement('option');
                    option.value = series2;
                    option.textContent = series2;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading series 2:', error);
            }
        });
    }
}

function setupSeries2ChannelListener() {
    const series2ChannelSelect = document.getElementById('series2Channel');
    if (series2ChannelSelect) {
        series2ChannelSelect.addEventListener('change', async function() {
            const channel = this.value;
            if (!channel) return;

            try {
                const response = await fetch(`/api/series1/${encodeURIComponent(channel)}`);
                const series1List = await response.json();
                
                const select = document.getElementById('series2Series1');
                select.innerHTML = '<option value="">Select Video Series 1</option>';
                series1List.forEach(series1 => {
                    const option = document.createElement('option');
                    option.value = series1;
                    option.textContent = series1;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading series 1:', error);
            }
        });
    }
}

function setupAddVideoForm() {
    const addVideoForm = document.getElementById('addVideoForm');
    if (addVideoForm) {
        addVideoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('videoTitle').value,
                date: document.getElementById('videoDate').value,
                description: document.getElementById('videoDescription').value,
                link: document.getElementById('videoLink').value,
                channel: document.getElementById('videoChannel').value,
                videoSeries1: document.getElementById('videoSeries1').value,
                videoSeries2: document.getElementById('videoSeries2').value
            };

            try {
                const response = await fetch('/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('Video added successfully!');
                    this.reset();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error adding video: ' + error.message);
            }
        });
    }
}

function setupAddChannelForm() {
    const addChannelForm = document.getElementById('addChannelForm');
    if (addChannelForm) {
        addChannelForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const channelName = document.getElementById('channelName').value.trim();
            if (!channelName) {
                alert('Please enter a channel name.');
                return;
            }

            try {
                const response = await fetch('/api/channels', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ channelName })
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('Channel created successfully!');
                    this.reset();
                    // Reload channels to update dropdowns and list
                    loadChannels();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error creating channel: ' + error.message);
            }
        });
    }
}

function setupAddSeries1Form() {
    const addSeries1Form = document.getElementById('addSeries1Form');
    if (addSeries1Form) {
        addSeries1Form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const channel = document.getElementById('series1Channel').value;
            const series1Name = document.getElementById('series1Name').value.trim();
            
            if (!channel || !series1Name) {
                alert('Please select a channel and enter a series name.');
                return;
            }

            try {
                const response = await fetch('/api/series1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ channel, series1Name })
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('Video Series 1 created successfully!');
                    this.reset();
                    // Clear dependent dropdowns
                    document.getElementById('series1Channel').value = '';
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error creating Video Series 1: ' + error.message);
            }
        });
    }
}

function setupAddSeries2Form() {
    const addSeries2Form = document.getElementById('addSeries2Form');
    if (addSeries2Form) {
        addSeries2Form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const channel = document.getElementById('series2Channel').value;
            const videoSeries1 = document.getElementById('series2Series1').value;
            const series2Name = document.getElementById('series2Name').value.trim();
            
            if (!channel || !videoSeries1 || !series2Name) {
                alert('Please select a channel, Video Series 1, and enter a Series 2 name.');
                return;
            }

            try {
                const response = await fetch('/api/series2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ channel, videoSeries1, series2Name })
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('Video Series 2 created successfully!');
                    this.reset();
                    // Clear dependent dropdowns
                    document.getElementById('series2Channel').value = '';
                    document.getElementById('series2Series1').innerHTML = '<option value="">Select Video Series 1</option>';
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error creating Video Series 2: ' + error.message);
            }
        });
    }
}

function setupUpdateVideoForm() {
    const updateVideoForm = document.getElementById('updateVideoForm');
    if (updateVideoForm) {
        updateVideoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const videoId = document.getElementById('updateVideoId').value;
            const formData = {
                title: document.getElementById('updateVideoTitle').value,
                date: document.getElementById('updateVideoDate').value,
                description: document.getElementById('updateVideoDescription').value,
                link: document.getElementById('updateVideoLink').value,
                channel: document.getElementById('updateVideoChannel').value,
                videoSeries1: document.getElementById('updateVideoSeries1').value,
                videoSeries2: document.getElementById('updateVideoSeries2').value
            };

            try {
                const response = await fetch(`/update/${videoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('Video updated successfully!');
                    // Switch back to add form
                    document.getElementById('updateVideoSection').style.display = 'none';
                    document.getElementById('addVideoSection').style.display = 'block';
                    loadAllVideos(); // Refresh the video list
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error updating video: ' + error.message);
            }
        });
    }
}

function setupCancelUpdateForm() {
    const cancelButton = document.getElementById('cancelUpdate');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            document.getElementById('updateVideoSection').style.display = 'none';
            document.getElementById('addVideoSection').style.display = 'block';
        });
    }
}

function setupUpdateVideoChannelListener() {
    const updateChannelSelect = document.getElementById('updateVideoChannel');
    if (updateChannelSelect) {
        updateChannelSelect.addEventListener('change', async function() {
            const channel = this.value;
            if (!channel) return;

            await loadSeries1ForUpdate(channel);
            // Clear series 2
            document.getElementById('updateVideoSeries2').innerHTML = '<option value="">Select Video Series 2</option>';
        });
    }
}

function setupUpdateVideoSeries1Listener() {
    const updateSeries1Select = document.getElementById('updateVideoSeries1');
    if (updateSeries1Select) {
        updateSeries1Select.addEventListener('change', async function() {
            const channel = document.getElementById('updateVideoChannel').value;
            const series1 = this.value;
            if (!channel || !series1) return;

            await loadSeries2ForUpdate(channel, series1);
        });
    }
}

function setupFilterChannelListener() {
    const filterChannelSelect = document.getElementById('filterChannel');
    if (filterChannelSelect) {
        filterChannelSelect.addEventListener('change', async function() {
            const channel = this.value;
            
            // Load series1 options for this channel
            const series1Select = document.getElementById('filterSeries1');
            series1Select.innerHTML = '<option value="">All Series 1</option>';
            
            if (channel) {
                try {
                    const response = await fetch(`/api/series1/${encodeURIComponent(channel)}`);
                    const series1List = await response.json();
                    
                    series1List.forEach(series1 => {
                        const option = document.createElement('option');
                        option.value = series1;
                        option.textContent = series1;
                        series1Select.appendChild(option);
                    });
                } catch (error) {
                    console.error('Error loading series 1 for filter:', error);
                }
            }
            
            // Clear series2  dropdown
            document.getElementById('filterSeries2').innerHTML = '<option value="">All Series 2</option>';
        });
    }
}

// Filter Series 1 Listener
function setupFilterSeries1Listener() {
    const filterSeries1Select = document.getElementById('filterSeries1');
    if (filterSeries1Select) {
        filterSeries1Select.addEventListener('change', async function() {
            const channel = document.getElementById('filterChannel').value;
            const series1 = this.value;
            
            const series2Select = document.getElementById('filterSeries2');
            series2Select.innerHTML = '<option value="">All Series 2</option>';
            
            if (channel && series1) {
                try {
                    const response = await fetch(`/api/series2/${encodeURIComponent(channel)}/${encodeURIComponent(series1)}`);
                    const series2List = await response.json();
                    
                    series2List.forEach(series2 => {
                        const option = document.createElement('option');
                        option.value = series2;
                        option.textContent = series2;
                        series2Select.appendChild(option);
                    });
                } catch (error) {
                    console.error('Error loading series 2 for filter:', error);
                }
            }
        });
    }
}

// Setup Filter Buttons
function setupFilterButtons() {
    const applyFilterBtn = document.getElementById('applyFilter');
    const clearFilterBtn = document.getElementById('clearFilter');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterVideos);
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            // Clear all filter dropdowns
            document.getElementById('filterChannel').value = '';
            document.getElementById('filterSeries1').innerHTML = '<option value="">All Series 1</option>';
            document.getElementById('filterSeries2').innerHTML = '<option value="">All Series 2</option>';
            
            // Show all videos
            displayVideos(currentVideos);
        });
    }
}

// Edit video function
async function editVideo(videoId) {
    try {
        const response = await fetch(`/get/${videoId}`);
        const responseData = await response.json();
        
        const video = responseData.success ? responseData.data.video : responseData;
        
        document.getElementById('updateVideoId').value = video._id;
        document.getElementById('updateVideoTitle').value = video.title;
        document.getElementById('updateVideoDescription').value = video.description;
        document.getElementById('updateVideoLink').value = video.link;
        
        // Format date for datetime-local input
        const date = new Date(video.date);
        const formattedDate = date.toISOString().slice(0, 16);
        document.getElementById('updateVideoDate').value = formattedDate;
        
        await loadChannelsForUpdate();
        document.getElementById('updateVideoChannel').value = video.channel.name;
        
        await loadSeries1ForUpdate(video.channel.name);
        document.getElementById('updateVideoSeries1').value = video.videoSeries1.name;
        
        await loadSeries2ForUpdate(video.channel.name, video.videoSeries1.name);
        document.getElementById('updateVideoSeries2').value = video.videoSeries2.name;
        
        // Show update form and hide add form
        document.getElementById('addVideoSection').style.display = 'none';
        document.getElementById('updateVideoSection').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading video for edit:', error);
        alert('Error loading video details: ' + error.message);
    }
}

// Delete video function
async function deleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this video?')) {
        return;
    }
    
    try {
        const response = await fetch(`/delete/${videoId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Video deleted successfully!');
            loadAllVideos(); // Refresh the video list
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error deleting video: ' + error.message);
    }
}

// Load channels specifically for update form
async function loadChannelsForUpdate() {
    try {
        const response = await fetch('/api/channels');
        const channels = await response.json();
        
        const select = document.getElementById('updateVideoChannel');
        select.innerHTML = '<option value="">Select Channel</option>';
        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel;
            option.textContent = channel;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading channels for update:', error);
    }
}

// Load series1 for update form
async function loadSeries1ForUpdate(channel) {
    try {
        const response = await fetch(`/api/series1/${encodeURIComponent(channel)}`);
        const series1List = await response.json();
        
        const select = document.getElementById('updateVideoSeries1');
        select.innerHTML = '<option value="">Select Video Series 1</option>';
        series1List.forEach(series1 => {
            const option = document.createElement('option');
            option.value = series1;
            option.textContent = series1;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading series1 for update:', error);
    }
}

// Load series2 for update form
async function loadSeries2ForUpdate(channel, videoSeries1) {
    try {
        const response = await fetch(`/api/series2/${encodeURIComponent(channel)}/${encodeURIComponent(videoSeries1)}`);
        const series2List = await response.json();
        
        const select = document.getElementById('updateVideoSeries2');
        select.innerHTML = '<option value="">Select Video Series 2</option>';
        series2List.forEach(series2 => {
            const option = document.createElement('option');
            option.value = series2;
            option.textContent = series2;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading series2 for update:', error);
    }
}

// Filter functionality
async function filterVideos() {
    const channel = document.getElementById('filterChannel').value;
    const series1 = document.getElementById('filterSeries1').value;
    const series2 = document.getElementById('filterSeries2').value;
    
    let filteredVideos = currentVideos;
    
    // If series2 is specifically selected, use select-all route
    if (series2) {
        try {
            const response = await fetch(`/select-all/${encodeURIComponent(series2)}`);
            const responseData = await response.json();
            
            if (responseData.success) {
                filteredVideos = responseData.data.videos || [];
            } else {
                filteredVideos = responseData.videos || []; // Fallback for old format
            }
        } catch (error) {
            console.error('Error using select-all:', error);
            filteredVideos = [];
        }
    } else {
        // Apply filters step by step when series2 is not selected
        if (channel) {
            filteredVideos = filteredVideos.filter(video => 
                video.channel && video.channel.name === channel
            );
        }
        
        if (series1) {
            filteredVideos = filteredVideos.filter(video => 
                video.videoSeries1 && video.videoSeries1.name === series1
            );
        }
    }
    
    displayVideos(filteredVideos);
}

// Get latest video by channel
async function getLatestVideoByChannel() {
    const channel = document.getElementById('latestVideoChannel').value;
    
    if (!channel) {
        alert('Please select a channel first');
        return;
    }
    
    try {
        const response = await fetch(`/get-latest/${encodeURIComponent(channel)}`);
        const responseData = await response.json();
        
        if (response.ok && responseData.success) {
            const latestVideo = responseData.data.latestVideo;
            displayLatestVideo(latestVideo);
        } else {
            alert(responseData.message || 'No videos found for this channel');
            document.getElementById('latestVideoDisplay').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error fetching latest video:', error);
        alert('Error fetching latest video: ' + error.message);
    }
}

// Display latest video
function displayLatestVideo(video) {
    const latestVideoDisplay = document.getElementById('latestVideoDisplay');
    const latestVideoContent = document.getElementById('latestVideoContent');
    
    if (!video) {
        latestVideoDisplay.style.display = 'none';
        return;
    }
    
    const date = new Date(video.date).toLocaleDateString();
    const channelName = video.channel ? video.channel.name : 'Unknown';
    const series1Name = video.videoSeries1 ? video.videoSeries1.name : 'Unknown';
    const series2Name = video.videoSeries2 ? video.videoSeries2.name : 'Unknown';
    
    latestVideoContent.innerHTML = `
        <div class="video-title">${video.title}</div>
        <div class="video-meta">
            ${channelName} → ${series1Name} → ${series2Name} | ${date}
        </div>
        <div class="video-description">${video.description}</div>
        <div class="video-actions">
            <button class="primary-btn btn edit-video-btn" data-video-id="${video._id}">Edit</button>
            <button class="danger-btn btn delete-video-btn" data-video-id="${video._id}">Delete</button>
            <a href="${video.link}" target="_blank" class="secondary-btn btn">View</a>
        </div>
    `;
    
    latestVideoDisplay.style.display = 'block';
    
    const editBtn = latestVideoContent.querySelector('.edit-video-btn');
    const deleteBtn = latestVideoContent.querySelector('.delete-video-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editVideo(video._id);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteVideo(video._id);
        });
    }
}

// Setup latest video button
function setupLatestVideoButton() {
    const getLatestVideoBtn = document.getElementById('getLatestVideo');
    if (getLatestVideoBtn) {
        getLatestVideoBtn.addEventListener('click', getLatestVideoByChannel);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadChannels();
    loadAllVideos();
    setupVideoChannelListener();
    setupVideoSeries1Listener();
    setupUpdateVideoChannelListener();
    setupUpdateVideoSeries1Listener();
    setupSeries2ChannelListener();
    setupFilterChannelListener();
    setupFilterSeries1Listener();
    setupAddVideoForm();
    setupUpdateVideoForm();
    setupCancelUpdateForm();
    setupAddChannelForm();
    setupAddSeries1Form();
    setupAddSeries2Form();
    setupFilterButtons();
    setupLatestVideoButton();
});