/**
 * @author mrdoob / http://mrdoob.com/
 * @coauthor author David
 */
THREE.PointerLockControls = function ( camera ) {
	
	var self=this;
	var pitchObject = new THREE.Object3D(),
			Ambiente  = null,
			altura       = 20;
	camera.rotation.set( 0, 0, 0 );
	pitchObject.add( camera );
	var moveForward   = false;
	var moveBackward = false;
	var moveLeft          = false;
	var moveRight        = false;

	this.vectorX = new THREE.Vector3();
	this.vectorY = new THREE.Vector3();
	this.vectorZ = new THREE.Vector3();
	this.vectorNulo= new THREE.Vector3();

	var weapon=null;
	this.pivot=null;
	this.Actor=null;
	this.theta=0.0;
	this.h=0.0;
	this.Z=20;
	var isOnObject = false;
	var canJump    = false;
	var velocity      = new THREE.Vector3();
	camera.rotation.order = "YXZ";
	var attacking=false;
	tiempo_ataque=0.0;

	this.setAmbiente = function(_ambiente){
		Ambiente = _ambiente;
	}
	this.setWeapon=function(w){
	weapon=w;
	}
	
	var onMouseMove = function ( event ) {
		if ( self.enabled === false ) return;
		var k=0.002;
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		if(self.Actor==null){
			camera.rotation.y-= k*movementX;
			camera.rotation.x-= k*movementY;
			camera.rotation.x=Math.max(Math.min(camera.rotation.x,Math.PI/2),-Math.PI/2);
		}else{
			self.theta+=k*movementX;
			self.h+=k*movementY*30;
			self.h=Math.max(Math.min(self.h,self.Z-0.1),0.1-self.Z);
		}
			
	};
	this.setActor=function(ac){
		self.Actor=ac;
	}
	this.disable = function(){
		self.enabled = false;
	}
	
	this.enable = function(){
		self.enabled = true;
	}
	
	var getAltura = function(){
		return altura;
	}
	
	this.setForward = function(b){
		moveForward = b;
		if(self.Actor!=null){
			self.Actor.mesh.forwardPressed=b;
			if(self.Actor.mesh.forwardPressed){
				self.Actor.mesh.runAnim.play(true,1,1);
			} else {
				self.Actor.mesh.runAnim.stop(0.01);
			}
		}
	}
	this.setBackward = function(b){
		moveBackward = b;
		if(self.Actor!=null){
			self.Actor.mesh.forwardPressed=b;
			if(self.Actor.mesh.forwardPressed){
				self.Actor.mesh.runAnim.play(true,1,1);
			} else {
				self.Actor.mesh.runAnim.stop(0.01);
			}
		}
	}
	this.setLeft = function(b){
		moveLeft = b;
		if(self.Actor!=null){
			self.Actor.mesh.forwardPressed=b;
			if(self.Actor.mesh.forwardPressed){
				self.Actor.mesh.runAnim.play(true,1,1);
			} else {
				self.Actor.mesh.runAnim.stop(0.01);
			}
		}
	}
	this.setRight = function(b){
		moveRight = b;
		if(self.Actor!=null){
			self.Actor.mesh.forwardPressed=b;
			if(self.Actor.mesh.forwardPressed){
				self.Actor.mesh.runAnim.play(true,1,1);
			} else {
				self.Actor.mesh.runAnim.stop(0.01);
			}
		}
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
		if(self.Actor!=null&&!self.Actor.mesh.forwardPressed){
			self.Actor.mesh.forwardPressed=(moveForward||moveLeft||moveBackward||moveRight);
			self.Actor.mesh.runAnim.play(true, 1, 1);
		}
	};
	
	var onClickDown=function(event){
		if(self.Actor != null&&!attacking){
		attacking=true;
		self.Actor.mesh.setAllZero();
			self.Actor.getArma().swing(self.Actor.getEnemies());
			self.Actor.mesh.idleFiringAnim.play(false,1,0);
		}
	};
	
	this.attack = function(){
		onClickDown();
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
		if(self.Actor!=null){
			self.Actor.mesh.forwardPressed=(moveForward||moveLeft||moveBackward||moveRight);
			if(!self.Actor.mesh.forwardPressed){
			self.Actor.mesh.runAnim.stop(0.01);
			}
		}
	};

	document.addEventListener( 'mousedown', onClickDown, false );
	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	
	this.enabled = false;

	this.isOnObject = function ( boolean ) {
		isOnObject = boolean;
		canJump = boolean;
	};
	
	this.update = function (delta) {
		if(self.enabled){
			velocity.y -= 9.8 * altura*3 * delta;
			var vel = altura*3;
			self.vectorZ.set( 0, 0, -1 );
			self.vectorZ.applyQuaternion( camera.quaternion );
			self.vectorY.set( 0 , 1 , 0 );
			self.vectorY.applyQuaternion( camera.quaternion );
			self.vectorX.set( 1 , 0 , 0 );
			self.vectorX.applyQuaternion( camera.quaternion );
					/*if(weapon!=null){
						weapon.position.x=camera.position.x+self.vectorZ.x*0.5;
						weapon.position.y=camera.position.y+self.vectorZ.y*0.5;
						weapon.position.z=camera.position.z+self.vectorZ.z*0.5;
					}*/
					if(self.Actor!=null){
					
					if(attacking){
					tiempo_ataque+=delta;
						if(tiempo_ataque>=self.Actor.mesh.idleFiringAnim.data.length){
							tiempo_ataque=0;
							self.Actor.mesh.idleFiringAnim.stop();
							attacking=false;
						}				
					}
						var x,z;
						c=Math.sqrt(Math.pow(self.Z,2)-Math.pow(self.h,2));
						x=c*Math.cos(self.theta);
						z=c*Math.sin(self.theta);
						self.vectorNulo.x=self.Actor.mesh.position.x;
						self.vectorNulo.y=self.Actor.mesh.position.y+self.Actor.radius*self.Actor.mesh.scale.y*2;
						self.vectorNulo.z=self.Actor.mesh.position.z;
						camera.position.x = x+self.vectorNulo.x;
						camera.position.y = self.h+self.vectorNulo.y;
						camera.position.z = z+self.vectorNulo.z;
						self.Actor.mesh.rotation.y=-self.theta+Math.PI/2;
						camera.lookAt(self.vectorNulo);
						//self.Actor.mesh.forwardPressed=moveForward;
						//self.Actor.mesh.forwardPressed=moveForward||moveBackward||moveRight||moveLeft;
							if(moveRight){
								self.Actor.mesh.rotation.y-=Math.PI/2
								if(moveForward){
									self.Actor.mesh.rotation.y+=Math.PI/4;
								}else{
									if(moveBackward){
										self.Actor.mesh.rotation.y-=Math.PI/4;
									}
								}
							}else{
								if(moveLeft){
									self.Actor.mesh.rotation.y+=Math.PI/2;
									if(moveForward){
										self.Actor.mesh.rotation.y-=Math.PI/4;
									}else{
										if(moveBackward){
											self.Actor.mesh.rotation.y+=Math.PI/4;
										}
									}

								}else{
									if(moveBackward){
										self.Actor.mesh.rotation.y+=Math.PI;
									}
								}
							}
					}else{
						if (moveForward) { 
							camera.position.x+=vel*self.vectorZ.x*delta;
							camera.position.z+=vel*self.vectorZ.z*delta;
					    } else if (moveBackward) { 
							camera.position.x-=vel*self.vectorZ.x*delta;
							camera.position.z-=vel*self.vectorZ.z*delta;
					    } 
					    if (moveRight) {
							camera.position.x+=vel*self.vectorX.x*delta;
							camera.position.z+=vel*self.vectorX.z*delta;
					    } else if (moveLeft) { //37 left key
							camera.position.x-=vel*self.vectorX.x*delta;
							camera.position
							.z-=vel*self.vectorX.z*delta;
					    }

					    if (isOnObject === true ) {
						velocity.y = Math.max( 0, velocity.y );
							}
						camera.position.y+=velocity.y * delta;

						var posy = altura + ((Ambiente != null)?(Ambiente.getYat(camera.position)):0);
						if ( camera.position.y < posy ) {
							velocity.y = 0;
							camera.position.y = posy;
							canJump = true;
						}
					}
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
				Ambiente.skybox.position.copy(camera.position);
			}
		}
		/*if(mainWeapon != null) {
			self.vectorNulo.set(0,0,0);
			mainWeapon.position.x = camera.position.x+self.vectorZ.x*0.8+self.vectorX.x*0.8-self.vectorY.x;//+0.5;
			mainWeapon.position.y = camera.position.y+self.vectorZ.y*0.8+self.vectorX.y*0.8-self.vectorY.y;//-3.35;
			mainWeapon.position.z = camera.position.z+self.vectorZ.z*0.8+self.vectorX.z*0.8-self.vectorY.z;//+1;
			var angle=-Math.PI/4;
			if(attacking){
				swingAngle-=swingVel*delta;
				angle+=swingAngle;
				if(swingAngle<-swingMax){
				swingAngle=0;
				attacking=false;
				}	
			}
			self.vectorY.applyAxisAngle (self.vectorX,angle);
			self.vectorY.applyAxisAngle (self.vectorZ,orientation);
			self.vectorNulo.x = mainWeapon.position.x + self.vectorY.x*2;
			self.vectorNulo.y = mainWeapon.position.y + self.vectorY.y*2;
			self.vectorNulo.z = mainWeapon.position.z + self.vectorY.z*2;
			mainWeapon.lookAt(self.vectorNulo);		
		}*/
	};
	
};