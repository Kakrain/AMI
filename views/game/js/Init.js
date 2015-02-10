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
	ambiente.addPlaca('img/map/dirt-512.jpg',40,10);
	ambiente.addPlaca('img/map/sand-512.jpg',7.7,10);
	ambiente.addPlaca('img/map/grass-512.jpg',12.3,10);
	ambiente.addPlaca('img/map/rock-512.jpg',16.9,10);
	ambiente.addPlaca('img/map/snow-512.jpg',10,5);
	ambiente.setDifuminado(0.1);
	ambiente.setHeightMap("img/map/heightmap.png");
	ambiente.setSkybox("dawn");
	ambiente.setMar("img/map/water512.jpg");
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

loadHalberdiers();

var render = function () {
	requestAnimationFrame(render);				
	camera.fov = 75;
	camera.updateProjectionMatrix();
	interface1.update();
	dt = clock.getDelta();
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
	lanzaMatico = new WeaponMatico("models/lanzainca2.js",scene);
	body = new BodyMatico("models/inca.js",scene,ambiente);
	body2 = new BodyMatico("models/inca.js",scene,ambiente);
	var worker = new Worker('js/worker.js');
		worker.postMessage("marco");
		worker.addEventListener('message', function(e) {
	if(!(body.isReady()&&body2.isReady()&&lanzaMatico.isReady())){
		worker.postMessage("marco");
	}else{
		body.setScale(0.15);
		body2.setScale(0.15);
		body.addWeapon(lanzaMatico.generate());
		body2.addWeapon(lanzaMatico.generate());
			worker.terminate();
			weapon = new Weapon(30,10,1);
			enemy = new Actor (body,scene,ambiente,allies,enemies);
			enemies[enemies.length]=enemy;
			enemy.setPosition(60,-50,60);
			enemy.addPatrolPosition(new THREE.Vector3(250,0,250));
			enemy.addPatrolPosition(new THREE.Vector3(-250,0,250));
			enemy.addPatrolPosition(new THREE.Vector3(250,0,-250));
			ally=new Actor (body2,scene,ambiente,enemies,allies);
			allies[allies.length]=ally;
			ally.setPosition(-60,-50,60);
		loadWeapon();
	  }
	}, false);
}

function loadWeapon(){
	mainWeapon = lanzaMatico.generate();
	mainWeapon.scale.set(0.045,0.045,0.045);
	mainWeapon.position.x = 0;
	mainWeapon.position.y = -95;
	mainWeapon.position.z = -1;
	mainWeapon.rotation.z = -29.85;
	mainWeapon.rotation.x = -0.3;
}