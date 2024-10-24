//import * as THREE from 'three';
//We import the three library for a CDN for it to work with VSCode Live Server
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

//defining scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//defining lights: directional light
const lightColor = 0xFFFFFF;
const lightIntensity = 1; 
const light = new THREE.DirectionalLight(lightColor, lightIntensity);
light.position.set(1, 4, 3); //the target remains at (0, 0, 0)
scene.add(light);

//ambient light: white light, 50% intensity
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);


//function for creating standart meshes of different colors
function makeInstance(geometry, color, pos) {
	const material = new THREE.MeshStandardMaterial({color});

	const instance = new THREE.Mesh(geometry, material);

	instance.position.copy(pos);

	return instance;
}

//function that creates a basic tank of the specified color in the specified position
function makeTank(tankColor, tankBasePosition){
	//creating a rectangular tank base
	const baseGeometry = new THREE.BoxGeometry( 2, 1, 2);
	//creating a platform on top for more turret range of movement
	const platformGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.6, 16);
	//creating a sphere for the turret base
	const tankPivotGeometry = new THREE.SphereGeometry(0.75,32,16);
	//creating cilinder for the turret
	const turretGeometry = new THREE.CylinderGeometry(0.18, 0.18, 1.3, 16);

	//creating respective meshes
	const tankBase = makeInstance(baseGeometry, tankColor, tankBasePosition);
	const tankPlatform = makeInstance(platformGeometry, tankColor, {x:0, y:0, z:0});
	const tankPivot = makeInstance(tankPivotGeometry, tankColor, {x:0, y:0, z:0});
	const tankTurret = makeInstance(turretGeometry,tankColor, {x: 0, y: 0, z: 0});

	// putting the scenegraph (tree) together
	tankPivot.add(tankTurret);
	tankPivot.rotation.x = Math.PI / 2; //turret starts in horizontal position
	tankPlatform.add(tankPivot)
	tankBase.add(tankPlatform);
	
	//setting position (each position will be relative to its parent in the scenegraph)
	tankPlatform.position.copy(new THREE.Vector3(0, 0.6, 0));
	tankPivot.position.copy(new THREE.Vector3(0, 0.6, 0));
	tankTurret.position.copy({x: 0, y: 0.5, z: 0});

	return tankBase;

}

//assigning tank color and base position
const tankColor = 0xbbeeff;
const tankBasePosition = new THREE.Vector3(0, 0, 1);
const tank = makeTank(tankColor, tankBasePosition);
scene.add(tank);

const tanks =[
	makeTank(0x44aa88, {x: -3.5, y: 0.5, z: -3}),
	makeTank(0x8844aa, {x: 3.5, y: 0.5, z: -3})
]

for (let i = 0; i < tanks.length; i++) {
	scene.add(tanks[i]);
}
/*
const material = new THREE.MeshPhongMaterial( { color: 0xbbeeff } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
*/
camera.position.z = 5;
camera.position.y = 1;

//render and animation function
function render(time) {
	time *= 0.001;  // convert time to seconds

	tank.rotation.y = time;

	renderer.render( scene, camera );

	requestAnimationFrame( render );
}
requestAnimationFrame(render);