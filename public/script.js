const socket = io();
let localStream = null;

// Handle connection event
socket.on('connect', () => {
    console.log('Connected to server');
});

// Start screen sharing
function startScreenSharing() {
    navigator.mediaDevices.getDisplayMedia({ video: true })
        .then((stream) => {
            localStream = stream;
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = stream;
            socket.emit('screen_share', stream);
        })
        .catch((error) => {
            console.error('Error accessing media devices:', error);
        });
}

// Start viewing the shared screen
function startViewing(remoteStream) {
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = remoteStream;
}

// Handle screen sharing event
socket.on('screen_share', (stream) => {
    startViewing(stream);
});

// Handle viewing event
socket.on('viewing', (stream) => {
    startViewing(stream);
});

// Attach event listener to the share button
const shareButton = document.getElementById('shareButton');
shareButton.addEventListener('click', () => {
    if (!localStream) {
        startScreenSharing();
        shareButton.innerHTML = 'Stop Sharing';
    } else {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
        shareButton.innerHTML = 'Start Sharing';
    }
});
