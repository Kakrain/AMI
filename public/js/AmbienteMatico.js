function ambienteMatico(_scene){
	var scene = _scene,
		HeightData = null,
		maxHeight  = null,
		scale          = 1,
		marUrl        = null,
		plane          = null,
		planeFisico = null,
		skybox        = null,
		img             = null,
		altura          = -100,
		nivelMar      = 50,
		d                 = 0.02,
		width           = 1000,
		height          = 1000,
		offSetY        = 1,
		Placas         = [];

	this.getWidth = function(){
		return width;
	}
	
	this.getHeight = function(){
		return height;
	}

	this.setOffsetY = function(n){
		offSetY = n;
	}
	
	this.getYat = function(v){
		return getYat(v);
	}

	this.setMar = function(url){
		marUrl = url;
	}
	
	this.setnivelMar = function(n){
		nivelMar = n;
	}
	
	this.getAltura = function(){
		return altura;
	}

	this.setAltura = function(h){
		altura = h;
	}

	this.setDifuminado = function(_d){
		d = _d;
	}

	this.setHeightMap = function(url){
		heightmapUrl = url;
	}

	this.addPlaca = function(url,peso,repeat){
		Placas[Placas.length] = [url,peso,repeat];
	}

	this.setSkybox = function(name){
		skyboxname = name;
	}

	this.generateSkyBox = function(){
		var materialArray = [];
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/skybox/'+skyboxname+'/'+skyboxname+'FT.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/skybox/'+skyboxname+'/'+skyboxname+'BK.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/skybox/'+skyboxname+'/'+skyboxname+'UP.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/skybox/'+skyboxname+'/'+skyboxname+'DN.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/skybox/'+skyboxname+'/'+skyboxname+'RT.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/skybox/'+skyboxname+'/'+skyboxname+'LT.jpg' ) }));
		var max=(width>height) ? width : height;
		for (var i=0; i<6; i++){
			materialArray[i].side = THREE.BackSide;
		}
		var skyboxGeom = new THREE.BoxGeometry( max, max, max, 1, 1, 1);
		skybox = new THREE.Mesh( skyboxGeom, new THREE.MeshFaceMaterial(materialArray));
		scene.add(skybox);
	}

	this.generate = function(){
		img = new Image();
		img.src = heightmapUrl;
		img.onload = function () {
			HeightData = getHeightData(img,scale);
			maxHeight = getMaxHeight(HeightData);
			drawTerreno();
		}
		this.generateSkyBox();
	}

	var getMaxHeight = function(dat){
		var max = 0;
		for (var i=0; i<dat.length; i++) {
			if(max < dat[i]){
				max = dat[i];
			}
		}
		return max;
	}

	var getHeightData = function(img,scale) {
		var canvas = document.createElement( 'canvas' );
			canvas.width = img.width;
			canvas.height = img.height;
		var context = canvas.getContext( '2d' );
		var size = img.width * img.height;
		var data = new Float32Array( size );
		context.drawImage(img,0,0); 
		for (var i=0; i<size; i++) {
			data[i] = 0
		}
		var imgd = context.getImageData(0, 0, img.width, img.height);
		var pix = imgd.data;
		var j = 0;
		for (var i=0; i<pix.length; i+=4) {
			var all = pix[i]+pix[i+1]+pix[i+2];
			data[j++] = all/(12*scale);
		}
		return data;
	}

	var drawTerreno = function(){
		var textures = [];
		var s = "";
		for (var i=0; i<Placas.length; i++) {
			textures[i] = new THREE.ImageUtils.loadTexture(Placas[i][0]);
			textures[i].wrapS = textures[i].wrapT = THREE.RepeatWrapping; 
			s += "texture"+i+":	{ type: 't', value: textures["+i+"]},"
		}
		var bumpTexture = THREE.ImageUtils.loadTexture(heightmapUrl);
		bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
		var bumpScale = 200.0;
		eval("var customUniforms ={"+
			"bumpTexture:	{ type: 't', value: bumpTexture },"+
			"bumpScale:	    { type: 'f', value: bumpScale },"+s+
		"};");
		var s1 = "", s2 = "", s3 = "";
		var max = maxHeight;
		var sum = 0;
		for (var i=0; i<Placas.length; i++) {
			sum += Placas[i][1];
		}
		var m = 0;
		var ant;
		for (var i=0; i<textures.length; i++) {
			s1 += "uniform sampler2D texture"+i+";";
			ant = m;
			m += ((Placas[i][1]*max)/(sum*100));
			if(i == 0){
				s2 += "vec4 t"+i+"=(smoothstep(0.01,"+(m-d/2)+",vAmount)-smoothstep("+(m-d/2)+","+(m+d/2)+", vAmount))*texture2D( texture"+i+", vUV *"+(Placas[i][2]).toFixed(2)+");";
			}
			else if(i == textures.length-1){
				s2 += "vec4 t"+i+"=(smoothstep("+(ant-d/2)+","+(m)+", vAmount))*texture2D( texture"+i+", vUV*"+(Placas[i][2]).toFixed(2)+");"
			}
			else{
				s2 += "vec4 t"+i+"=(smoothstep("+(ant-d/2)+","+(ant+d/2)+",vAmount)-smoothstep("+(m-d/2)+","+(m+d/2)+",vAmount))*texture2D(texture"+i+",vUV*"+(Placas[i][2]).toFixed(2)+");";
			}
			s3 += "+t"+i;
		}
		var customMaterial = new THREE.ShaderMaterial({
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
			fragmentShader: s1+
				"varying vec2 vUV;"+
				"varying float vAmount;"+
				"void main(){"+s2+			
				"gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0)"+s3+";}",
		});
		var planeGeo = new THREE.PlaneGeometry( width, height, img.width-1,img.height-1);
		plane = new THREE.Mesh(	planeGeo, customMaterial );
		plane.rotation.x = -Math.PI / 2;
		plane.position.y = altura; 
		generateRustico();
		scene.add( plane );
		if(marUrl != null){
			var waterGeo = new THREE.PlaneGeometry( width, height, 1, 1 );
			var waterTex = new THREE.ImageUtils.loadTexture(marUrl);
				waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping; 
				waterTex.repeat.set(5,5);
			var waterMat = new THREE.MeshBasicMaterial( {side:THREE.DoubleSide, map: waterTex, transparent:true, opacity:0.40} );
			var water = new THREE.Mesh(	planeGeo, waterMat );
				water.rotation.x = -Math.PI / 2;
				water.position.y =altura+nivelMar;
			scene.add(water);
		}
	}

	function generateRustico(){
		var geometry = new THREE.PlaneGeometry(width,height,img.width-1,img.height-1);
		var texture = THREE.ImageUtils.loadTexture(heightmapUrl);
		var material = new THREE.MeshLambertMaterial( { map: texture } );
		planeFisico = new THREE.Mesh( geometry, material );
		for (var i=0; i<planeFisico.geometry.vertices.length; i++) {
			planeFisico.geometry.vertices[i].z = HeightData[i]*3;
		}
		planeFisico.rotation.x = -Math.PI / 2;
		planeFisico.position.y = altura+offSetY;
		planeFisico.material.side = THREE.DoubleSide;
		planeFisico.material.opacity = 0.5;
		planeFisico.material.transparent = true;
		scene.add(planeFisico);
	}
	
	this.drawRustico = function(){
		scene.add(planeFisico);
	}

	function createSphere(x,y,z,color){
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshPhongMaterial({color: color}) );
			sphere.position.x = x;
			sphere.position.y = y;
			sphere.position.z = z;
		scene.add(sphere);
	}

	function realPositionAt(i){
		var v = planeFisico.geometry.vertices[i].clone();
			v.y = planeFisico.geometry.vertices[i].z+altura+offSetY;
			v.z = -planeFisico.geometry.vertices[i].y;
		return v;
	}
	
	var getYat = function(v){
		var init = realPositionAt(0);
		var vectors = [];
		var ixf,izf,ixc,izc;
		var ix = ((v.x-init.x)*img.width)/(width);
		ixf = Math.floor(ix);
		ixc = Math.ceil(ix);
		var iz = ((v.z-init.z)*img.height)/(height);
		izf = Math.floor(iz);
		izc = Math.ceil(iz);
		if(ixf < 0){
			ixf = 0;
		}else if(ixf>=img.width-1){
			ixf = img.width-1;
		}
		if(izf < 0){
			izf = 0;
		}else if(izf > (img.height-1)){
			izf = (img.height-1);
		}
		if(ixc < 0){
			ixc = 0;
		}else if(ixc >= img.width-1){
			ixc = img.width-1;
		}
		if(izc < 0){
			izc = 0;
		}else if(izc>(img.height-1)){
			izc = (img.height-1);
		}
		var i = ixf+izf*(img.width);
		vectors[vectors.length] = realPositionAt(i);
		i = ixf+izc*(img.width);
		vectors[vectors.length] = realPositionAt(i);
		i = ixc+izf*(img.width);
		vectors[vectors.length] = realPositionAt(i);
		i = ixc+izc*(img.width);
		vectors[vectors.length] = realPositionAt(i);
		var px = (v.x-vectors[0].x)/(vectors[2].x-vectors[0].x);
		var pz = (v.z-vectors[0].z)/(vectors[1].z-vectors[0].z);
		var max = 0;
		var mi;
		var d;
		for (i=vectors.length-1; i>=0; i--){
			d = vectors[i].distanceTo(v);
			if(d > max){
				max = d;
				mi = i;
			}
		};
		var p = new THREE.Plane();
		if(px+pz < 1){
			p.setFromCoplanarPoints (vectors[0],vectors[1],vectors[2]);
		}else{
			p.setFromCoplanarPoints (vectors[1],vectors[2],vectors[3]);
		}
		var ray = new THREE.Ray (new THREE.Vector3(v.x,v.y,v.z), new THREE.Vector3(0, -1, 0));
		var where = v.clone();
		ray.intersectPlane (p,where);
		return where.y;
	}
}