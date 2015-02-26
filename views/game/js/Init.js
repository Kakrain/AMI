var scene     = new THREE.Scene();
var weapon  = new Weapon(30,2,1);
var camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer  = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
var clock = new THREE.Clock(true);
var dt = clock.getDelta();
var allies = [];
var enemies = [];

var blendMesh=null;
var interface1 = new Interfaz (camera,scene);
var ambiente  = new ambienteMatico(scene);	
	ambiente.addPlaca('img/map/dirt-512.jpg',20,10);
	//ambiente.addPlaca('img/map/sand-512.jpg',7.7,10);
	ambiente.addPlaca('img/map/grass-512.jpg',15,10);
	ambiente.addPlaca('img/map/rock-512.jpg',16.9,10);
	//ambiente.addPlaca('img/map/snow-512.jpg',10,5);
	ambiente.setDifuminado(0.3);
	ambiente.setHeightMap("img/map/heightmap.png");
	ambiente.setSkybox("Cementary");
	//ambiente.setMar("img/map/water512.jpg");
	ambiente.generate();	

var lanzaMatico;
var mainWeapon = null;
var guerreroMatico;
var halberdier = null;
var body = null;
var body2 = null;
var boxes = null;
var mesh = null;
var enemy,ally,weapon;
var animation;
var NEjE=2;
var NEjA=NEjE-1;
var bodyallies=[];
var bodyenemies=[];

loadHalberdiers();

var render = function () {
	requestAnimationFrame(render);				
	camera.fov = 75;
	camera.updateProjectionMatrix();
	
	dt = clock.getDelta();
	interface1.update(dt);
	if(interface1.enabled()){
		THREE.AnimationHandler.update(dt);
		for (var i=0; i<enemies.length; i++) { 
			enemies[i].animar(dt);
		 }
		 for (var i=0; i < allies.length; i++) { 
			allies[i].animar(dt);
		 }
	}
	renderer.render(scene, camera);
};

document.body.appendChild( renderer.domElement );
interface1.setAmbiente(ambiente);
setLight(scene);
setSun(scene);
setSpot(scene);			
render();

function loadHalberdiers(){



	lanzaMatico = new WeaponMatico("models/lanzainca2.js",scene,30,50,10);
	for(var i=0;i<NEjE;i++){
	bodyenemies[bodyenemies.length]=	new BodyMatico("models/marine_anims_old.js",scene,ambiente);
	}
for(var i=0;i<NEjA;i++){
	bodyallies[bodyallies.length]=	new BodyMatico("models/marine_anims.js",scene,ambiente);	
	}	
	var zeta=0;
	//body = new BodyMatico("models/marine_anims_old.js",scene,ambiente);
	//body2 = new BodyMatico("models/marine_anims.js",scene,ambiente);
	body3 = new BodyMatico("models/marine_anims.js",scene,ambiente);
	var worker = new Worker('js/worker.js');
		worker.postMessage("marco");
		worker.addEventListener('message', function(e) {
	if(!(isEjercitoReady()&&body3.isReady()&&lanzaMatico.isReady())){
		worker.postMessage("marco");
	}else{
		worker.terminate();
		for(var i=0;i<bodyallies.length;i++){
			bodyallies[i].setScale(0.15);
			ally = new Actor (bodyallies[i].getMesh(),scene,ambiente,enemies,allies);
			ally.addArma(lanzaMatico.generate());
			//allies[allies.length] = ally;
			ally.setPosition(-60,-50,60+zeta);
			zeta+=40;
		}
		zeta=0;
		
		for(var i=0;i<bodyenemies.length;i++){
			bodyenemies[i].setScale(0.15);
			enemy = new Actor (bodyenemies[i].getMesh(),scene,ambiente,allies,enemies);
			enemy.addArma(lanzaMatico.generate());
			//enemies[enemies.length]=enemy;
			enemy.setPosition(60,-50,60+zeta);
			zeta+=40;
		}
		body3.setScale(0.15);			
		loadWeapon();
	  }
	}, false);
}
function isEjercitoEneReady(){
	for(var i=0;i<bodyenemies.length;i++){
		if(!bodyenemies[i].isReady()){
		return false;
		}
	}
return true;
}
function isEjercitoAllReady(){
	for(var i=0;i<bodyallies.length;i++){
		if(!bodyallies[i].isReady()){
		return false;
		}
	}
return true;
}
function isEjercitoReady(){
	return isEjercitoAllReady()&&isEjercitoEneReady();
}
function loadWeapon(){
/*
	mainWeapon = lanzaMatico.generate();
	mainWeapon.scale.set(0.045,0.045,0.045);
	mainWeapon.position.x = 0;
	mainWeapon.position.y = -95;
	mainWeapon.position.z = -1;
	mainWeapon.rotation.z = -29.85;
	mainWeapon.rotation.x = -0.3;

*/
	a = new Actor(body3.getMesh(),scene,ambiente,enemies,allies);
	a.disable();
	a.addArma(lanzaMatico.generate());
	body3.getMesh().position.set(-60,-50,60);
	interface1.getControls().setActor(a);
	
}