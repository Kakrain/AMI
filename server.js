
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
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var users = [];

mongoose.connect(database.url);
require('./controllers/passport')(passport);

// Configurations
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'views')));
app.use(session({
    secret: 'elcaminodelincarocks',
    name: 'mongodb',
    proxy: true,
    resave: true,
    saveUninitialized: true,
	cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./controllers/socketio')(io, users);
require('./controllers/routes.js')(app, passport, express);

http.listen(port, function(){
	console.log('Listening on *: ' + port);
});