
// Node Modules and Variables
var app = require('express')();
var express = require('express');
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var database = require('./config/database.js');
var port = process.env.PORT || 3000;
var sess;

// Database testing
database.init();
//database.query('SELECT * from users');
//database.validateUser('DenkSchuldt','lalala');

// Configurations
//app.use(morgan('dev')); // log every request to the console
//app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser.json()); // get information from html forms
//app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'views')));    
/*app.use(session({
    secret: 'elcaminodelincarocks',
    name: 'Inca',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session*/

app.get('/', function(req, res){
	sess = req.session;
	if(!sess.user) {
		res.redirect('/game');
	} else {
		res.sendfile('index.html');
	}
});

app.get('/login',function(req,res){
	sess = req.session;
	console.log(req);
	sess.user = req.body.user;
	sess.password = req.body.password;
	res.redirect('/game');
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

io.on('connection', function(socket){
	console.log("User connected");
	socket.on('enable-game',function(){
		io.emit('enable-game','Enable Game');
		console.log("Enable Game");	
	}).on('disable-game',function(){
		io.emit('disable-game','Disable Game');
		console.log("Disable Game");	
	}).on('gyroscope-x',function(gValue){
		io.emit('gyroscope-x',gValue);
	}).on('gyroscope-y',function(gValue){
		io.emit('gyroscope-y',gValue);
	}).on('gyroscope-z',function(gValue){
		io.emit('gyroscope-z',gValue);
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

http.listen(port, function(){
	console.log('listening on *: ' + port);
});