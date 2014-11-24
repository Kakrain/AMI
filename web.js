var express = require('express'),
      app       = express(),
      http       = require('http').Server(app),
	  io          = require('socket.io')(http),
	  path      = require('path');

app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');

app.get('/', function(req, res){
    res.render('index');
});

io.on('connection', function(socket){
	console.log("user connected");
	socket.on('button', function(msg){
		console.log(msg);
	});
	socket.on('attack', function(msg){
		console.log(msg);
	});
	socket.on('disconnect', function(){
		console.log('User disconnected');
	});
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});