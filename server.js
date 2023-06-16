const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set up routes and middleware for your server here
app.use(express.static('public')); // Serve static files from the "public" directory

// Socket.IO logic goes here
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', () => {
    console.log('User joined');
    // Add your logic for handling user join event
  });

  socket.on('join-screen-sharing', () => {
    console.log('User joined screen sharing');
    // Add your logic for handling user join screen sharing event
  });

  socket.on('toggle-video', () => {
    console.log('Toggle Video button clicked');
    // Add your logic for handling toggle video event
  });

  socket.on('share-screen', () => {
    console.log('Share Screen button clicked');
    // Add your logic for handling share screen event
  });

  socket.on('leave', () => {
    console.log('User left');
    // Add your logic for handling user leave event
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Add your logic for handling user disconnect event
  });
});

// Server listening
server.listen(8000, () => {
  console.log('Server is running on port 8000');
});
