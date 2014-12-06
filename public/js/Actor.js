function Actor (_object,scene,_ambiente,_enemies,_allies) {
	
	var tiempoPutrefaccion = 2,
		patrulla     = [],
		ipatrulla    = 0,
		sign          = 1,
		range        = 80,
		velocity     = 3,
		ambiente   = _ambiente,
		object        = _object,
		focus         = null,
		destino      = null,
		allies         = _allies,
		enemies    = _enemies,
		arma         = null,
		health       = 100,
		dead         = null,
		y               = new THREE.Vector3( 0, 1,0),
		box           = new THREE.Box3().setFromObject(object),
		altura        = (box.max.y-box.min.y)/2,
		vector       = new THREE.Vector3( 0, 0,-1);
	object.position.y = altura;
	scene.add(object);
	this.accion = null;   
	vector.applyQuaternion(object.quaternion);
	var vision = new THREE.Raycaster(object.position, vector, 1, range);
	allies.splice(1,0,this);

	var advancePatrolPosition = function(){
		if(patrulla.length<2){return;}
		ipatrulla += sign;
		if(ipatrulla == patrulla.length || ipatrulla < 0){
			sign *= -1;
			ipatrulla += sign*2;
		}
	}

	this.addPatrolPosition = function(vector){
		patrulla[patrulla.length] = vector;
	}

	this.addArma = function(_weapon){
		arma = _weapon;
		arma.setOwner(this);
	}

	this.setDead = function(_object){
		dead = _object;
	}

	this.podrirse = function(dt){
		dead[1].material.opacity = dead[1].material.opacity-0.01;
		if(dead[1].material.opacity <= 0){
			scene.remove(dead[0]);
			scene.remove(dead[1]);
			allies.splice(allies.indexOf(this),1);
		}
	}

	this.setHealth = function(h,who){
		health = h;
		if(health <= 0){
			health = 0;
			this.accion = this.podrirse;
		}else{
			if(focus == null){
				this.accion = this.attack;
				focus = who;
			}
		}
	}

	this.getHealth = function(){
		return health;
	}

	this.getMesh = function(){
		return object;
	}

	this.setDestino = function(_destiny){
		destino = _destiny;
	}

	this.estaCerca = function(enemy){
		return object.position.distanceTo(enemy.getMesh().position) <= range;
	}
	
	this.dentroRangoAtaque = function(enemy){
		return object.position.distanceTo(enemy.getMesh().position) <= arma.getRange();
	} 
	
	this.observar = function(){
		var vector = new THREE.Vector3(0,0,-1),
			ene      = null,
			dist      = 99999,
			d;
		vector.applyQuaternion(object.quaternion);
		for (var i=0; i<enemies.length; i++) { 
			if(this.estaCerca(enemies[i])&&Math.abs(vector.angleTo(enemies[i].getMesh().position.clone().sub(object.position))) <= Math.PI/4){
				d = object.position.distanceTo(enemies[i].getMesh().position);
				if(d < dist){
					ene = enemies[i];
					dist = d;
				}
			}
		}
		return ene;
	}

	this.animar = function(dt){
		this.accion(dt);
	}

	this.idle = function(){
		var enemy = this.observar();
		if(enemy != null){
			focus = enemy;
			this.accion = this.attack;
			return;
		}
		if(destino != null || patrulla.length != 0){
			this.accion = this.mover;
		}
	}
	
	this.accion = this.idle;
	this.attack = function(dt){
		if(focus == null){
			this.accion = this.idle;
			return;
		}
		if(this.dentroRangoAtaque(focus)){
			if(arma.attack(focus,dt)){
				focus = null;
				destino = null;
				this.accion = this.idle;
			}
		}else{
			this.accion = this.mover;
		}
	}

	this.mover = function(dt) {
		if(focus != null){
			if(this.dentroRangoAtaque(focus)){
				this.accion = this.attack;
				return;
			}else if(!this.estaCerca(focus)){
				focus = null;
			}
			destino = focus.getMesh().position;
		}
		if(destino != null){
			if(this.goTo(dt,destino)){
				destino = null;
				this.accion = this.idle;
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
		position.y = object.position.y;
		object.lookAt(position);
		var vector = new THREE.Vector3( 0, 0, -1 );
			vector.subVectors(position,object.position);
			vector.y = 0;
		var dist = vector.clone();
			vector.normalize();
			vector = vector.multiplyScalar(dt*velocity);
		if(vector.length() < dist.length()){
			object.position.add(vector);
			object.position.y = ambiente.getYat(object.position) + altura;
			return false;
		}else{
			object.position.add(dist);
			object.position.y = ambiente.getYat(object.position) + altura;
			return true;
		}
	}
}