function Interfaz (camera,scene) {
	var blocker= document.createElement('div');
	var instructions=document.createElement('div');
	var pointerlockchange=null;
	var pointerlockerror=null;
	var controls= new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	
this.setAmbiente=function(ambiente){
	controls.setAmbiente(ambiente);
}
this.update=function(){
	controls.isOnObject( false );
	controls.update();
}
this.enabled=function(){
	return controls.enabled;
}
this.addTags=function(){
//this.blocker = document.createElement('div');
blocker.setAttribute('id','blocker');
instructions=document.createElement('div');

instructions.setAttribute('id','instructions');
var span = document.createElement('span');
span.innerHTML="Click to play";
span.style.fontSize="40px";
var br = document.createElement('br');

blocker.style.position="absolute";
blocker.style.width="100%";
blocker.style.height="100%";
blocker.style.backgroundColor="rgba(0,0,0,0.5)";

instructions.style.width="100%";
instructions.style.height="100%";
instructions.style.display="-webkit-box";
instructions.style.display="-moz-box";
instructions.style.display="box";
instructions.style.display="box";
instructions.style.textAlign="center";
instructions.style.cursor="pointer";
instructions.setAttribute('style','-webkit-box-orient: horizontal;-moz-box-orient: horizontal;box-orient: horizontal;-webkit-box-pack: center;-moz-box-pack: center;box-pack: center;-webkit-box-align: center;-moz-box-align: center;box-align: center;');
instructions.appendChild(span);
instructions.appendChild(br);
instructions.innerHTML+="(W, A, S, D = Move, SPACE = Jump, MOUSE = Look around)";


instructions.style.position="fixed";
instructions.style.top="50%";
instructions.style.left="50%";
instructions.style.transform="translate(-50%, -50%)";
instructions.style.color="#FFFFFF"

blocker.appendChild(instructions);
//document.getElementsByTagName("body")[0].insertBefore(blocker, document.getElementsByTagName("body")[0].firstChild);
document.body.insertBefore(blocker, document.body.firstChild);
}
this.InitControls=function(){
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if ( havePointerLock ) {
	var element = document.body;
	pointerlockchange = function ( event ) {
	if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controls.enabled = true;
			blocker.style.display = 'none';
		} else {
			controls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';
			blocker.style.display = '';
			}
		}
		pointerlockerror = function ( event ) {
			blocker.style.display = '';
		}
// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
blocker.addEventListener( 'click', function ( event ) {
					blocker.style.display = 'none';
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
					if ( /Firefox/i.test( navigator.userAgent ) ) {
						var fullscreenchange = function ( event ) {
							if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
								element.requestPointerLock();
							}
						}
						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
						element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
						element.requestFullscreen();
					} else {
						element.requestPointerLock();
					}
				}, false );
			} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			}
}
this.addTags();
this.InitControls();
};


