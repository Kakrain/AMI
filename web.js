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
	console.log("User connected");
	socket.on('enable-game',function(){
		io.emit('enable-game','Enable Game');
		console.log("Enable Game");	
	}).on('disable-game',function(){
		io.emit('disable-game','Disable Game');
		console.log("Disable Game");	
	}).on('attack',function(){
		console.log('Attack');
	}).on('block',function(){
		console.log('Block');
	}).on('b12-down',function(){
		io.emit('b12-down','Button 12 down');
	}).on('b12-up',function(){
		io.emit('b12-up','Button 12 up');
	}).on('b21-down',function(){
		io.emit('b21-down','Button 21 down');
	}).on('b21-up',function(){
		io.emit('b21-up','Button 21 up');
	}).on('b23-down',function(){
		io.emit('b23-down','Button 23 down');
	}).on('b23-up',function(){
		io.emit('b23-up','Button 23 up');
	}).on('b32-down',function(){
		io.emit('b32-down','Button 32 down');
	}).on('b32-up',function(){
		io.emit('b32-up','Button 32 up');
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});