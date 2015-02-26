function Weapon(_mesh,dano,rango,cadencia){
	var scope= this;
	this.mesh=_mesh;
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
	this.swing=function(enemies){
			var vector = new THREE.Vector3(0,0,-1);
			var mesh = owner.getMesh();
			vector.applyQuaternion(mesh.quaternion);
			var vectorInit = vector.clone().applyAxisAngle (new THREE.Vector3(1,0,0), Math.PI/4);
			var angle = (Math.random())*Math.PI*2;
			vectorInit.applyAxisAngle (vector,angle);
			var plano = getPlan(mesh.position,mesh.position.clone().setY(mesh.position+owner.radius*mesh.scale.y).add(vectorInit.multiplyScalar(range)),mesh.position,mesh.position.clone().add(vector.multiplyScalar(range)));
			for(var i=0;i<enemies.length;i++){
				if(enemies[i].getRealPos().distanceTo(owner.getRealPos())<range&&Math.abs(vector.angleTo(enemies[i].getRealPos().sub(owner.getRealPos()))) <= Math.PI/4){
					enemies[i].setHealth(enemies[i].getHealth() - damage,owner);
					if(enemies[i].getHealth()){
					$.notify("el enemigo se quedo con "+enemies[i].getHealth()+" de vida",{className: 'warn' });
					}else{
						$.notify("enemigo eliminado",{className: 'warn' });
						scene.remove(enemies[i].getMesh());
					}
					
				}
			}
	};
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
			var plano = getPlan(mesh.position,mesh.position.clone().add(vectorInit.multiplyScalar(range)),mesh.position,mesh.position.clone().add(vector.multiplyScalar(range)));
			if(enemy.getHealth()){
				if(enemy == interface1.getControls().Actor){
					$("#live").html(enemy.getHealth() + "%");
					var x = setTimeout(function() { $('#damage').fadeIn('fast'); }, 1000);
					//clearTimeout(x);
					if(x == null) $('#damage').fadeOut('fast');
				} else {
					$.notify("el enemigo se quedo con "+enemy.getHealth()+" de vida",{className: 'warn' });
				}
			}else{
				if(enemy == interface1.getControls().Actor){
					$('#damage').fadeOut();
					$("#lose").fadeIn();
					$("#live").html("0%");
					$("footer div").css("background","transparent");
					$("#allies").css("background","#696969");
					$("#enemies").css("background","#696969");
					if($.inArray(enemy,allies) > 0) {
						allies = allies.splice($.inArray(enemy,allies),1);
						$("#allies").html(allies.length + " Incas");
						$("#allies").css("width",(allies.length*100)/20 + "%");
					}
				} else {
					$.notify("el enemigo se murio",{className: 'warn' });
					if($.inArray(enemy,allies) > 0) {
						$("#allies").html(allies.length-1 + " Incas");
						$("#allies").css("background-size",((allies.length-1)*100)/20 + "% 100%");
						console.log("Aliados: " + allies.length-1);
					}else if($.inArray(enemy,enemies) > 0){
						$("#enemies").html(enemies.length-1 + " Paltas");
						$("#enemies").css("background-size",((enemies.length-1)*100)/20 + "% 100%");
						console.log("Enemigos: " + enemies.length-1);
						if(enemies.length==0) {
							$("#win").fadeIn();
							$("live").css("background","#696969");
							$("#allies").css("background","#696969");
							$("#enemies").css("background","#696969");	
						}
					}
					
				}
				
				//var meshAr = cortar(enemy.getMesh(),plano);
				
				//explode(meshAr,plano,0.1);
				//scene.add(meshAr[0]);
				//scene.add(meshAr[1]);
				//meshAr[0].material.transparent = true;
				//enemy.setDead(meshAr);
			}
		}
		time = time%cadencia;
		return !enemy.getHealth();
	}
	
	this.clone = function(){
		return new Weapon(damage,range,rate);
	}
}