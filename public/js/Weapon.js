function Weapon(dano,rango,cadencia){
	
	var damage = dano,
		range      = rango,
		rate         = cadencia,
		time        = 0,
		owner     = null;
	
	this.setOwner = function(ow){
		owner = ow;
	}
	
	this.getRange = function(){
		return range;
	}
	
	this.attack = function(enemy,dt){
		time += dt;
		if(time > cadencia){
			enemy.setHealth(enemy.getHealth() - damage,owner);
			var vector = new THREE.Vector3(0,0,1);
			var mesh = owner.getMesh();
			vector.applyQuaternion(mesh.quaternion);
			var vectorInit = vector.clone().applyAxisAngle (new THREE.Vector3(1,0,0), Math.PI/4);
			var angle = (Math.random())*Math.PI*2;
			vectorInit.applyAxisAngle (vector,angle);
			var plano = getPlane(mesh.position,mesh.position.clone().add(vectorInit.multiplyScalar(range)),mesh.position,mesh.position.clone().add(vector.multiplyScalar(range)));
			if(enemy.getHealth()){
				$.notify("el enemigo se quedo con "+enemy.getHealth()+" de vida",{className: 'warn' });
			}else{
				$.notify("el enemigo se murio",{className: 'warn' });
				var meshAr = cortar(enemy.getMesh(),plano);
				scene.remove(enemy.getMesh());
				explode(meshAr,plano,0.1);
				scene.add(meshAr[0]);
				scene.add(meshAr[1]);
				meshAr[0].material.transparent = true;
				enemy.setDead(meshAr);
			}
		}
		time = time%cadencia;
		return !enemy.getHealth();
	}
	
	this.clone = function(){
		return new Weapon(damage,range,rate);
	}
}