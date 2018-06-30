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

	var loader = new THREE.OBJLoader(manager);

	loader.load('models/barrel.obj', function (object) {
		object.traverse(function (child) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = texture;
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
	var time = performance.now();
	var dt = (time - prevTime) / 1000.0;
	fpv.update(dt);
	prevTime = time;

	render();
}
function render() {
	
	renderer.render(scene, camera);
}