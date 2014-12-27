var conn = io();

conn.on('enable-game', function(msg){
	interface1.enableControls();
	console.log("Mensaje: " + msg);
});	
conn.on('disable-game',function(msg){
	interface1.disableControls();
	console.log("Mensaje: " + msg);
});
conn.on('disconnect', function(){
	console.log('user disconnected');
});

conn.on('gyroscope-x', function(gValue){
	console.log('Coord-x: ' + gValue);
});
conn.on('gyroscope-y', function(gValue){
	console.log('Coord-y: ' + gValue);
});
conn.on('gyroscope-z', function(gValue){
	console.log('Coord-z: ' + gValue);
});


conn.on('b12-down', function(msg){
	interface1.b12Down();
	console.log(msg);
});
conn.on('b12-up', function(msg){
	interface1.b12Up();
	console.log(msg);
});
conn.on('b21-down', function(msg){
	interface1.b21Down();
	console.log(msg);
});
conn.on('b21-up', function(msg){
	interface1.b21Up();
	console.log(msg);
});
conn.on('b23-down', function(msg){
	interface1.b23Down();
	console.log(msg);
});
conn.on('b23-up', function(msg){
	interface1.b23Up();
	console.log(msg);
});
conn.on('b32-down', function(msg){
	interface1.b32Down();
	console.log(msg);
});
conn.on('b32-up', function(msg){
	interface1.b32Up();
	console.log(msg);
});