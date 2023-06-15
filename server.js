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
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

io.on('connection', (socket) => {
  // Socket connection logic goes here
});

server.listen(8000, () => {
  console.log('Server running on port 8000');
});
