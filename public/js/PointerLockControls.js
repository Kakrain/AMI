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

	var yawObject = new THREE.Object3D();
		yawObject.add( pitchObject );
		yawObject.position.x = 0.01;
		yawObject.position.z = 0.0;
		yawObject.position.z = 0.01;

	this.moveForward   = false;
	this.moveBackward = false;
	this.moveLeft          = false;
	this.moveRight        = false;

	var isOnObject = false;
	var canJump    = false;
	var prevTime    = performance.now();
	var velocity      = new THREE.Vector3();
	var PI_2          = Math.PI / 2;
	
	this.setAmbiente = function(_ambiente){
		Ambiente = _ambiente;
	}
	
	var onMouseMove = function ( event ) {
		if ( scope.enabled === false ) return;
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			yawObject.rotation.y -= movementX * 0.002;
			pitchObject.rotation.x -= movementY * 0.002;
			pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
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
	
	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				this.moveForward = true;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = true; 
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				this.moveRight = true;
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
				this.moveForward = false;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				this.moveRight = false;
				break;
		}
	};
	
	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	
	this.enabled = false;

	this.getObject = function () {
		return yawObject;
	};

	this.isOnObject = function ( boolean ) {
		isOnObject = boolean;
		canJump = boolean;
	};

	this.getDirection = function() {
		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );
		return function(v) {
			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		}
	}();

	this.update = function () {
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;
		if(scope.enabled){
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			velocity.y -= 9.8 * altura*3 * delta;
			var vel = altura*100;
			if ( this.moveForward ) velocity.z -= vel * delta;
			if ( this.moveBackward ) velocity.z += vel * delta;
			if ( this.moveLeft ) velocity.x -= vel * delta;
			if ( this.moveRight ) velocity.x += vel * delta;
			if (isOnObject === true ) {
				velocity.y = Math.max( 0, velocity.y );
			}
			yawObject.translateX( velocity.x * delta );
			yawObject.translateY( velocity.y * delta ); 
			yawObject.translateZ( velocity.z * delta );
			if(Ambiente != null){
				if(yawObject.position.x > (Ambiente.getWidth()/2-10)){
					yawObject.position.x = (Ambiente.getWidth()/2-10);
				}else{
					if(yawObject.position.x < -(Ambiente.getWidth()/2-10)){
						yawObject.position.x = -(Ambiente.getWidth()/2-10);
					}
				}
				if(yawObject.position.z > (Ambiente.getHeight()/2-10)){
					yawObject.position.z = (Ambiente.getHeight()/2-10);
				}else{
					if(yawObject.position.z < -(Ambiente.getHeight()/2-10)){
					yawObject.position.z = -(Ambiente.getHeight()/2-10);
					}
				}
			}
			var posy = altura + ((Ambiente != null)?(Ambiente.getYat(yawObject.position)):0);
			if ( yawObject.position.y < posy ) {
				velocity.y = 0;
				yawObject.position.y = posy;
				canJump = true;
			}
		}
		prevTime = time;
	};
	
	onKeyDown(38);
	onKeyUp(38);
};