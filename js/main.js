var container;
var camera, scene, renderer;
var fpv;
var prevTime;
var barrels = []; 
var balls = [];
document.threeClock = new THREE.Clock(true);
var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;

init();
animate();
function init() {
	container = document.createElement('div');
	document.body.appendChild(container);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	camera.position.z = 15;
	camera.position.y = 15;


	// Setting up cannon physics:
	world = new CANNON.World();
	//world.quatNormalizeSkip = 0;
	//world.quatNormalizeFast = false;
	
	//world.defaultContactMaterial.contactEquationStiffness = 1e9;
	//world.defaultContactMaterial.contactEquationRelaxation = 4;

	world.gravity.set(0, -18, 0);

    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                    physicsMaterial,
                                                    0.0, // friction coefficient
                                                    0.9  // restitution
                                                    );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Ground physics:
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({mass: 0, material: physicsContactMaterial});
    groundBody.addShape(groundShape);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
	world.add(groundBody);
	
	// THREE.js scene:
	scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight(0xc8a9a9, 0.08);
	scene.add(ambientLight);

	var pointLight = new THREE.PointLight(0xffffff, 0.9, 0, 2);
	camera.add(pointLight);
	scene.add(camera);
	fpv = new FirstPersonView(camera);

	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
			console.log(item, loaded, total);
	};
	var tgaLoader = new THREE.TGALoader(manager);
	var barrelTexture = tgaLoader.load('models/textures/barrel.tga');

	var loader = new THREE.OBJLoader(manager);

	// Barrels:
	var ballBody = new CANNON.Body({mass: 5, shape: ballShape, position: new CANNON.Vec3(x, y, z), material: physicsContactMaterial});
	loader.load('models/barrel.obj', function (object) {
		object.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material.map = barrelTexture;
			}
		} );
		scene.add(object);
		barrels.push(object);
		for(var i = -10; i < 10; i++) {
			for(var j = -10; j < 10; j++) {
				if(!(i == 0 && j == 0)) {
					var new_barrel = barrels[0].clone();
					new_barrel.position.x = i;
					new_barrel.position.z = j;
					scene.add(new_barrel);
					barrels.push(new_barrel);
				}
			}
		}
	});
	
	// Floor graphics:
	var textureLoader = new THREE.TextureLoader(manager);
	floorTexture = textureLoader.load('models/textures/wood.jpg');
	floorTexture.wrapS = THREE.RepeatWrapping;
	floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(16, 16);

	floorGeometry = new THREE.PlaneGeometry(320, 320, 1, 1);
	floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

	floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });

	floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.receiveShadow = true;
	scene.add(floorMesh);
	
	window.addEventListener('resize', onWindowResize, false);

	// Projectile data:
	var ballMaterial = new THREE.MeshLambertMaterial({color: 0xCCCCCC});
	var ballShape = new CANNON.Sphere(0.5);
	var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
	var shootSpeed = 10;

	// Projectile shooting:
	document.addEventListener('click', function (event) {
		if(fpv.active == true) {
			var x = camera.position.x;
			var y = camera.position.y;
			var z = camera.position.z;
			// Just in front of the camera:
			x += fpv.forward.x * (2.02*ballShape.radius);
			y += fpv.forward.y * (2.02*ballShape.radius);
			z += fpv.forward.z * (2.02*ballShape.radius);
			var ballBody = new CANNON.Body({mass: 5, shape: ballShape, position: new CANNON.Vec3(x, y, z), material: physicsContactMaterial}); // Physics object

			var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial); 
			world.add(ballBody);
			scene.add(ballMesh);  

			ballMesh.castShadow = true;
			ballMesh.receiveShadow = true;
			balls.push({mesh: ballMesh, physicsObject: ballBody});

			ballBody.velocity.set(fpv.forward.x * shootSpeed, fpv.forward.y * shootSpeed, fpv.forward.z * shootSpeed);

			ballBody.position.set(x,y,z);
			ballMesh.position.copy(ballBody.position);
		}
		else {
			document.getElementById("instructions").style.display = "none";
			document.getElementById("blocker").style.display = "none";
			fpv.activate();
		}
	}, false );

}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
var first = false;
function animate() {
	requestAnimationFrame(animate);
	var time = performance.now();
	var dt = (time - prevTime) / 1000.0;
	world.step(fixedTimeStep, dt, maxSubSteps);
	fpv.update(dt);
	for(var i = 0; i < balls.length; i++) {
		balls[i].mesh.position.copy(balls[i].physicsObject.position);
		if(!first) {
			console.log(balls[i].mesh.position);
			first = true;
		}
	}
	
	render();

	prevTime = time;
}
function render() {
	renderer.render(scene, camera);
}