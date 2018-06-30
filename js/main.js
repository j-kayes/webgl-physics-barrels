var container;
var camera, scene, renderer;
var fpv;
var prevTime;
var barrels = [];

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
	world.quatNormalizeSkip = 0;
	world.quatNormalizeFast = false;
	
	var solver = new CANNON.GSSolver();
	
	world.defaultContactMaterial.contactEquationStiffness = 1e9;
	world.defaultContactMaterial.contactEquationRelaxation = 4;
	
	solver.iterations = 7;
	solver.tolerance = 0.1;
	var split = true;
	if(split) {
		world.solver = new CANNON.SplitSolver(solver);
	}
	else {
		world.solver = solver;
	
		world.gravity.set(0, -20, 0);
		world.broadphase = new CANNON.NaiveBroadphase();
	}
	world.gravity.set(0,-20,0);
	world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                        physicsMaterial,
                                                        0.0, // friction coefficient
                                                        0.3  // restitution
                                                        );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Ground physics:
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({mass: 0});
    groundBody.addShape(groundShape);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI/2);
	world.add(groundBody);
	
	// THREE.js scene:
	scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
	scene.add(ambientLight);
	var pointLight = new THREE.PointLight(0xffffff, 0.8);
	camera.add(pointLight);
	scene.add(camera);
	fpv = new FirstPersonView(camera);
	fpv.activate();

	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
			console.log(item, loaded, total);
	};
	var tgaLoader = new THREE.TGALoader(manager);
	var barrelTexture = tgaLoader.load('models/textures/barrel.tga');

	var loader = new THREE.OBJLoader(manager);

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
	
	// Floor:
	var textureLoader = new THREE.TextureLoader(manager);
	floorTexture = textureLoader.load('models/textures/wood.jpg');

	floorGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
	floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

	floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });

	floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.receiveShadow = true;
	scene.add(floorMesh);
	
	var ballMaterial = new THREE.MeshLambertMaterial({color: 0x0000FF});
	var ballShape = new CANNON.Sphere(0.2);
	var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
	var shootDirection = new THREE.Vector3(fpv.forward);
	var shootVelo = 15;
	
	document.controlsEnabled = false;
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('click', function (event) {
		if(this.controlsEnabled==true){
			var x = sphereBody.position.x;
			var y = sphereBody.position.y;
			var z = sphereBody.position.z;
			var ballBody = new CANNON.Body({mass: 1});
			ballBody.addShape(ballShape);
			var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
			world.add(ballBody);
			scene.add(ballMesh);
			ballMesh.castShadow = true;
			ballMesh.receiveShadow = true;
			balls.push(ballBody);
			ballMeshes.push(ballMesh);
			shootDirection = fpv.forward;
			ballBody.velocity.set(  shootDirection.x * shootVelo,
									shootDirection.y * shootVelo,
									shootDirection.z * shootVelo);

			// Move the ball outside the player sphere
			x += shootDirection.x * (sphereShape.radius*1.02 + ballShape.radius);
			y += shootDirection.y * (sphereShape.radius*1.02 + ballShape.radius);
			z += shootDirection.z * (sphereShape.radius*1.02 + ballShape.radius);
			ballBody.position.set(x,y,z);
			ballMesh.position.set(x,y,z);
		}
		else {
			document.getElementById("instructions").style.display = "none";
			document.getElementById("blocker").style.display = "none";
			this.controlsEnabled = true;
		}
	}, false );

}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
	requestAnimationFrame(animate);
	var time = performance.now();
	var dt = (time - prevTime) / 1000.0;
	fpv.update(dt);
	prevTime = time;

	render();
}
function render() {
	
	renderer.render(scene, camera);
}