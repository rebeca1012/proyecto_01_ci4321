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
const lightIntensity = 3; 
const light = new THREE.DirectionalLight(lightColor, lightIntensity);
light.position.set(5, 4, 4); //the target remains at (0, 0, 0)
scene.add(light);


//defining objects: the vehicle base
const geometry = new THREE.BoxGeometry( 2, 1, 2 );
const material = new THREE.MeshPhongMaterial( { color: 0xbbeeff } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

//render and animation function
function render(time) {
	time *= 0.001;  // convert time to seconds

	cube.rotation.y = time;

	renderer.render( scene, camera );

	requestAnimationFrame( render );
}
renderer.setAnimationLoop( render );