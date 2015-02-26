function Actor (_body,scene,_ambiente,_enemies,_allies) {
	var self=this;
	this.mesh =_body;
	this.disabled=false;
	var tiempoPutrefaccion = 2,
		patrulla     = [],
		ipatrulla    = 0,
		sign          = 1,
		range        = 130,
		velocity     = 30,
		ambiente   = _ambiente,
		//body        = _body,
		focus         = null,
		allies         = _allies,
		enemies    = _enemies,
		arma         = null,
		health       = 100,
		dead         = null,
		y               = new THREE.Vector3( 0, 1,0);
		
		this.radius=self.mesh.geometry.boundingSphere.radius;
		
		//box           = new THREE.Box3().setFromObject(mesh),
		//altura        = radius,
		var vector       = new THREE.Vector3( 0, 0,-1);
	self.mesh.position.y = this.radius;
	this.accion = null;   
	vector.applyQuaternion(self.mesh.quaternion);
	var vision = new THREE.Raycaster(self.mesh.position, vector, 1, range);
	allies.splice(1,0,this);
this.setPosition=function(x,y,z){
	self.mesh.position.x=x;
	self.mesh.position.y=y;
	self.mesh.position.z=z;
};
this.getEnemies=function(){
	return enemies;
}
this.getArma=function(){
return arma;
};
this.setAzimut=function(angle){
	self.mesh.rotation.applyAxisAngle(y,angle);
}
	var advancePatrolPosition = function(){
		if(patrulla.length<2){return;}
		ipatrulla += sign;
		if(ipatrulla == patrulla.length || ipatrulla < 0){
			sign *= -1; 
			ipatrulla += sign*2;
		}
	}
 
	this.addPatrolPosition = function(vector){
		createSphere(vector.x,vector.y,vector.z,'red');
		patrulla[patrulla.length] = vector;
	}

	this.addArma = function(_weapon){
		arma = _weapon;
		arma.setOwner(this);
		self.mesh.addWeapon(arma.mesh);
	}

	this.setDead = function(_object){
		dead = _object;
	}

	this.podrirse = function(dt){
		allies.splice(allies.indexOf(this),1);
		/*
		dead[1].material.opacity = dead[1].material.opacity-0.01;
		if(dead[1].material.opacity <= 0){
			scene.remove(dead[0]);
			scene.remove(dead[1]);
			allies.splice(allies.indexOf(this),1);
		}
		*/
	}

	this.setHealth = function(h,who){
		health = h;
		if(health <= 0){
			health = 0;
			this.accion = this.podrirse;
		}else{
			if(focus == null&&!self.disabled){
				this.accion = this.attack;
				focus = who;
				self.mesh.lookAt(focus.mesh.position.setY(self.mesh.position.y));
				self.mesh.rotation.y+=Math.PI;
			}
		}
	}

	this.getHealth = function(){
		return health;
	}
	this.getRealPos=function(){
		return self.mesh.position.clone().setY(self.mesh.position.y+self.radius*self.mesh.scale.y);
	}
	this.getMesh = function(){
		return self.mesh;
	}

	this.setDestino = function(_destiny){
		self.mesh.destino = _destiny;
	}

	this.estaCerca = function(enemy){
		return self.mesh.position.distanceTo(enemy.getMesh().position) <= range;
	}
	
	this.dentroRangoAtaque = function(enemy){
		return self.mesh.position.distanceTo(enemy.getMesh().position) <= arma.getRange();
	} 
	
	this.observar = function(){
		var vector = new THREE.Vector3(0,0,-1),
			ene      = null,
			dist      = 99999,
			d;
		vector.applyQuaternion(self.mesh.quaternion);
		for (var i=0; i<enemies.length; i++) {
			if(this.estaCerca(enemies[i])&&Math.abs(vector.angleTo(enemies[i].getMesh().position.clone().sub(self.mesh.position))) <= Math.PI/4){
				d = self.mesh.position.distanceTo(enemies[i].getMesh().position);
				if(d < dist){
					ene = enemies[i];
					dist = d;
				}
			}
		}
		return ene;
	}

	this.animar = function(dt){
		self.mesh.update(dt);
		this.accion(dt);
	}
	this.setMover=function(){
		self.mesh.setWalking();
		this.accion = this.mover;
	}
	this.setIdle=function(){
		self.mesh.setIdle(true);
		this.accion = this.idle;
	}
	this.disable=function(){
		self.disabled=true;
		this.accion=function(){}
	}
	this.idle = function(){
		var enemy = this.observar();
		if(enemy != null){
			focus = enemy;
			this.accion = this.attack;
			return;
		}
		if(self.mesh.destino != null || patrulla.length != 0){
			self.setMover();
		}
	}
	
	this.setIdle();
	this.attack = function(dt){
		if(focus == null){
			this.setIdle();
			return;
		}
		if(this.dentroRangoAtaque(focus)){
			self.mesh.setAttacking();
			if(arma.attack(focus,dt)){
				focus = null;
				self.mesh.destino = null;
				this.setIdle();
			}
		}else{
			//this.accion = this.mover;
			self.setMover();
		}
	}

	this.mover = function(dt){
		if(focus != null){
			if(this.dentroRangoAtaque(focus)){
				this.accion = this.attack;
				return;
			}else if(!this.estaCerca(focus)){
				focus = null;
			}
			self.mesh.destino = focus.getMesh().position;
		}
		if(self.mesh.destino != null){
			if(this.goTo(dt,self.mesh.destino)){
				self.mesh.destino = null;
				this.setIdle();
			}
		}else{		
			if(patrulla.length != 0){
				if(this.goTo(dt,patrulla[ipatrulla])){//retorna booleano que indica si llego o no
					advancePatrolPosition();
				}
			}
		}
	}

	this.goTo = function(dt,position){
		self.mesh.destino=position;
		return (position.distanceTo(self.mesh.position)<=self.mesh.geometry.boundingSphere.radius*0.1);
	}
}