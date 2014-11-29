var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('attack',function(){
		console.log('Atacando!');
	});
	socket.on('protect',function(){
		console.log('Protegiendo!');
	});
	socket.on('button',function(msg){
		console.log('Mensaje: ' + msg);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});