const width = window.innerWidth;
const height = window.innerHeight;

let scene = new THREE.Scene();
scene.rotateX(-Math.PI / 3);
scene.rotateZ(Math.PI / 4);

const boxSize = 2.5;
const aspect = width / height;
camera = new THREE.OrthographicCamera(
  -aspect * 2,
  aspect * 2,
  boxSize,
  -boxSize / 1.6,
  -500,
  1000
);
camera.zoom = 1.5;
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setClearColor(0xbbdefb);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// var axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const light1 = new THREE.PointLight(0xffffff);
light1.position.set(5, 5, 5);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff);
light2.position.set(-5, -5, -5);
scene.add(light2);

//Base Cube with max height to depict a stack

let geometry = new THREE.BoxBufferGeometry(0.6, 0.6, 0.5);
let material = new THREE.MeshToonMaterial({
  color: 0xf0000f,
});
let baseCube = new THREE.Mesh(geometry, material);
baseCube.position.set(0, 0, -0.2);
scene.add(baseCube);

//cubes array to store the reference to the boxes stacked
let cubes = [];
cubes.push(baseCube);

let Z_HEIGHT = 0.1; //position of the first block that will be incremented for every block
let DEL_Z = 0.1;
let moving_block_position = -1;
let delta_position = 0.01;

let movingCubeGeometry = new THREE.BoxBufferGeometry(0.6, 0.6, 0.1);
let movingCubeMaterial = new THREE.MeshToonMaterial({
  color: 0x454545,
});
let movingCube = new THREE.Mesh(movingCubeGeometry, movingCubeMaterial);
movingCube.position.set(0, 0, Z_HEIGHT);
scene.add(movingCube);

let PLAY = true; //Flag for animation of cubes and gameplay
let prev_width = 0.6,
  current_block_width = 0.6;
let prev_length = 0.6,
  current_block_length = 0.6;
let prev_center = {
  x: 0,
  y: 0,
};
const Axes = {
  X: "x-axis",
  Y: "y-axis",
};
let currentAxisOfMotion = Axes.X;

const updateCamera = () => {
  camera.bottom += 0.1;
  camera.top += 0.1;
  camera.updateProjectionMatrix();
};

let SCORE = 0;
const updateScore = () => {
  SCORE++;
  document.querySelector("#info").innerHTML = `Score: ${SCORE}`;
};

const initializeGame = () => {
  document.querySelector("#info").innerHTML = `Score: 0`;
  document.querySelector("#gameOver").style.display = "none";
  Z_HEIGHT = 0.1;
  movingCube.geometry = movingCubeGeometry;
  movingCube.position.set(0, 0, Z_HEIGHT);
  for (let x = 1; x < cubes.length; x++) {
    scene.remove(cubes[x]);
  }
  (prev_width = 0.6), (current_block_width = 0.6);
  (prev_length = 0.6), (current_block_length = 0.6);
  prev_center = {
    x: 0,
    y: 0,
  };
  currentAxisOfMotion = Axes.X;
  cubes = [cubes[0], cubes[1]];
  newColor();
  SCORE = 0;
  camera.left = -aspect * 2;
  camera.right = aspect * 2;
  camera.top = boxSize;
  camera.bottom = -boxSize / 1.6;
  camera.updateProjectionMatrix();
  PLAY = true;
};

const gameOver = () => {
  PLAY = false;
  document.querySelector("#gameOver").style.display = "block";
};

const newColor = (function () {
  let r = 0,
    g = 0,
    b = 0;

  return function () {
    if (PLAY) {
      if (r < 1) r += 0.1;
      else if (g < 1) g += 0.1;
      else b += 0.1;
    } else {
      r = g = b = 0;
    }
    return {
      r,
      g,
      b,
    };
  };
})();

const produceNewBlock = (newWidth, newLength) => {
  let newGeometry = new THREE.BoxBufferGeometry(newWidth, newLength, 0.1);
  let {
    r,
    g,
    b
  } = newColor();
  let color = new THREE.Color(r, g, b);
  let newMat = new THREE.MeshToonMaterial({
    color: color,
  });
  let newCube = new THREE.Mesh(newGeometry, newMat);
  cubes.push(newCube);
  return newCube;
};

function instantiateBlockOnXAxis() {
  let captured_x_pos = movingCube.position.x;
  if (
    captured_x_pos <= prev_center.x + prev_width / 2 &&
    captured_x_pos >= prev_center.x - prev_width / 2
  ) {
    current_block_width = prev_width - Math.abs(prev_center.x - captured_x_pos);
    prev_center.x = (prev_center.x + captured_x_pos) / 2;

    let newCube = produceNewBlock(current_block_width, current_block_length);

    newCube.position.set(prev_center.x, prev_center.y, Z_HEIGHT);
    scene.add(newCube);

    Z_HEIGHT += DEL_Z;
    prev_width = current_block_width;
    moving_block_position = -1;
    movingCube.position.set(prev_center.x, moving_block_position, Z_HEIGHT);
    movingCube.geometry = newCube.geometry;
    movingCube.material.setValues({
      color: 0x454545,
    });
    updateCamera();
    updateScore();
  } else {
    gameOver();
  }
}

function instantiateBlockOnYAxis() {
  let captured_y_pos = movingCube.position.y;
  if (
    captured_y_pos <= prev_center.y + prev_length / 2 &&
    captured_y_pos >= prev_center.y - prev_length / 2
  ) {
    current_block_length =
      prev_length - Math.abs(prev_center.y - captured_y_pos);
    prev_center.y = (prev_center.y + captured_y_pos) / 2;

    let newCube = produceNewBlock(current_block_width, current_block_length);

    newCube.position.set(prev_center.x, prev_center.y, Z_HEIGHT);
    scene.add(newCube);

    Z_HEIGHT += DEL_Z;
    prev_length = current_block_length;
    moving_block_position = -1;
    movingCube.position.set(-1, prev_center.y, Z_HEIGHT);
    movingCube.geometry = newCube.geometry;
    movingCube.material.setValues({
      color: 0x454545,
    });
    updateCamera();
    updateScore();
  } else {
    gameOver();
  }
}

const eventHelperFunc = () => {
  if (currentAxisOfMotion === "x-axis") {
    instantiateBlockOnXAxis();
  }
  if (currentAxisOfMotion === "y-axis") {
    instantiateBlockOnYAxis();
  }
  if (currentAxisOfMotion === Axes.X) currentAxisOfMotion = Axes.Y;
  else currentAxisOfMotion = Axes.X;
};

document.body.addEventListener("click", (e) => {
  if (PLAY) {
    eventHelperFunc();
  } else {
    initializeGame();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.keyCode == 32) {
    if (PLAY) {
      eventHelperFunc();
    } else {
      initializeGame();
    }
  }
});

function animate() {
  renderer.render(scene, camera);
  if (PLAY) {
    if (currentAxisOfMotion === "x-axis") {
      movingCube.position.x = moving_block_position;
    }
    if (currentAxisOfMotion === "y-axis") {
      movingCube.position.y = moving_block_position;
    }
    moving_block_position += delta_position;
    if (moving_block_position > 1 || moving_block_position < -1)
      delta_position *= -1;
  }
  requestAnimationFrame(animate);
}

animate();