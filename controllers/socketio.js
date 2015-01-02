
var User = require('../models/user');

module.exports = function(io, users) {
	
	io.on('connection', function(socket){	
		
		console.log("User connected");
		
		socket.on('validation-request', function(obj){
			User.findOne({ 'local.email' :  obj.email }, function(err, user) {
				if (!err){
					if (!user) return io.emit('validation-response-no','Correo equivocado.');
					if (!user.validPassword(password)){
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
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.save();
					io.emit('registration-response',newUser.local);
				}
			});
		});
		
		socket.on('temporal-web', function (code){
			console.log(code);
			if(!users[code]){
				users[users.length] = code;
			}
		});
		
		socket.on('temporal-mobile', function(code){
			console.log(code);
			if(users[code]){
				io.emit("match-correct",code);
			}
		});
		
		socket.on('code-match', function(code){
			console.log(code);
			if(users[code]){
				var room = io.of('/'+code);
				room.on('connection', function(socket){
					console.log('someone connected');
				}).on('resume-game',function(){
					room.emit('resume-game','Resume Game');
					console.log("Resume Game");	
				}).on('pause-game',function(){
					room.emit('pause-game','Pause Game');
					console.log("Pause Game");	
				}).on('gyroscope-x',function(gValue){
					room.emit('gyroscope-x',gValue);
				}).on('gyroscope-y',function(gValue){
					room.emit('gyroscope-y',gValue);
				}).on('gyroscope-z',function(gValue){
					room.emit('gyroscope-z',gValue);
				}).on('attack',function(){
					console.log('Attack');
				}).on('block',function(){
					console.log('Block');
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
					var index = array.indexOf(code);
					if (index > -1) {
						users = users.splice(index,1);
					}
				});
			}
		});
		
	});
};