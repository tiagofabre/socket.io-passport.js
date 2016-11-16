var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sessionStore     = require('awesomeSessionStore'), // find a working session store (have a look at the readme)
var passportSocketIo = require("passport.socketio");

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'express.sid',      // the name of the cookie where express/connect stores its session_id
  secret:       'session_secret',   // the session_secret to parse the cookie
  store:        sessionStore,       // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess, // *optional* callback on success - read more below
  fail:         onAuthorizeFail,    // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, next){
  console.log('successful connection to socket.io');
  next(null, true);
}

function onAuthorizeFail(data, message, error, next){
  if(error)
    throw new Error(message);

  console.log('failed connection to socket.io:', message);
  next(new Error(message), false);
}

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
