const express = require('express');
const session = require('express-session');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

// Define a middleware to check if the user is authenticated
function authenticateUser(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Perform login validation (replace this with your own logic)
  if (username === 'yo' && password === 'ho') {
    req.session.isAuthenticated = true;
    return res.redirect('/');
  } else {
    return res.redirect('/login');
  }
});


io.on('connection', (socket) => {
  // Event listener for 'join' event
  socket.on('join', () => {
    // Emit 'user-connected' event to notify other clients
    socket.broadcast.emit('user-connected', socket.id);
  });

  // Event listener for 'call-user' event
  socket.on('call-user', (data) => {
    // Emit 'call-made' event to the specified user
    io.to(data.userId).emit('call-made', { signalData: data.signalData, userId: socket.id });
  });

  // Event listener for 'disconnect' event
  socket.on('disconnect', () => {
    // Emit 'user-disconnected' event to notify other clients
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

server.listen(8000, () => {
  console.log('Server running on port 8000');
});
