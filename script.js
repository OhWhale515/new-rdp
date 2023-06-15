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

// Function to show the video chat page
function showVideoChat() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('video-chat-page').style.display = 'block';
}

// Get user media constraints
const constraints = { video: true, audio: true };

// Variable to store user media stream
let localStream;

// Variable to store the chosen mode (video or screen sharing)
let mode;

// Get user media stream and display it on the page
navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    localStream = stream;
    const localVideo = document.createElement('video');
    localVideo.muted = true;
    addVideoStream(localVideo, stream);
  })
  .catch((error) => {
    console.error('Error accessing user media:', error);
  });

// Login form submission
document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Perform login validation (replace this with your own logic)
  if (username === 'yo' && password === 'ho') {
    // Show mode selection page
    showModeSelection();
  } else {
    alert('Invalid credentials');
  }
});

// Event listener for 'video-chat' button click
document.getElementById('video-chat').addEventListener('click', () => {
  mode = 'video-chat';
  showVideoChat();

  // Emit 'join' event when the user is ready to join the video chat
  socket.emit('join');
});

// Event listener for 'screen-share' button click
document.getElementById('screen-share').addEventListener('click', () => {
  mode = 'screen-share';
  showScreenSharing();

  // Emit 'join' event when the user is ready to join the screen sharing session
  socket.emit('join');
});

// Event listener for receiving 'user-connected' event
socket.on('user-connected', (userId) => {
  if (mode === 'video-chat') {
    // Create a new video element for the remote user
    const remoteVideo = document.createElement('video');
    remoteVideo.setAttribute('data-user-id', userId);
    addVideoStream(remoteVideo, null);

    // Call function to establish WebRTC connection and add the remote user's stream
    connectToNewUser(userId, localStream);
  }
});

// Event listener for receiving 'user-disconnected' event
socket.on('user-disconnected', (userId) => {
  if (mode === 'video-chat') {
    // Get the video element associated with the disconnected user and remove it
    const remoteVideo = document.querySelector(`video[data-user-id="${userId}"]`);
    if (remoteVideo) {
      removeVideoStream(remoteVideo);
    }
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

// Event listener for 'share-screen' button click
document.getElementById('share-screen').addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then((stream) => {
      const videoTrack = stream.getVideoTracks()[0];
      const sender = currentPeer.getSenders().find((s) => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
      localStream.getTracks().forEach((track) => track.stop());
      localStream.removeTrack(localStream.getVideoTracks()[0]);
      localStream.addTrack(videoTrack);
      const localVideo = document.querySelector('video[muted]');
      addVideoStream(localVideo, localStream);
      document.getElementById('share-screen').disabled = true;
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

// Function to show the mode selection page
function showModeSelection() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('mode-selection-page').style.display = 'block';
}
