function Actor (_body,scene,_ambiente,_enemies,_allies) {
	
	var tiempoPutrefaccion = 2,
		patrulla     = [],
		ipatrulla    = 0,
		sign          = 1,
		range        = 80,
		velocity     = 3,
		ambiente   = _ambiente,
		body        = _body,
		mesh =body.getMesh(),
		focus         = null,
		destino      = null,
		allies         = _allies,
		enemies    = _enemies,
		arma         = null,
		health       = 100,
		dead         = null,
		y               = new THREE.Vector3( 0, 1,0),
		box           = new THREE.Box3().setFromObject(mesh),
		altura        = (box.max.y-box.min.y)/2,
		vector       = new THREE.Vector3( 0, 0,-1);
	mesh.position.y = altura;
	this.accion = null;   
	vector.applyQuaternion(mesh.quaternion);
	var vision = new THREE.Raycaster(mesh.position, vector, 1, range);
	allies.splice(1,0,this);

this.setPosition=function(x,y,z){
	mesh.position.x=x;
	mesh.position.y=y;
	mesh.position.z=z;
}
this.setAzimut=function(angle){
	$.notify("vec: "+mesh.rotation.x);
	mesh.rotation.applyAxisAngle(y,angle);
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
		patrulla[patrulla.length] = vector;
	}

	this.addArma = function(_weapon,mesh){
		body.addWeapon(mesh);
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
		return mesh;
	}

	this.setDestino = function(_destiny){
		destino = _destiny;
	}

	this.estaCerca = function(enemy){
		return mesh.position.distanceTo(enemy.getMesh().position) <= range;
	}
	
	this.dentroRangoAtaque = function(enemy){
		return mesh.position.distanceTo(enemy.getMesh().position) <= arma.getRange();
	} 
	
	this.observar = function(){
		var vector = new THREE.Vector3(0,0,-1),
			ene      = null,
			dist      = 99999,
			d;
		vector.applyQuaternion(mesh.quaternion);
		for (var i=0; i<enemies.length; i++) { 
			if(this.estaCerca(enemies[i])&&Math.abs(vector.angleTo(enemies[i].getMesh().position.clone().sub(mesh.position))) <= Math.PI/4){
				d = mesh.position.distanceTo(enemies[i].getMesh().position);
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
		position.y = mesh.position.y;
		mesh.lookAt(position);
		var vector = new THREE.Vector3( 0, 0, -1 );
			vector.subVectors(position,mesh.position);
			vector.y = 0;
		var dist = vector.clone();
			vector.normalize();
			vector = vector.multiplyScalar(dt*velocity);
		if(vector.length() < dist.length()){
			mesh.position.add(vector);
			mesh.position.y = ambiente.getYat(mesh.position) + altura;
			return false;
		}else{
			mesh.position.add(dist);
			mesh.position.y = ambiente.getYat(mesh.position) + altura;
			return true;
		}
	}
}