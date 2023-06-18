const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve the static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle connection event
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Forward screen sharing data to other clients
    socket.on('screen_share', (data) => {
        socket.broadcast.emit('screen_share', data);
    });

    // Forward viewing data to other clients
    socket.on('viewing', (data) => {
        socket.broadcast.emit('viewing', data);
    });
});

// Run the server
const port = 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
