
// Node Modules and Variables
var app = require('express')();
var express = require('express');
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var database = require('./config/database.js');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var sess;

mongoose.connect(database.url);
require('./config/passport')(passport);

// Configurations
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'views')));    
app.use(session({
    secret: 'elcaminodelincarocks',
    name: 'mongodb',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session*/

require('./config/socketio')(io);

require('./config/routes.js')(app, passport);

http.listen(port, function(){
	console.log('Listening on *: ' + port);
});