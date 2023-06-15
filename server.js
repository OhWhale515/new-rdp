const express = require('express');
const session = require('express-session');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

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

app.get('/', authenticateUser, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'Admin' && password === 'Password') {
    req.session.isAuthenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

io.on('connection', (socket) => {
  // Socket connection logic goes here
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
