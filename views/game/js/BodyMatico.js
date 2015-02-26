function BodyMatico(url,_scene,_ambiente){
	var scene=_scene;
	var self=this;
	var ambiente=_ambiente;
	var ready=false;
	var scale=1;
	var g=null;
	var mat=null;
	var skinnedMesh=null;
	var loader = new THREE.JSONLoader();
	this.material;
	this.geometry;
	loader.load( url, function(geometry,materials){
		var originalMaterial = materials[ 0 ];
		   originalMaterial.skinning = true;
		   skinnedMesh = new THREE.Marine( geometry, materials[ 0 ] ,ambiente);
		   skinnedMesh.castShadow = true;
		   skinnedMesh.receiveShadow = true;
		   g=geometry;
		   mat=materials;
	        scene.add( skinnedMesh );
			ready=true;
	} );
	this.setScale=function(s){
		scale=s;
		skinnedMesh.scale.set(scale,scale,scale);
	}
this.generate=function(){
		   var mesh = new THREE.Marine( g, mat[0] ,ambiente);
		   mesh.castShadow = true;
		   mesh.receiveShadow = true;
	        scene.add( mesh );
	        return mesh;
	}
this.getMesh=function(){
	return skinnedMesh;
}
this.update=function(dt){
	skinnedMesh.update( dt );
}
	this.isReady=function(){
		return ready;
	}
}

function WeaponMatico(url,_scene,_dano,_rango,_cadencia){
	var ready=false;
	var scene=_scene;
	var g=null;
	var dano=_dano;
	var rango=_rango;
	var cadencia=_cadencia;
	var mat=null;
	var scale=1;
	this.setScale=function(s){
		scale=s;
	}

 	var loader = new THREE.JSONLoader();
        loader.load( url, function(geometry,materials){
        	g=geometry;
        	mat=materials[0];
        	ready=true;
		});
	this.generate=function(){
		var mesh=new THREE.Mesh( g.clone(),mat.clone() );
		mesh.scale.set(scale,scale,scale);
		scene.add(mesh);
		return new Weapon(mesh,dano,rango,cadencia);
		}
	this.isReady=function(){
		return ready;
	}
	}

function Body(url,_scene,_scale){
	var scene=_scene;
	var scale=_scale;
	var mesh;
	var ready=false;
	var radius=null;
	var mesh = new THREE.BlendCharacter;
	mesh.load( url, 
function() {
				//mesh.rotation.y = Math.PI * -135 / 180;
				mesh.position.y=-35.0;
				
				mesh.position.x=parseFloat(mesh.position.x);
				mesh.position.y=parseFloat(mesh.position.y);
				mesh.position.z=parseFloat(mesh.position.z);
				mesh.scale.set(scale,scale,scale);
				scene.add( mesh );				
				var aspect = window.innerWidth / window.innerHeight;
				mesh.geometry.computeBoundingSphere ();
				radius = mesh.geometry.boundingSphere.radius;
				//mesh.play('run', 1);
				ready=true;
			}

		);
	
this.getRadius=function(){
	return radius;
}
this.isReady=function(){
	return ready;
}
this.getMesh=function(){
	return mesh;
}
this.setScale=function(s){
		scale=s;
		mesh.scale.set(scale,scale,scale);
	}
this.update=function(dt){
	mesh.update(dt);
}
}