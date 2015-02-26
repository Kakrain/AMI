var room = getUrlVars()["code"];

var conn = io(":8080/"+room);

conn.on('resume-game', function(msg){
	interface1.enableControls();
	$('#start').fadeOut();
	$('footer').fadeIn();
	$('aside').fadeIn();
});	
conn.on('pause-game',function(msg){
	interface1.disableControls();
});

conn.on('mediaInit-disable',function(msg){
	$('#mediaInit').trigger('pause');
	$('#mediaContinue').trigger('play');
});
conn.on('disconnect', function(){	
	var href = window.location.href;
	href = href.substr(0,href.indexOf('/'));
	href = href + "/logout";
	window.location.href = href;
});

conn.on('camera-rotation-x', function(gValue){
	if(interface1.getControls().Actor==null){
		camera.rotation.x += 0.02*parseFloat(gValue);
	}else{
		interface1.getControls().h -= 0.02*parseFloat(gValue)*30;
		interface1.getControls().h = Math.max(Math.min(interface1.getControls().h,interface1.getControls().Z-0.1),0.1-interface1.getControls().Z);
	}	
});

conn.on('camera-rotation-y', function(gValue){
	if(interface1.getControls().Actor==null){
		camera.rotation.y += 0.02*parseFloat(gValue);
	}else{
		interface1.getControls().theta -= 0.02*parseFloat(gValue);
	}
});

conn.on('attack', function(){
	interface1.getControls().attack();
});

conn.on('free-hand', function(){
	interface1.getControls().Actor.mesh.getBoxes()[24].remove(interface1.getControls().Actor.mesh.getArmas()[0]);
});
conn.on('spear', function(){
	interface1.getControls().Actor.mesh.getBoxes()[24].add(interface1.getControls().Actor.mesh.getArmas()[0]);
});


conn.on('move-forward-down', function(msg){
	interface1.b12Down();
});
conn.on('move-forward-up', function(msg){
	interface1.b12Up();
});
conn.on('move-left-down', function(msg){
	interface1.b21Down();
});
conn.on('move-left-up', function(msg){
	interface1.b21Up();
});
conn.on('move-right-down', function(msg){
	interface1.b23Down();
});
conn.on('move-right-up', function(msg){
	interface1.b23Up();
});
conn.on('move-backward-down', function(msg){
	interface1.b32Down();
});
conn.on('move-backward-up', function(msg){
	interface1.b32Up();
});


function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}