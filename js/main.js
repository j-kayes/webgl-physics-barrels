var container;
var camera, scene, renderer;

init();
animate();

function init() {
	container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	camera.position.z = 15;
	camera.position.y = 15;
	
	
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
	var textureLoader = new THREE.TGALoader(manager);
	var texture = textureLoader.load('models/textures/barrel.tga');

	var onProgress = function (xhr) {
	if (xhr.lengthComputable) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log(Math.round(percentComplete, 2) + '% downloaded');
	}
	};
	var onError = function (xhr) {
	};
	var loader = new THREE.OBJLoader(manager);
	loader.load('models/barrel.obj', function (object) {
		object.traverse(function (child) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
			}
		} );
		scene.add(object);
		camera.lookAt(object.position);
	}, onProgress, onError);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
	requestAnimationFrame(animate);
	render();
}
function render() {
	
	renderer.render(scene, camera);
}