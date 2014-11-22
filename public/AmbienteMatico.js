function ambienteMatico(_scene){
var scene=_scene
var scale=1;
var skyboxname=null;//se buscara en /skyboxname/skyboxnameDW.png, etc (si, solo soportaremos png(arbitrariamente, podria ser otro formato)) 
var heightmapUrl=null;
var marUrl=null;
var HeightData=null;
var maxHeight=null;

var plane=null;
var skybox=null
var img=null;

var altura=-100;
var nivelMar=50;

var d=0.02
var width=1000;
var height=1000;

var Placas=[];

this.setMar=function(url){
 	marUrl=url;
}
this.setnivelMar=function(n){
 	nivelMar=n;
}
this.setAltura=function(h){
 	altura=h;
}
this.setDifuminado=function(_d){
 	d=_d;
}
this.setHeightMap=function(url){
	heightmapUrl=url;
}
this.addPlaca=function(url,peso,repeat){
Placas[Placas.length]=[url,peso,repeat];
}
this.setSkybox=function(name){
	skyboxname=name;
}
this.generateSkyBox=function(){
var materialArray = [];
 materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'skybox/'+skyboxname+'/'+skyboxname+'FT.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'skybox/'+skyboxname+'/'+skyboxname+'BK.jpg' ) }));

    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'skybox/'+skyboxname+'/'+skyboxname+'UP.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'skybox/'+skyboxname+'/'+skyboxname+'DN.jpg' ) }));

    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'skybox/'+skyboxname+'/'+skyboxname+'RT.jpg' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'skybox/'+skyboxname+'/'+skyboxname+'LT.jpg' ) }));
    var max=(width>height) ? width : height;
for (var i = 0; i < 6; i++){materialArray[i].side = THREE.BackSide;}
    var skyboxGeom = new THREE.BoxGeometry( max, max, max, 1, 1, 1);//era 1000
    skybox = new THREE.Mesh( skyboxGeom, new THREE.MeshFaceMaterial(materialArray));
    scene.add(skybox);
}
this.generate=function(){
img = new Image();
img.src = heightmapUrl;
img.onload = function () {
	HeightData=getHeightData(img,scale);
	maxHeight=getMaxHeight(HeightData);
	drawTerreno();
}
this.generateSkyBox();
}
var getMaxHeight=function(dat){
	var max=0;
	for ( var i = 0; i<dat.length; i++ ) {
         if(max<dat[i]){
         	max=dat[i];
         }
    }
    return max;
}
var getHeightData =function(img,scale) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );
    var size = img.width * img.height;
    var data = new Float32Array( size );
    context.drawImage(img,0,0);
    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
 
    var j=0;
    for (var i = 0; i<pix.length; i +=4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }
    return data;
}
var drawTerreno=function(img,material,width,height){
var textures=[];
var s="";
for (var i = 0; i<Placas.length; i++) {
textures[i]=new THREE.ImageUtils.loadTexture(Placas[i][0]);
textures[i].wrapS = textures[i].wrapT = THREE.RepeatWrapping; 
s+="texture"+i+":	{ type: 't', value: textures["+i+"]},"
}

	var bumpTexture = THREE.ImageUtils.loadTexture(heightmapUrl);
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 

	var bumpScale   = 200.0;
 eval("var customUniforms ={"+
		"bumpTexture:	{ type: 't', value: bumpTexture },"+
		"bumpScale:	    { type: 'f', value: bumpScale },"+s+
	"};");
 
var s1="";
var s2="";
var s3="";
var max=maxHeight;
max+=10;
var sum=0;
for (var i = 0; i<Placas.length; i++) {
	sum+=Placas[i][1];
}
var m=0;
var ant;
for (var i = 0; i<textures.length; i++) {
	s1+="uniform sampler2D texture"+i+";";
	ant=m;
	m+=((Placas[i][1]*max)/(sum*100));
	if(i==0){
		s2+="vec4 t"+i+"=(smoothstep(0.01,"+(m-d/2)+",vAmount)-smoothstep("+(m-d/2)+","+(m+d/2)+", vAmount))*texture2D( texture"+i+", vUV *"+(Placas[i][2]).toFixed(2)+");";
	}
	else 
	if(i==(textures.length-2)){
		s2+="vec4 t"+i+"=(smoothstep("+(ant-d/2)+","+(ant+d/2)+",vAmount)-smoothstep("+m+","+(m+((Placas[i+1][1]*max)/sum))+",vAmount))*texture2D(texture"+i+",vUV*"+(Placas[i][2]).toFixed(2)+");";
	}else 
	if(i==textures.length-1){
		s2+="vec4 t"+i+"=(smoothstep("+ant+","+m+", vAmount))*texture2D( texture"+i+", vUV *"+(Placas[i][2]).toFixed(2)+");"
	}
	else
	{
		s2+="vec4 t"+i+"=(smoothstep("+(ant-d/2)+","+(ant+d/2)+",vAmount)-smoothstep("+(m-d/2)+","+(m+d/2)+",vAmount))*texture2D(texture"+i+",vUV*"+(Placas[i][2]).toFixed(2)+");";
	}
	s3+="+t"+i;
}
var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: customUniforms,
		vertexShader:  
		"uniform sampler2D bumpTexture;"+
		"uniform float bumpScale;"+
		"varying float vAmount;"+
		"varying vec2 vUV;"+
		"void main(){"+
		"	vUV = uv;"+
		"	vec4 bumpData = texture2D( bumpTexture, uv );"+
		"    vAmount = bumpData.r;"+
		"    vec3 newPosition = position + normal * bumpScale * vAmount;"+
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );}",
		fragmentShader: 
		s1+
		"varying vec2 vUV;"+
		"varying float vAmount;"+
		"void main(){"+s2+			
			"gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0)"+s3+";}",

	}   );
	var planeGeo = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
	var plane = new THREE.Mesh(	planeGeo, customMaterial );
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -100;
	scene.add( plane );

if(marUrl!=null){
	var waterGeo = new THREE.PlaneGeometry( width, height, 1, 1 );
	var waterTex = new THREE.ImageUtils.loadTexture(marUrl);
	waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping; 
	waterTex.repeat.set(5,5);
	var waterMat = new THREE.MeshBasicMaterial( {map: waterTex, transparent:true, opacity:0.40} );
	var water = new THREE.Mesh(	planeGeo, waterMat );
	water.rotation.x = -Math.PI / 2;
	water.position.y =altura+nivelMar;
	scene.add(water);
	}

}
}