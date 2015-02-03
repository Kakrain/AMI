/**
 * @author mrdoob / http://mrdoob.com/
 * @author author David
 */

THREE.PointerLockControls = function ( camera ) {

	var pitchObject = new THREE.Object3D(),
			Ambiente  = null,
			scope      = this,
			altura       = 20;
	camera.rotation.set( 0, 0, 0 );
	pitchObject.add( camera );
	var moveForward   = false;
	var moveBackward = false;
	var moveLeft          = false;
	var moveRight        = false;

	var weapon=null;
	
	var isOnObject = false;
	var canJump    = false;
	var prevTime    = performance.now();
	var velocity      = new THREE.Vector3();
	var PI_2          = Math.PI / 2;
	camera.rotation.order = "YXZ";
	this.setAmbiente = function(_ambiente){
		Ambiente = _ambiente;
	}
	this.setWeapon=function(w){
	weapon=w;
	}
	
	var onMouseMove = function ( event ) {
		if ( scope.enabled === false ) return;
		var k=0.002;
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			camera.rotation.y-= k*movementX;
			camera.rotation.x-= k*movementY;
			camera.rotation.x=Math.max(Math.min(camera.rotation.x,Math.PI/2),-Math.PI/2);
	};
	
	this.disable = function(){
		scope.enabled = false;
	}
	
	this.enable = function(){
		scope.enabled = true;
	}
	
	var getAltura = function(){
		return altura;
	}
	
	this.setForward = function(b){
		moveForward = b;
	}
	this.setBackward = function(b){
		moveBackward = b;
	}
	this.setLeft = function(b){
		moveLeft = b;
	}
	this.setRight = function(b){
		moveRight = b;
	}
	
	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; 
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if (canJump === true ) velocity.y += altura*12;//velocity.y += 350;
				canJump = false;
				break;
		}
	};
	
	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};
	
	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	
	this.enabled = false;

	this.isOnObject = function ( boolean ) {
		isOnObject = boolean;
		canJump = boolean;
	};
	this.update = function () {
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;
		if(scope.enabled){
			velocity.y -= 9.8 * altura*3 * delta;
			var vel = altura*10;
					var vector = new THREE.Vector3( 0, 0, -1 );
					vector.applyQuaternion( camera.quaternion );
					if(weapon!=null){
						weapon.position.x=camera.position.x+vector.x*0.5;
						weapon.position.y=camera.position.y+vector.y*0.5;
						weapon.position.z=camera.position.z+vector.z*0.5;
					}
					if (moveForward) { 
						camera.position.x+=vel*vector.x*delta;
						camera.position.z+=vel*vector.z*delta;
				    } else if (moveBackward) { 
						camera.position.x-=vel*vector.x*delta;
						camera.position.z-=vel*vector.z*delta;
				    } 
				    vector = new THREE.Vector3( 1, 0,0);
					vector.applyQuaternion(camera.quaternion);
				    if (moveRight) {
						camera.position.x+=vel*vector.x*delta;
						camera.position.z+=vel*vector.z*delta;
				    } else if (moveLeft) { //37 left key
						camera.position.x-=vel*vector.x*delta;
						camera.position.z-=vel*vector.z*delta;
				    }
if (isOnObject === true ) {
				velocity.y = Math.max( 0, velocity.y );
			}
camera.position.y+=velocity.y * delta;

			if(Ambiente != null){
				if(camera.position.x > (Ambiente.getWidth()/2-10)){
					camera.position.x = (Ambiente.getWidth()/2-10);
				}else{
					if(camera.position.x < -(Ambiente.getWidth()/2-10)){
						camera.position.x = -(Ambiente.getWidth()/2-10);
					}
				}
				if(camera.position.z > (Ambiente.getHeight()/2-10)){
					camera.position.z = (Ambiente.getHeight()/2-10);
				}else{
					if(camera.position.z < -(Ambiente.getHeight()/2-10)){
					camera.position.z = -(Ambiente.getHeight()/2-10);
					}
				}
			}
			var posy = altura + ((Ambiente != null)?(Ambiente.getYat(camera.position)):0);
			if ( camera.position.y < posy ) {
				velocity.y = 0;
				camera.position.y = posy;
				canJump = true;
			}
		}
		
		if(mainWeapon != null) {
			var vectorZ = new THREE.Vector3( 0, 0, -1 );
				vectorZ.applyQuaternion( camera.quaternion );
				
			var vectorY = new THREE.Vector3( 0 , 1 , 0 );
				vectorY.applyQuaternion( camera.quaternion );
			
			var vectorX = new THREE.Vector3( 1 , 0 , 0 );
				vectorX.applyQuaternion( camera.quaternion );
			
			var vectorNulo = new THREE.Vector3( 0 , 0 , 0 );
				
			mainWeapon.position.x = camera.position.x+vectorZ.x+vectorX.x;//+0.5;
			mainWeapon.position.y = camera.position.y+vectorZ.y+vectorX.y;//-3.35;
			mainWeapon.position.z = camera.position.z+vectorZ.z+vectorX.z;//+1;
			
			vectorNulo.x = mainWeapon.position.x + vectorY.x*2;
			vectorNulo.y = mainWeapon.position.y + vectorY.y*2;
			vectorNulo.z = mainWeapon.position.z + vectorY.z*2;
			
			mainWeapon.lookAt(vectorNulo);
			
		}
		
		prevTime = time;
	};
	
};