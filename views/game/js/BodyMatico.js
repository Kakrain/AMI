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

	loader.load( url, function(geometry,materials){
		var originalMaterial = materials[ 0 ];
		   originalMaterial.skinning = true;
		   skinnedMesh = new THREE.Marine( geometry, materials[ 0 ], true ,ambiente);
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
		   var mesh = new THREE.Marine( g, mat[0], true ,ambiente);
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
function onCharacterLoaded(geometry, materials) {

   
       /* var loader = new THREE.JSONLoader();
        loader.load( "models/m4.js", function(geometry,materials){
        	gunMesh = new THREE.Mesh( geometry, materials[0] );
	        scene.add( gunMesh );
			skinnedMesh.addWeapon(gunMesh);
	        
        } );
*/
		
      }
    this.addWeapon=function(mesh){
    	skinnedMesh.addWeapon(mesh);
    }

	this.isReady=function(){
		return ready;
	}
}
function WeaponMatico(url,_scene){
	var ready=false;
	var scene=_scene;
	var g=null;
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
		var weapon=new THREE.Mesh( g.clone(), mat.clone() );
		weapon.scale.set(scale,scale,scale);
		scene.add(weapon);
		return weapon;
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
	mesh = new THREE.BlendCharacter();
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


				radius = mesh.geometry.boundingSphere.radius;
				//mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0.5,0,0));		
				//mesh.geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3( 1, -1, 1 ), Math.PI ));	
				//mesh.rotation.set(0, Math.PI, 0); // Set initial rotation	
				mesh.play('run', 1);
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

this.update=function(dt){
	mesh.update(dt);
	/*for(var i = 0; i < skinboxes.length; i++)
		{
			skinboxes[i].position.copy(mesh.skeleton.bones[i].position);
			skinboxes[i].rotation.copy(mesh.skeleton.bones[i].rotation);
		}*/
}
this.addWeapon=function(mesh){
	//skinboxes[13].add(mesh);
}
/*
this.getMesh=function(){
	return mesh;
}
this.getBoxes=function(){
	return skinboxes;
}
this.calmarse=function(){
		animations[2].stop();
		animations[4].play();
		var worker = new Worker('worker.js');
		worker.postMessage("marco");//usar al worker
		worker.addEventListener('message', function(e) {
		  if(animations[4].isPlaying){
		  	worker.postMessage("marco");
		  }else{
		  	animations[1].play();
		  	worker.terminate();
		  }
		}, false);
	}
	this.alarmarse=function(){
		animations[1].stop();
		animations[3].play();
		var worker = new Worker('worker.js');
		worker.postMessage("marco");//usar al worker
		worker.addEventListener('message', function(e) {
		  if(animations[3].isPlaying){
		  	worker.postMessage("marco");
		  }else{
		  	animations[2].play();
		  	worker.terminate();
		  }
		}, false);
	}
	this.atacar=function(){
		animations[1].stop();
		animations[2].stop();
		if(Math.random()>=0.5){
			this.swing();
		}else{
			this.stab();
		}
	}
	this.swing=function(){
		animations[5].play();
			var worker = new Worker('worker.js');
			worker.postMessage("marco");//usar al worker
			worker.addEventListener('message', function(e) {
			  if(animations[5].isPlaying){
			  	worker.postMessage("marco");
			  }else{
			  	animations[6].play();
			  	worker.terminate();
			  }
			}, false);
	}
	this.stab=function(){
		animations[9].play();
		var worker = new Worker('worker.js');
		worker.postMessage("marco");//usar al worker
		worker.addEventListener('message', function(e) {
		  if(animations[9].isPlaying){
		  	worker.postMessage("marco");
		  }else{
		  	animations[10].play();
		  	worker.terminate();
		  }
		}, false);
	}
	this.block=function(){
		animations[1].stop();
		animations[2].stop();
		animations[8].play();
	}
	this.gostop=function(){
		if(animations[0].isPlaying){
			animations[0].stop();
			return;
		}
		animations[0].play();
	}
	this.walk=function(){
		animations[0].play();
	}
	this.stopwalk=function(){
		animations[0].stop();
	}



	*/
}
