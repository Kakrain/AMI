function BodyMatico(url,skin,_scene){
	var scene=_scene
	var model = new MM3DModel;
var INskinAnimations=null;
	var INgeometry=null;
	var INmaterial=null;
	var busy=false;
	var skinBoxes = null;
	var weapon=null;
	var ready=false;
	var scale=1;

	var setScale=function(s){
		scale=s;
	}
    var setGeometry=function(g){
    	INgeometry=g.clone();
    }
    var setSkinAnim=function(s){
    	INskinAnimations=s;
    }
    var setMaterial=function(m){
    	INmaterial=m.clone();
    }
	this.isReady=function(){
	return ready;
	}
	model.OnLoad = function()
	{
	geometry = model.GetGeometry();//crea un mesh;
		geometry.computeFaceNormals();
		geometry.computeBoundingSphere();
		setGeometry(geometry);
		texture = THREE.ImageUtils.loadTexture(skin);
		texture.needsUpdate = true;
		material = new THREE.MeshLambertMaterial({map: texture, skinning: true});
//setMaterial(material);
INmaterial=material;
		skinAnimations = model.GetSkeletalAnimations();
		//setSkinAnim(skinAnimations);
		INskinAnimations=skinAnimations;
		ready=true;
	}
	model.Load(url);
	this.generate=function(){
		mesh = new THREE.SkinnedMesh(INgeometry, INmaterial);
		mesh.scale.set(scale,scale,scale);
		
		var animations=[];
		var boxes=[];
		for(var i = 0; i < mesh.skeleton.bones.length; i++)
		{
			var b = new THREE.Object3D();
			b.applyMatrix(mesh.skeleton.bones[i].matrix);
			b.matrix.copy(mesh.skeleton.bones[i].matrix);
			boxes[i] = b;
		}
		for(var i = 0; i < mesh.skeleton.bones.length; i++)
		{
			if(mesh.skeleton.bones[i].parent instanceof THREE.SkinnedMesh) mesh.add(boxes[i]);
			else
			{
				for(var j = 0; j < mesh.skeleton.bones.length; j++)
				{
				if(mesh.skeleton.bones[i].parent == mesh.skeleton.bones[j])
					{
						boxes[j].add(boxes[i]);
					}
				}
			}
		}
		for(var i = 0; i < INskinAnimations.length; i++) {animations[i] = new THREE.Animation(mesh, INskinAnimations[i]);}
			animations[3].loop=false;
			animations[4].loop=false;
			animations[5].loop=false;
			animations[6].loop=false;
			animations[7].loop=false;
			animations[8].loop=false;

			animations[9].loop=false;
			animations[10].loop=false;

			animations[3].timeScale = 2.5;
			animations[4].timeScale = 2.5;
			animations[5].timeScale = 2.5;
			animations[6].timeScale = 4;
			animations[9].timeScale = 2.5;
			animations[10].timeScale = 4;

		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);
		return (new Body(mesh,animations,boxes));
	}
}
function WeaponMatico(url,skin){
	var ready=false;
	var m = new MM3DModel();
	var g=null;
	var mat=null;
	var scale=0.3;
	this.setScale=function(s){
		scale=s;
	}
	var setGeometry=function(geo){
    	g=geo;
    }
		m.OnLoad = function()
		{
			setGeometry(this.GetGeometry());
			var t = THREE.ImageUtils.loadTexture(skin);
			t.needsUpdate = true;
			mat = new THREE.MeshLambertMaterial({map: t});
			ready=true;
		}
		m.Load(url);
	this.generate=function(){
		var weapon = new THREE.Mesh(g, mat);
			weapon.scale.set(scale,scale,scale);
		return weapon;
	}
	this.isReady=function(){
		return ready;
	}
}
function Body(_mesh,_animations,_skinboxes){
	var mesh=_mesh;
	var animations=_animations;	
	var skinboxes=_skinboxes;

this.update=function(){
	
	for(var i = 0; i < skinboxes.length; i++)
		{
			skinboxes[i].position.copy(mesh.skeleton.bones[i].position);
			skinboxes[i].rotation.copy(mesh.skeleton.bones[i].rotation);
		}
}
this.addWeapon=function(mesh){
	skinboxes[13].add(mesh);
}
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
}
