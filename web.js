var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.engine('.html', require('ejs').__express);
console.log("dirname: "+__dirname);
app.use(express.static(path.join(__dirname, 'views/game')));
app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log("User connected");
	socket.on('enable-game',function(){
		io.emit('enable-game','Enable Game');
		console.log("Enable Game");	
	}).on('screen',function(){
		io.emit("screen",'Disable Game');
		socket.emit("screen",'Disable Game');
		console.log("screen");	
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});