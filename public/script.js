// Get user media constraints
const constraints = { video: true, audio: true };

// Variable to store user media stream
let localStream;

// Variable to store the chosen mode (video chat or screen sharing)
let mode;

// Event listener for 'video-chat' button click
document.getElementById('video-chat').addEventListener('click', () => {
  mode = 'video-chat';
  showVideoChat();

  // Get user media stream and display it on the page
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      localStream = stream;
      const localVideo = document.getElementById('local-video');
      addVideoStream(localVideo, stream);
      localVideo.muted = true;

      // Emit 'join' event when the user is ready to join the video chat
      socket.emit('join');
    })
    .catch((error) => {
      console.error('Error accessing user media:', error);
    });
});

// Event listener for 'screen-share' button click
document.getElementById('screen-share').addEventListener('click', () => {
  mode = 'screen-share';
  showScreenSharing();

  // Emit 'join' event when the user is ready to join the screen sharing session
  socket.emit('join-screen-sharing');
});

// Event listener for 'toggle-video' button click
document.getElementById('toggle-video').addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks();
  videoTracks.forEach((track) => {
    track.enabled = !track.enabled;
  });
});

// Event listener for 'end-call' button click
document.getElementById('end-call').addEventListener('click', () => {
  // Stop the local media stream
  localStream.getTracks().forEach((track) => {
    track.stop();
  });

  // Remove the local video element from the page
  const localVideo = document.getElementById('local-video');
  removeVideoStream(localVideo);

  // Emit 'leave' event to signal the end of the call
  socket.emit('leave');

  // Reset the UI
  showModeSelection();
});

// Event listener for 'share-screen' button click
document.getElementById('share-screen').addEventListener('click', () => {
  if (mode === 'video-chat') {
    console.log('Toggle Video button clicked');
    // Add your logic for handling the toggle video functionality here
    // Emit 'toggle-video' event to the server
    socket.emit('toggle-video');
  } else if (mode === 'screen-share') {
    console.log('Share Screen button clicked');
    // Add your logic for handling the screen sharing functionality here
    // Emit 'share-screen' event to the server
    socket.emit('share-screen');
  }
});
