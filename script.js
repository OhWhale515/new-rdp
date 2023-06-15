// Establish socket connection
const socket = io();

// Function to add video stream to the page
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  document.getElementById('video-container').appendChild(video);
}

// Function to remove video stream from the page
function removeVideoStream(video) {
  video.pause();
  video.srcObject = null;
  video.parentNode.removeChild(video);
}

// Get user media constraints
const constraints = { video: true, audio: true };

// Variable to store user media stream
let localStream;

// Get user media stream and display it on the page
navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    localStream = stream;
    const localVideo = document.createElement('video');
    localVideo.muted = true;
    addVideoStream(localVideo, stream);

    // Emit 'join' event when the user is ready to join the video chat
    socket.emit('join');
  })
  .catch((error) => {
    console.error('Error accessing user media:', error);
  });

// Event listener for receiving 'user-connected' event
socket.on('user-connected', (userId) => {
  // Create a new video element for the remote user
  const remoteVideo = document.createElement('video');
  remoteVideo.setAttribute('data-user-id', userId);
  addVideoStream(remoteVideo, null);

  // Call function to establish WebRTC connection and add the remote user's stream
  connectToNewUser(userId, localStream);
});

// Event listener for receiving 'user-disconnected' event
socket.on('user-disconnected', (userId) => {
  // Get the video element associated with the disconnected user and remove it
  const remoteVideo = document.querySelector(`video[data-user-id="${userId}"]`);
  if (remoteVideo) {
    removeVideoStream(remoteVideo);
  }
});

// Function to establish WebRTC connection with a new user
function connectToNewUser(userId, stream) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream: stream,
  });

  // Call the remote user and send our stream
  peer.on('signal', (data) => {
    socket.emit('call-user', { userId, signalData: data });
  });

  // Handle the returned signal from the remote user
  socket.on('call-made', async (data) => {
    // Answer the call and send our stream
    peer.signal(data.signalData);

    // When the peer connection is established, add the remote user's stream
    peer.on('stream', (remoteStream) => {
      const remoteVideo = document.querySelector(`video[data-user-id="${userId}"]`);
      if (remoteVideo) {
        addVideoStream(remoteVideo, remoteStream);
      }
    });
  });
}

// Button event listeners

// Share Screen button
document.getElementById('share-screen').addEventListener('click', () => {
  navigator.mediaDevices
    .getDisplayMedia({ video: true, audio: true })
    .then((stream) => {
      // Stop the current local stream
      localStream.getTracks().forEach((track) => {
        track.stop();
      });

      // Replace the local stream with the screen sharing stream
      localStream = stream;
      const localVideo = document.querySelector('video[muted]');
      addVideoStream(localVideo, stream);

      // Update the other participants with the new stream
      socket.emit('screen-share', localStream);
    })
    .catch((error) => {
      console.error('Error accessing screen sharing:', error);
    });
});

// Toggle Audio button
document.getElementById('toggle-audio').addEventListener('click', () => {
  const audioTracks = localStream.getAudioTracks();
  audioTracks.forEach((track) => {
    track.enabled = !track.enabled;
  });
});

// Toggle Video button
document.getElementById('toggle-video').addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks();
  videoTracks.forEach((track) => {
    track.enabled = !track.enabled;
  });
});

// End Call button
document.getElementById('end-call').addEventListener('click', () => {
  // Stop all tracks in the local stream
  localStream.getTracks().forEach((track) => {
    track.stop();
  });

  // Remove the local video stream from the page
  const localVideo = document.querySelector('video[muted]');
  removeVideoStream(localVideo);

  // Emit 'user-disconnected' event and disconnect from the server
  socket.emit('user-disconnected');
  socket.disconnect();
});
