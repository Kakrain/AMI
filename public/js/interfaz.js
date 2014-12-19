function Interfaz (camera,scene) {
	
	var pointerlockchange = null,
		 pointerlockerror      = null,
		 element                  = null,
		 instructions            = document.createElement('div'),
	     blocker                  = document.createElement('div'), 
	     controls                 = new THREE.PointerLockControls( camera );
	//scene.add( controls.getObject() );
scene.add(camera);
	this.setAmbiente = function(ambiente){
		controls.setAmbiente(ambiente);
	}
	
	this.update = function(){
		controls.isOnObject(false);
		controls.update();
	}
	
	this.enabled = function(){
		return controls.enabled;
	}
	
	this.addTags = function(){
		blocker.setAttribute('id','blocker');
			blocker.style.position = "absolute";
			blocker.style.width = "100%";
			blocker.style.height = "100%";
			blocker.style.backgroundColor = "rgba(0,0,0,0.5)";
		instructions = document.createElement('div');
			instructions.setAttribute('id','instructions');
			instructions.style.width="100%";
			instructions.style.height="100%";
			instructions.style.display="-webkit-box";
			instructions.style.display="-moz-box";
			instructions.style.display="box";
			instructions.style.display="box";
			instructions.style.textAlign="center";
			instructions.style.cursor="pointer";
			instructions.setAttribute('style','-webkit-box-orient: horizontal;-moz-box-orient: horizontal;box-orient: horizontal;-webkit-box-pack: center;-moz-box-pack: center;box-pack: center;-webkit-box-align: center;-moz-box-align: center;box-align: center;');
			instructions.style.position="fixed";
			instructions.style.top="50%";
			instructions.style.left="50%";
			instructions.style.transform="translate(-50%, -50%)";
			instructions.style.color="#FFFFFF";
		var span = document.createElement('span');
			span.innerHTML="Activa para jugar";
			span.style.fontSize="40px";
		var br = document.createElement('br');
		instructions.appendChild(span);
		instructions.appendChild(br);
		instructions.innerHTML+="(Mueve el switch de tu dispositivo)";
		blocker.appendChild(instructions);
		document.body.insertBefore(blocker, document.body.firstChild);
	}
	
	this.InitControls = function(){
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
		if ( havePointerLock ) {
			element = document.body;
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
			document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'pointerlockerror', pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
			blocker.addEventListener( 'click', function (){
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
	
	/* ----------------------------------------
	Functions called usign Socket.io
	-----------------------------------------*/
	
	this.enableControls = function (){
		controls.enabled = true;
		$("#blocker").fadeOut();
	}
	
	this.disableControls = function (){
		controls.enabled = false;
		$("#blocker").fadeIn();
	}
	
	this.b12Down = function(){ controls.moveForward = true; }
	this.b12Up = function(){ controls.moveForward = false;}
	
	this.b21Down = function(){ controls.moveLeft = true; }
	this.b21Up = function(){ controls.moveLeft = false;}
	
	this.b23Down = function(){ controls.moveRight = true; }
	this.b23Up = function(){ controls.moveRight = false; }
	
	this.b32Down = function(){ controls.moveBackward = true; }
	this.b32Up = function(){ controls.moveBackward = false; }
	
	this.addTags();
	this.InitControls();
};
