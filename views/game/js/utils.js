function explode(meshAr,plane,d) {
	var vector = new THREE.Vector3( 0, 0, -1 );
	vector.applyQuaternion( plane.quaternion );
	meshAr[0].position.x -= d * vector.x;
	meshAr[0].position.y -= d * vector.y;
	meshAr[0].position.z -= d * vector.z;
	meshAr[1].position.x += d * vector.x;
	meshAr[1].position.y += d * vector.y;
	meshAr[1].position.z += d * vector.z;
}

function cortar(mesh,plane){
	var box = new THREE.Box3().setFromObject(mesh);
	var tam = getDistance(box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z);
		tam *= 2;
	var boxPlane = new THREE.Mesh(new THREE.BoxGeometry( tam, tam, tam ),new THREE.MeshLambertMaterial({color: 'blue', wireframe:true}));
	var vector = new THREE.Vector3( 0, 0,-1);
	vector.applyQuaternion(plane.quaternion );
	boxPlane.rotation.x = plane.rotation.x;
	boxPlane.rotation.y = plane.rotation.y;
	boxPlane.rotation.z = plane.rotation.z;
	boxPlane.position.x = plane.position.x+(tam/2)*vector.x;
	boxPlane.position.y = plane.position.y+(tam/2)*vector.y;
	boxPlane.position.z = plane.position.z+(tam/2)*vector.z;
	var mesh2 = mesh.clone();
		mesh = (new ThreeBSP(mesh)).subtract((new ThreeBSP(boxPlane))).toMesh(mesh.material);
		mesh.geometry.computeVertexNormals();
		mesh2 = (new ThreeBSP(mesh2)).intersect((new ThreeBSP(boxPlane))).toMesh(mesh.material);
		mesh2.geometry.computeVertexNormals();
	return [mesh,mesh2];
}

function cross(u,v){
	return new THREE.Vector3(
		(u.y*v.z)-(u.z*v.y),
		-((u.x*v.z)-(v.x*u.z)),
		(u.x*v.y)-(v.x*u.y));
}

function getPlan(v1i,v1f,v2i,v2f){
	var geometry = new THREE.Geometry();
	var mI           = new THREE.Vector3((v1f.x+v1i.x)/2,(v1f.y+v1i.y)/2,(v1f.z+v1i.z)/2);
	var mF          = new THREE.Vector3((v2f.x+v2i.x)/2,(v2f.y+v2i.y)/2,(v2f.z+v2i.z)/2);
	var m 			= new THREE.Vector3((mF.x+mI.x)/2,(mF.y+mI.y)/2,(mF.z+mI.z)/2);
	var b            = new THREE.Vector3(v2f.x-v2i.x,v2f.y-v2i.y,v2f.z-v2i.z);
	var a            = new THREE.Vector3(mF.x-mI.x,mF.y-mI.y,mF.z-mI.z);
	var p            = cross(a,b);
	var plan        = new THREE.Mesh(new THREE.PlaneBufferGeometry(mF.sub(mI).length(),b.length(),1,1), new THREE.MeshPhongMaterial({color:'yellow'}));
		plan.material.side = THREE.DoubleSide;
		plan.position.x = m.x;
		plan.position.y = m.y;
		plan.position.z = m.z;
	var v = plan.position.clone();
		v.add(p);
		plan.lookAt(v);
	return(plan);
}
function hasDimention(mesh){
var box = new THREE.Box3().setFromObject(mesh);
var tam=getDistancia(box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z);
return !((tam == Number.POSITIVE_INFINITY)&&(tam == Number.POSITIVE_INFINITY));
}


function getDistancia(x1,y1,z1,x2,y2,z2){
return Math.sqrt(Math.pow(z2-z1,2)+Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
}

function intersect(mesh,plane,epsilon){
var box = new THREE.Box3().setFromObject(plane);
var tam=getDistancia(box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z);
tam/=Math.sqrt(2);
var boxP=new THREE.Mesh(new THREE.BoxGeometry( tam, tam, epsilon),new THREE.MeshLambertMaterial({color: 'red'}));

var vector = new THREE.Vector3( 0, 0,-1);
vector.applyQuaternion(plane.quaternion );
boxP.rotation.x=plane.rotation.x;
boxP.rotation.y=plane.rotation.y;
boxP.rotation.z=plane.rotation.z;

boxP.position.x=plane.position.x;
boxP.position.y=plane.position.y;
boxP.position.z=plane.position.z;
mesh = (new ThreeBSP(mesh)).intersect((new ThreeBSP(boxP))).toMesh(mesh.material);
mesh.geometry.computeVertexNormals();
return hasDimention(mesh);
}
function drawLine(u,v,col){
	var L = new THREE.Geometry();
		L.vertices.push(u);
		L.vertices.push(v);
	scene.add(new THREE.Line(L, new THREE.LineBasicMaterial({color: col})));
}

function getDistance(x1,y1,z1,x2,y2,z2){
	return Math.sqrt(Math.pow(z2-z1,2)+Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
}

function getBoundingBox(mesh){
	var box = new THREE.Box3().setFromObject(mesh);
	var tam = getDistance(box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z);
		tam /= Math.sqrt(2);
	var boxP = new THREE.Mesh(new THREE.BoxGeometry( tam, tam, tam),new THREE.MeshLambertMaterial({color: 'blue'}));
		boxP.position.x = mesh.position.x;
		boxP.position.y = mesh.position.y;
		boxP.position.z = mesh.position.z;
	return boxP;
}

function setLight(_scene){
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	_scene.add( hemiLight );
}

function setSun(_scene){
	var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	dirLight.castShadow = true;
	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;
	var d = 50;
	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;
	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;
	_scene.add( dirLight );
}

function setSpot(_scene){
	var light = new THREE.SpotLight( 0xffffff, 1 );
	light.castShadow = true;
	light.shadowDarkness = 1;
	light.shadowCameraRight =  10;
	light.shadowCameraLeft = -10;
	light.shadowCameraTop =  10;
	light.shadowCameraBottom = -10;
	light.position.y = 4;
	_scene.add(light);
}

function createSphere(x,y,z,color){
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshPhongMaterial({color: color}) );
	sphere.position.x = x;
	sphere.position.y = y;
	sphere.position.z = z;
	scene.add(sphere);
}