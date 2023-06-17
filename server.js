const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve the static files
app.use(express.static(__dirname + '/public'));

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle 'toggle-audio' event
  socket.on('toggle-audio', () => {
    console.log('Toggle Audio event received');
    // Perform the desired action on the server
  });

  // Handle 'toggle-video' event
  socket.on('toggle-video', () => {
    console.log('Toggle Video event received');
    // Perform the desired action on the server
  });

  // Handle 'end-call' event
  socket.on('end-call', () => {
    console.log('End Call event received');
    // Perform the desired action on the server
  });

  // Handle 'share-screen' event
  socket.on('share-screen', () => {
    console.log('Share Screen event received');
    // Perform the desired action on the server
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = 8000;
http.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
