
var User = require('../models/user');

module.exports = function(io, users) {
	
	io.on('connection', function(socket){	
		
		console.log(socket.client.conn.remoteAddress + " connected");
		
		socket.on('validation-request', function(obj){
			User.findOne({ 'local.email' :  obj.email }, function(err, user) {
				if (!err){
					if (!user) return io.emit('validation-response-no','Correo equivocado.');
					if (!user.validPassword(obj.password)){
						io.emit('validation-response-no','Contraseña equivocada.');
					}
					io.emit('validation-response',user);
				}
			});
		});
		
		socket.on('registration-request', function(obj){
			User.findOne({ 'local.email' :  obj.email }, function(err, user) {
				if (!err){
					if (user) return io.emit('validation-response-no','Correo electrónico ya está en uso.');
					var newUser = new User();
					newUser.local.email = obj.email;
					newUser.local.password = newUser.generateHash(obj.password);
					newUser.save();
					io.emit('registration-response',newUser.local);
				}
			});
		});
		
		socket.on('temporal-web', function (code){
			console.log(" * TEMPORAL WEB: " + code);
			if(!users.indexOf(code)){
				users[users.length] = code;
			}
		});
		
		socket.on('temporal-mobile', function(code){
			console.log(" * TEMPORAL MOBILE: " + code);
			if(users.indexOf(code)){
				console.log("Creating room for: " + code);
				var room = io.of('/'+code);
				room.on('connection', function(namespace){
					console.log(namespace.conn.remoteAddress + ' connected to room ' + code);
					namespace.on('resume-game',function(){
						room.emit('resume-game','Resume Game');
						console.log(" * RESUME");	
					}).on('pause-game',function(){
						room.emit('pause-game','Pause Game');
						console.log(" * PAUSE");	
					}).on('camera-rotation-x',function(gValue){
						room.emit('camera-rotation-x',gValue);
					}).on('camera-rotation-y',function(gValue){
						room.emit('camera-rotation-y',gValue);
					}).on('attack',function(){
						console.log('ATTACK');
						room.emit('attack');
					}).on('block',function(){
						console.log('BLOCK');
					}).on('free-hand',function(){
						console.log(' * FREE HAND');
						room.emit('free-hand');
					}).on('sword',function(){
						console.log(' * SWORD');
						room.emit('sword');
					}).on('spear',function(){
						console.log(' * SPEAR');
						room.emit('spear');
					}).on('arc',function(){
						console.log(' * ARC');
						room.emit('arc');
					}).on('move-forward-down',function(){
						room.emit('move-forward-down','Move forward down');
					}).on('move-forward-up',function(){
						room.emit('move-forward-up','Move forward up');
					}).on('move-left-down',function(){
						room.emit('move-left-down','Move left down');
					}).on('move-left-up',function(){
						room.emit('move-left-up','Move left up');
					}).on('move-right-down',function(){
						room.emit('move-right-down','Move right down');
					}).on('move-right-up',function(){
						room.emit('move-right-up','Move right up');
					}).on('move-backward-down',function(){
						room.emit('move-backward-down','Move backward down');
					}).on('move-backward-up',function(){
						room.emit('move-backward-up','Move backward up');
					}).on('disconnect', function(code){ 
						room.emit('disconnect');
					});
				});
				io.sockets.emit("match-correct",code);
			}
		});
		
	});
};