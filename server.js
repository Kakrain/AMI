
// Node Modules and Variables
var app = require('express')();
var express = require('express');
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var database = require('./controllers/database.js');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var port = process.env.PORT || 3000;
var users = [];

mongoose.connect(database.url);

// Configurations
app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'views')));
app.use(flash());

require('./controllers/socketio')(io, users);
require('./controllers/routes.js')(app);

http.listen(port, function(){
	console.log('Listening on *: ' + port);
});