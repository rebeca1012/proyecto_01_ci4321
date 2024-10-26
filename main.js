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
	tankPivot.rotation.x = - Math.PI / 2; //turret starts in horizontal position
	tankPlatform.add(tankPivot)
	tankBase.add(tankPlatform);
	
	//setting position (each position will be relative to its parent in the scenegraph)
	tankPlatform.position.copy(new THREE.Vector3(0, 0.6, 0));
	tankPivot.position.copy(new THREE.Vector3(0, 0.6, 0));
	tankTurret.position.copy({x: 0, y: 0.5, z: 0});

	tankBase.pivot = tankPivot; // I want to access once the tank is made

	return tankBase;
}

//assigning tank color and base position
const tankColor = 0xbbeeff;
const tankBasePosition = new THREE.Vector3(0, 0, 0);
const tank = makeTank(tankColor, tankBasePosition);
scene.add(tank);

camera.position.z = 5;
camera.position.y = 1;

//Handling events
//Inputs by polling
const keys = {
	ArrowUp: false, //vehicle movement
	ArrowDown: false,
	ArrowLeft: false,
	ArrowRight: false,
	KeyW: false,  //turret movement
	KeyA: false,
	KeyS: false,
	KeyD: false,
	Space: false //shoot
};

//Input listener
window.addEventListener('keydown', (event) => {
	if (keys.hasOwnProperty(event.code)) {
		keys[event.code] = true;
	}
});

window.addEventListener('keyup', (event) => {
	if (keys.hasOwnProperty(event.code)) {
		keys[event.code] = false;
	}
});

//Input Handling
const tankPivot = tank.children[0].children[0];

// Create a translation matrix to move the pivot to the origin
const translationToOrigin = new THREE.Matrix4().makeTranslation(
	-tankPivot.position.x,
	-tankPivot.position.y,
	-tankPivot.position.z
);

// Create a translation matrix to move the pivot back to its original position
const translationBack = new THREE.Matrix4().makeTranslation(
    tankPivot.position.x,
	tankPivot.position.y,
	tankPivot.position.z
);

const rotationSpeed = 1;
function handleInput(deltaTime) {

	if (keys.KeyD) {
		//tankPivot.rotation.z -= rotationSpeed * deltaTime;
		//generate a rotation matrix for the pivot around its local Z axis
		
			const composedTransformation = generateRotationMatrix(new THREE.Vector3(0, 0, 1), tankPivot, - rotationSpeed * deltaTime);

			// Apply the composed transformation to the tankPivot
			tankPivot.applyMatrix4(composedTransformation);
			
		
		
	}
	else if (keys.KeyA) {
		
		//generate a rotation matrix for the pivot around its local Z axis and apply it
		tankPivot.applyMatrix4(generateRotationMatrix(new THREE.Vector3(0, 0, 1), tankPivot, rotationSpeed * deltaTime));
	
	}

	if (keys.KeyW) {

		//if (tankPivot.rotation.x < - 0.5 && tankPivot.rotation.x > - Math.PI + 1) {
		//generate a rotation matrix for the pivot around its local X axis
		const composedTransformation = generateRotationMatrix(new THREE.Vector3(1, 0, 0), tankPivot, rotationSpeed * deltaTime);

		// Apply the composed transformation to the tankPivot
		tankPivot.applyMatrix4(composedTransformation);
		//}
		//else console.log("No brother, no.");

	}
	else if (keys.KeyS) {

		//if (tankPivot.rotation.x > - Math.PI/2) {
		//generate a rotation matrix for the pivot around its local X axis and apply it
		tankPivot.applyMatrix4(generateRotationMatrix(new THREE.Vector3(1, 0, 0), tankPivot, - rotationSpeed * deltaTime));
	//}
	//	else console.log("That aint it, mate");
	}
	
	if (keys.ArrowRight) {
		tank.rotation.y += rotationSpeed * deltaTime;
	}
	else if (keys.ArrowLeft) {
		tank.rotation.y -= rotationSpeed * deltaTime;
	}

	if (keys.ArrowUp) {
		tank.position.z += 0.1 * deltaTime;
	}
	else if (keys.ArrowDown) {
		tank.position.z -= 0.1 * deltaTime;
	}

	if (keys.Space) {
		console.log("Shoot");
	}
}

function generateRotationMatrix(axis, element, angle) {
	const localAxis = axis.applyQuaternion(element.quaternion).normalize();
	const upRotation = new THREE.Matrix4().makeRotationAxis(localAxis, angle);
	//console.log("Rotation Matrix:", upRotation.elements);

	// Create a rotation matrix around the local y-axis
	return new THREE.Matrix4()
		.multiply(translationBack)
		.multiply(upRotation)
		.multiply(translationToOrigin);

}

//render and animation function
let then = 0;

function render(now) {
	now *= 0.001;  // convert time to seconds
	const deltaTime = now - then;
	then = now;

	handleInput(deltaTime);

	renderer.render( scene, camera );
	
	requestAnimationFrame(render);

}
requestAnimationFrame(render);