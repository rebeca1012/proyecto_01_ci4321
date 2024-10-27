//import * as THREE from 'three';
//We import the three library for a CDN for it to work with VSCode Live Server
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { addFloor } from './floor';
import { addSky } from './sky'
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

// Function to create obstacle boxes
function createObstacleBox(position, size) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Front face
      -size.x/2, -size.y/2,  size.z/2,
       size.x/2, -size.y/2,  size.z/2,
       size.x/2,  size.y/2,  size.z/2,
      -size.x/2,  size.y/2,  size.z/2,
      // Back face
      -size.x/2, -size.y/2, -size.z/2,
      -size.x/2,  size.y/2, -size.z/2,
       size.x/2,  size.y/2, -size.z/2,
       size.x/2, -size.y/2, -size.z/2,
      // Top face
      -size.x/2,  size.y/2, -size.z/2,
      -size.x/2,  size.y/2,  size.z/2,
       size.x/2,  size.y/2,  size.z/2,
       size.x/2,  size.y/2, -size.z/2,
      // Bottom face
      -size.x/2, -size.y/2, -size.z/2,
       size.x/2, -size.y/2, -size.z/2,
       size.x/2, -size.y/2,  size.z/2,
      -size.x/2, -size.y/2,  size.z/2,
      // Right face
       size.x/2, -size.y/2, -size.z/2,
       size.x/2,  size.y/2, -size.z/2,
       size.x/2,  size.y/2,  size.z/2,
       size.x/2, -size.y/2,  size.z/2,
      // Left face
      -size.x/2, -size.y/2, -size.z/2,
      -size.x/2, -size.y/2,  size.z/2,
      -size.x/2,  size.y/2,  size.z/2,
      -size.x/2,  size.y/2, -size.z/2
    ]);
  
    const indices = new Uint16Array([
      0,  1,  2,  0,  2,  3,  // front
      4,  5,  6,  4,  6,  7,  // back
      8,  9,  10, 8,  10, 11, // top
      12, 13, 14, 12, 14, 15, // bottom
      16, 17, 18, 16, 18, 19, // right
      20, 21, 22, 20, 22, 23  // left
    ]);
  
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
  
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('../static/wood.png');
    const material = new THREE.MeshStandardMaterial({ map: woodTexture });
    const box = new THREE.Mesh(geometry, material);
    box.position.copy(position);
    return box;
  }

// Function to create circular target
function createCircularTarget(position, radius, depth) {
    const group = new THREE.Group();
    
    // Create rings
    const ringColors = [0xff0000, 0xffffff, 0xff0000, 0xffffff, 0xff0000];
    const ringRadii = [radius, radius * 0.8, radius * 0.6, radius * 0.4, radius * 0.2];
    
    for (let i = 0; i < ringRadii.length; i++) {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      const segments = 32;
  
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const innerRadius = ringRadii[i] * 0.8;
        const outerRadius = ringRadii[i];
  
        vertices.push(
          Math.cos(theta) * innerRadius, Math.sin(theta) * innerRadius, depth / 2 + 0.001,
          Math.cos(theta) * outerRadius, Math.sin(theta) * outerRadius, depth / 2 + 0.001
        );
  
        if (j < segments) {
          const base = j * 2;
          indices.push(
            base, base + 1, base + 2,
            base + 1, base + 3, base + 2
          );
        }
      }
  
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
  
      const material = new THREE.MeshStandardMaterial({ color: ringColors[i], side: THREE.DoubleSide });
      const ring = new THREE.Mesh(geometry, material);
      group.add(ring);
    }
  
    // Create back of the target
    const backGeometry = new THREE.BufferGeometry();
    const backVertices = [];
    const backIndices = [];
    const segments = 32;
  
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      backVertices.push(
        Math.cos(theta) * radius, Math.sin(theta) * radius, 0,
        Math.cos(theta) * radius, Math.sin(theta) * radius, depth
      );
  
      if (i < segments) {
        const base = i * 2;
        backIndices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
      }
    }
  
    backGeometry.setAttribute('position', new THREE.Float32BufferAttribute(backVertices, 3));
    backGeometry.setIndex(backIndices);
    backGeometry.computeVertexNormals();
  
    const backMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    group.add(back);
  
    group.position.copy(position);
    return group;
  }
  

//assigning tank color and base position
const tankColor = 0xbbeeff;
const tankBasePosition = new THREE.Vector3(0, 0, 0);
const tank = makeTank(tankColor, tankBasePosition);
scene.add(tank);


// create and add obstacles
const obstacle1 = createObstacleBox(new THREE.Vector3(3, 0., 0), new THREE.Vector3(1.0, 1.0, 1.0));
const obstacle2 = createObstacleBox(new THREE.Vector3(-3, 0, 0), new THREE.Vector3(1.0, 1.0, 1.0));
const obstacle3 = createObstacleBox(new THREE.Vector3(0, 0, -4), new THREE.Vector3(2.0, 1.0, 1.0));

scene.add(obstacle1);
scene.add(obstacle2);
scene.add(obstacle3);

// Creating and adding circular targets
const target1 = createCircularTarget(new THREE.Vector3(4, 2, -3), 0.5, 0.1);
const target2 = createCircularTarget(new THREE.Vector3(-4, 4, -3), 0.5, 0.1);

scene.add(target1);
scene.add(target2);

// Add the floor to the scene
addFloor(scene);
addSky(scene, renderer, camera);

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

const rotationSpeed = 1;
const movementSpeed = 1;
function handleInput(deltaTime) {

	if (keys.KeyD) {

		//generate a rotation matrix for the pivot around the parents' Y axis
		
			const composedTransformation = generateRotationMatrix(new THREE.Vector3(0, 1, 0), tankPivot, - rotationSpeed * deltaTime, false);

			// Apply the composed transformation to the tankPivot
			tankPivot.applyMatrix4(composedTransformation);
		
	}
	else if (keys.KeyA) {
		//generate a rotation matrix for the pivot around the parents' Y axis
		tankPivot.applyMatrix4(generateRotationMatrix(new THREE.Vector3(0, 1, 0), tankPivot, rotationSpeed * deltaTime, false));
	
	}

	if (keys.KeyW) {
		const pivotYAxis = new THREE.Vector3();

		// Get the direction of its local Y axis to apply bounds to it
		tankPivot.matrixWorld.extractBasis(new THREE.Vector3(), pivotYAxis, new THREE.Vector3());
		if (pivotYAxis.y < 0.7) {

		//generate a rotation matrix for the pivot around its local X axis
		const composedTransformation = generateRotationMatrix(new THREE.Vector3(1, 0, 0), tankPivot, rotationSpeed * deltaTime, true);

		// Apply the composed transformation to the tankPivot
		tankPivot.applyMatrix4(composedTransformation);
		}
		else console.log("You're trying to go too high!");

	}
	else if (keys.KeyS) {
		const pivotYAxis = new THREE.Vector3();

		// Get the direction of its local Y axis
		tankPivot.matrixWorld.extractBasis(new THREE.Vector3(), pivotYAxis, new THREE.Vector3());
		if (pivotYAxis.y >= -0.05) {

		//generate a rotation matrix for the pivot around its local X axis and apply it
		tankPivot.applyMatrix4(generateRotationMatrix(new THREE.Vector3(1, 0, 0), tankPivot, - rotationSpeed * deltaTime, true));
		}	else console.log("You are trying to go too low!");
	}
	
	if (keys.ArrowRight) {
		//generate a rotation matrix for the tank around the around its Y axis
		const composedTransformation = generateRotationMatrix(new THREE.Vector3(0, 1, 0), tank, - rotationSpeed * deltaTime, true);
		//apply the rotation 
		tank.applyMatrix4(composedTransformation);

	}
	else if (keys.ArrowLeft) {
		//generate a rotation matrix for the tank around the around its Y axis and apply it
		tank.applyMatrix4(generateRotationMatrix(new THREE.Vector3(0, 1, 0), tank, rotationSpeed * deltaTime, true));
	}

	if (keys.ArrowUp) {
		//tank.position.z += 0.1 * deltaTime;
		tank.applyMatrix4(generateTranslationMatrix(new THREE.Vector3(0, 0, 1), tank, - movementSpeed * deltaTime, true));
	}
	else if (keys.ArrowDown) {
		//tank.position.z -= 0.1 * deltaTime;
		tank.applyMatrix4(generateTranslationMatrix(new THREE.Vector3(0, 0, 1), tank, movementSpeed * deltaTime, true));
	}

	if (keys.Space) {
		console.log("Shoot");
	}
}

function generateRotationMatrix(axis, element, angle, localRotation) {

	if (localRotation) {
		//applying the quaternion to the axis of rotation (global) returns the axis of the element
		axis = axis.applyQuaternion(element.quaternion).normalize();
	} 

	// Create a translation matrix to move the element to the origin before applying rotation
	const translationToOrigin = new THREE.Matrix4().makeTranslation(
		-element.position.x,
		-element.position.y,
		-element.position.z
	)
	// Create a translation matrix to move the element back to its original position after rotating
	const translationBack = new THREE.Matrix4().makeTranslation(
		element.position.x,
		element.position.y,
		element.position.z
	)
	// Generates the rotation matrix
	const rotation = new THREE.Matrix4().makeRotationAxis(axis, angle);
	//console.log("Rotation Matrix:", rotation.elements);

	// Composes everything to return the rotation (+ translation) matrix to use
	return new THREE.Matrix4()
		.multiply(translationBack)
		.multiply(rotation)
		.multiply(translationToOrigin);

}

function generateTranslationMatrix(direction, element, distance, localCoordinates) {

	if (localCoordinates) {
		direction = direction.applyQuaternion(element.quaternion).normalize();
	}
	const translation = new THREE.Matrix4().makeTranslation(distance * direction.x, distance * direction.y, distance * direction.z);
	//console.log("translation Matrix:", translation.elements);

	// Create a rotation matrix around the local y-axis
	return new THREE.Matrix4()
		.multiply(translation)
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