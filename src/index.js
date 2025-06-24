import * as THREE from "three";
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  LinearSRGBColorSpace,
  ACESFilmicToneMapping,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Raycaster, Vector2, Vector3 } from "three";
import planetsData from "./data/planetData";
import { Sun } from "./sun";
import { Earth } from "./earth";
import { Planet } from "./planet";
import { Starfield } from "./starfield";

const raycaster = new Raycaster();
const mouse = new Vector2();
let planetMeshes = [];
const planets = [
  {
    orbitSpeed: 0.00048,
    orbitRadius: 10,
    orbitRotationDirection: "clockwise",
    planetSize: 0.2,
    planetRotationSpeed: 0.005,
    planetRotationDirection: "counterclockwise",
    planetTexture: "/solar-system-threejs/assets/mercury-map.jpg",
    rimHex: 0xf9cf9f,
  },
  {
    orbitSpeed: 0.00035,
    orbitRadius: 13,
    orbitRotationDirection: "clockwise",
    planetSize: 0.5,
    planetRotationSpeed: 0.0005,
    planetRotationDirection: "clockwise",
    planetTexture: "/solar-system-threejs/assets/venus-map.jpg",
    rimHex: 0xb66f1f,
  },
  {
    orbitSpeed: 0.00024,
    orbitRadius: 19,
    orbitRotationDirection: "clockwise",
    planetSize: 0.3,
    planetRotationSpeed: 0.01,
    planetRotationDirection: "counterclockwise",
    planetTexture: "/solar-system-threejs/assets/mars-map.jpg",
    rimHex: 0xbc6434,
  },
  {
    orbitSpeed: 0.00013,
    orbitRadius: 22,
    orbitRotationDirection: "clockwise",
    planetSize: 1,
    planetRotationSpeed: 0.06,
    planetRotationDirection: "counterclockwise",
    planetTexture: "/solar-system-threejs/assets/jupiter-map.jpg",
    rimHex: 0xf3d6b6,
  },
  {
    orbitSpeed: 0.0001,
    orbitRadius: 25,
    orbitRotationDirection: "clockwise",
    planetSize: 0.8,
    planetRotationSpeed: 0.05,
    planetRotationDirection: "counterclockwise",
    planetTexture: "/solar-system-threejs/assets/saturn-map.jpg",
    rimHex: 0xd6b892,
    rings: {
      ringsSize: 0.5,
      ringsTexture: "/solar-system-threejs/assets/saturn-rings.jpg",
    },
  },
  {
    orbitSpeed: 0.00007,
    orbitRadius: 28,
    orbitRotationDirection: "clockwise",
    planetSize: 0.5,
    planetRotationSpeed: 0.02,
    planetRotationDirection: "clockwise",
    planetTexture: "/solar-system-threejs/assets/uranus-map.jpg",
    rimHex: 0x9ab6c2,
    rings: {
      ringsSize: 0.4,
      ringsTexture: "/solar-system-threejs/assets/uranus-rings.jpg",
    },
  },
  {
    orbitSpeed: 0.000054,
    orbitRadius: 31,
    orbitRotationDirection: "clockwise",
    planetSize: 0.5,
    planetRotationSpeed: 0.02,
    planetRotationDirection: "counterclockwise",
    planetTexture: "/solar-system-threejs/assets/neptune-map.jpg",
    rimHex: 0x5c7ed7,
  },
];

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new Scene();
const camera = new PerspectiveCamera(75, w / h, 0.1, 100);
const renderer = new WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);

controls.minDistance = 10;
controls.maxDistance = 60;
camera.position.set(30 * Math.cos(Math.PI / 6), 30 * Math.sin(Math.PI / 6), 40);

renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputColorSpace = LinearSRGBColorSpace;
document.body.appendChild(renderer.domElement);

const sun = new Sun().getSun();
scene.add(sun);

const earth = new Earth({
  orbitSpeed: 0.00029,
  orbitRadius: 16,
  orbitRotationDirection: "clockwise",
  planetSize: 0.5,
  planetAngle: (-23.4 * Math.PI) / 180,
  planetRotationSpeed: 0.01,
  planetRotationDirection: "counterclockwise",
  planetTexture: "/solar-system-threejs/assets/earth-map-1.jpg",
}).getPlanet();
earth.userData.planetId = "earth";
scene.add(earth);
planetMeshes.push(earth);

const starfield = new Starfield().getStarfield();
scene.add(starfield);

planets.forEach((item, idx) => {
  const planet = new Planet(item).getPlanet();
  planet.userData.planetId = planetsData[idx].id;
  scene.add(planet);
  planetMeshes.push(planet);
});

// === ASTEROID BELT ===
const asteroidGroup = new THREE.Group();
asteroidGroup.clear && asteroidGroup.clear();
while (asteroidGroup.children && asteroidGroup.children.length > 0) asteroidGroup.remove(asteroidGroup.children[0]);
const asteroidCount = 150;
const asteroidInnerRadius = 12; // gần mặt trời
const asteroidOuterRadius = 50; // xa nhất
for (let i = 0; i < asteroidCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = asteroidInnerRadius + Math.random() * (asteroidOuterRadius - asteroidInnerRadius);
  const y = (Math.random() - 0.5) * 5; // Độ lệch lên/xuống lớn hơn
  const geo = new THREE.SphereGeometry(0.07 + Math.random() * 0.08, 6, 6);
  const mat = new THREE.MeshStandardMaterial({ color: '#f5f3f1', roughness: 0.7, metalness: 0.2 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius
  );
  mesh.userData = {
    angle,
    radius,
    speed: 0.0005 + Math.random() * 0.0007
  };
  asteroidGroup.add(mesh);
}
scene.add(asteroidGroup);

// === COMET/FLASH EFFECT (bay thẳng xuyên qua không gian) ===
const cometGroup = new THREE.Group();
const cometCount = 8;
const cometParams = [];
function randomCometParams() {
  // Xuất phát ngoài rìa không gian, hướng về trung tâm
  const angle = Math.random() * Math.PI * 2;
  const radius = 60 + Math.random() * 10;
  const y = (Math.random() - 0.5) * 20;
  const start = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  const center = new THREE.Vector3(0, 0, 0);
  // Hướng bay lệch nhẹ qua trung tâm
  const target = center.clone().add(new THREE.Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10));
  const direction = target.clone().sub(start).normalize();
  const speed = 0.6 + Math.random() * 0.4;
  return { start, direction, speed, t: 0 };
}
for (let i = 0; i < cometCount; i++) {
  // Sphere head
  const geo = new THREE.SphereGeometry(0.22, 12, 12);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0x99ccff, emissiveIntensity: 1, transparent: true, opacity: 0.98 });
  const head = new THREE.Mesh(geo, mat);
  // Tail (Line, mờ dần)
  const tailLen = 8;
  const tailPoints = [];
  for (let j = 0; j <= 20; j++) {
    tailPoints.push(new THREE.Vector3(-j * tailLen / 20, 0, 0));
  }
  const tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
  const tailColors = [];
  for (let j = 0; j <= 20; j++) {
    tailColors.push(0.6, 0.8, 1, 1 - j / 20); 
  }
  tailGeo.setAttribute('color', new THREE.Float32BufferAttribute(tailColors, 4));
  const tailMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1 });
  const tail = new THREE.Line(tailGeo, tailMat);
  head.add(tail);
  cometGroup.add(head);
  cometParams.push({ mesh: head, ...randomCometParams() });
}
scene.add(cometGroup);

// Thêm ánh sáng điểm tại tâm
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Màu sắc, cường độ, khoảng cách tối đa
pointLight.position.set(0, 0, 0); // Đặt tại tâm
pointLight.castShadow = true; // Bật đổ bóng nếu cần
scene.add(pointLight);

// Cấu hình ánh sáng điểm
pointLight.shadow.mapSize.width = 512; // Kích thước bản đồ đổ bóng
pointLight.shadow.mapSize.height = 512;
pointLight.shadow.camera.near = 0.5; // Gần nhất
pointLight.shadow.camera.far = 50; // Xa nhất

// Thêm ánh sáng hướng
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true; 
scene.add(directionalLight);

// Thêm ánh sáng môi trường
// const ambientLight = new THREE.AmbientLight(0x404040);
// scene.add(ambientLight);

// Cấu hình renderer để hỗ trợ đổ bóng
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.render(scene, camera);

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});


// Thêm đoạn code này sau phần lighting chính để tạo hiệu ứng đặc biệt:

// Tạo hiệu ứng ánh sáng mặt trời với corona/glow
const sunGlowGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunGlowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    c: { type: "f", value: 0.8 },
    p: { type: "f", value: 1.4 }
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float c;
    uniform float p;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
      gl_FragColor = vec4(1.0, 0.8, 0.3, 1.0) * intensity * 0.3;
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
scene.add(sunGlow);

// Hàm để tạo hiệu ứng terminator line (đường ranh giới sáng-tối) cho các hành tinh
function createTerminatorEffect() {
  planetMeshes.forEach(mesh => {
    mesh.traverse(obj => {
      if (obj.isMesh && obj.material && obj.material.map) {
        // Thêm shader để tạo hiệu ứng terminator line
        const originalMaterial = obj.material;
        
        obj.material = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: originalMaterial.map },
            sunPosition: { value: new THREE.Vector3(0, 0, 0) },
            planetPosition: { value: new THREE.Vector3() }
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vUv = uv;
              vNormal = normalize(normalMatrix * normal);
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D map;
            uniform vec3 sunPosition;
            uniform vec3 planetPosition;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            
            void main() {
              vec3 lightDirection = normalize(sunPosition - vWorldPosition);
              float lightIntensity = max(0.0, dot(vNormal, lightDirection));
              
              // Tạo hiệu ứng terminator line mềm mại
              float terminator = smoothstep(-0.1, 0.1, lightIntensity);
              
              vec4 textureColor = texture2D(map, vUv);
              
              // Phần sáng
              vec3 dayColor = textureColor.rgb * terminator * 1.2;
              
              // Phần tối với một chút ánh sáng phản xạ
              vec3 nightColor = textureColor.rgb * 0.05 * (1.0 - terminator);
              
              gl_FragColor = vec4(dayColor + nightColor, textureColor.a);
            }
          `
        });
        
        // Cập nhật uniform trong animation loop
        const animate = () => {
          if (obj.material.uniforms && obj.material.uniforms.planetPosition) {
            obj.getWorldPosition(obj.material.uniforms.planetPosition.value);
          }
        };
        
        // Lưu hàm animate để gọi trong loop chính
        obj.userData.updateShader = animate;
      }
    });
  });
}

createTerminatorEffect();


// Khôi phục hàm animate cũ:
const oldAnimate = animate;
function animate() {
  requestAnimationFrame(animate);
  // Quay asteroid quanh mặt trời
  asteroidGroup.children.forEach(mesh => {
    mesh.userData.angle += mesh.userData.speed;
    mesh.position.x = Math.cos(mesh.userData.angle) * mesh.userData.radius;
    mesh.position.z = Math.sin(mesh.userData.angle) * mesh.userData.radius;
  });
  // Comet
  cometParams.forEach(param => {
    param.t += param.speed * 0.01;
    const pos = param.start.clone().add(param.direction.clone().multiplyScalar(param.t));
    param.mesh.position.copy(pos);
    // Hướng đầu comet theo hướng bay
    param.mesh.lookAt(pos.clone().add(param.direction));
    // Nếu ra khỏi vùng nhìn thấy (bán kính > 70), reset lại
    if (pos.length() > 70) {
      Object.assign(param, randomCometParams());
    }
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();

renderer.domElement.addEventListener("pointerdown", onPointerDown, false);

const clickSound = new Audio('/solar-system-threejs/assets/click.mp3');

let selectedPlanet = null;
let orbitLines = [];

function clearPlanetEffect() {
  if (selectedPlanet) {
    // Reset scale
    selectedPlanet.scale.set(1, 1, 1);
    // Xóa các orbitLines
    orbitLines.forEach(line => scene.remove(line));
    orbitLines = [];
    selectedPlanet = null;
  }
}

function addPlanetEffect(planetGroup) {
  // Scale up
  planetGroup.scale.set(1.35, 1.35, 1.35);
  // Vẽ nhiều đường orbit động quanh hành tinh
  const pos = new THREE.Vector3();
  planetGroup.getWorldPosition(pos);
  for (let i = 0; i < 5; i++) {
    const radius = 1.5 + i * 0.18;
    const curve = new THREE.EllipseCurve(
      pos.x, pos.z, radius, radius * (0.95 + Math.random() * 0.1), 0, 2 * Math.PI, false, 0
    );
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, pos.y + (Math.random()-0.5)*0.2, p.y)));
    const material = new THREE.LineBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.5 + Math.random()*0.3 });
    const ellipse = new THREE.Line(geometry, material);
    orbitLines.push(ellipse);
    scene.add(ellipse);
  }
}

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Kiểm tra va chạm với các hành tinh
  const intersects = raycaster.intersectObjects(planetMeshes, true);

  clearPlanetEffect();

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData.planetId) {
      obj = obj.parent;
    }
    let planetId = obj ? obj.userData.planetId : null;
    if (planetId) {
      showPlanetInfo(planetId);
      // Hiệu ứng hành tinh
      selectedPlanet = obj.parent; // planetGroup
      addPlanetEffect(selectedPlanet);
    }
  }
}

let comparePlanets = [];

function showPlanetInfo(planetId) {
  const infoDiv = document.getElementById("planet-info");
  const planet = planetsData.find(p => p.id === planetId);
  if (planet) {
    infoDiv.innerHTML = `
      <h2>${planet.name}</h2>
      <img src="${planet.image}" alt="${planet.name}" style="width:100px;display:block;margin:auto;">
      <p>${planet.description}</p>
      <ul>
        <li>Kích thước: ${planet.size}</li>
        <li>Số vệ tinh: ${planet.moons}</li>
        <li>Khoảng cách tới Mặt Trời: ${planet.distanceFromSun}</li>
        <li>Chu kỳ quỹ đạo: ${planet.orbitalPeriod}</li>
        <li>Khối lượng: ${planet.mass ? planet.mass.toExponential(2) + ' kg' : 'N/A'}</li>
      </ul>
      <button onclick="document.getElementById('planet-info').style.display='none'">Đóng</button>
      <button id="compare-btn">So sánh</button>
      <button id="focus-btn">Xem gần</button>
    `;
    infoDiv.style.display = "block";
    setTimeout(() => {
      const compareBtn = document.getElementById("compare-btn");
      if (compareBtn) {
        compareBtn.onclick = () => handleComparePlanet(planetId);
      }
      const focusBtn = document.getElementById("focus-btn");
      if (focusBtn) {
        focusBtn.onclick = () => focusOnPlanet(planetId);
      }
    }, 0);
  }
}

function handleComparePlanet(planetId) {
  if (!comparePlanets.includes(planetId)) {
    comparePlanets.push(planetId);
  }
  if (comparePlanets.length > 2) {
    comparePlanets.shift();
  }
  if (comparePlanets.length === 2) {
    showComparePopup(comparePlanets[0], comparePlanets[1]);
  } else {
    alert('Chọn thêm 1 hành tinh nữa để so sánh!');
  }
}

function showComparePopup(id1, id2) {
  const compareDiv = document.getElementById("planet-compare");
  const p1 = planetsData.find(p => p.id === id1);
  const p2 = planetsData.find(p => p.id === id2);
  if (!p1 || !p2) return;
  compareDiv.innerHTML = `
    <h2>So sánh hành tinh</h2>
    <table style="width:100%;color:#fff;text-align:center;">
      <tr><th></th><th>${p1.name}</th><th>${p2.name}</th></tr>
      <tr><td>Hình ảnh</td><td><img src='${p1.image}' style='width:60px;'></td><td><img src='${p2.image}' style='width:60px;'></td></tr>
      <tr><td>Kích thước</td><td>${p1.size}</td><td>${p2.size}</td></tr>
      <tr><td>Số vệ tinh</td><td>${p1.moons}</td><td>${p2.moons}</td></tr>
      <tr><td>Khoảng cách tới Mặt Trời</td><td>${p1.distanceFromSun}</td><td>${p2.distanceFromSun}</td></tr>
      <tr><td>Chu kỳ quỹ đạo</td><td>${p1.orbitalPeriod}</td><td>${p2.orbitalPeriod}</td></tr>
      <tr><td>Khối lượng</td><td>${p1.mass ? p1.mass.toExponential(2) + ' kg' : 'N/A'}</td><td>${p2.mass ? p2.mass.toExponential(2) + ' kg' : 'N/A'}</td></tr>
    </table>
    <button onclick="document.getElementById('planet-compare').style.display='none'">Đóng</button>
  `;
  compareDiv.style.display = "block";
}

// Chức năng xem cận cảnh
let isPlanetFocused = false;
let prevVisibleObjects = [];

function focusOnPlanet(planetId) {
  // Tìm đúng planetMesh dựa vào planetId
  let mesh = null;
  for (let i = 0; i < planetMeshes.length; i++) {
    if (planetMeshes[i].userData.planetId === planetId) {
      mesh = planetMeshes[i];
      break;
    }
  }
  if (!mesh) return;

  // Tìm mesh hình cầu thật sự (IcosahedronGeometry)
  let planetMesh = null;
  mesh.traverse(obj => {
    if (
      obj.type === "Mesh" &&
      obj.geometry &&
      obj.geometry.type === "IcosahedronGeometry"
    ) {
      planetMesh = obj;
    }
  });
  if (!planetMesh) return;

  // Lấy vị trí thế giới của mesh hành tinh
  const pos = new THREE.Vector3();
  planetMesh.getWorldPosition(pos);

  // Hướng từ trên xuống, hơi chéo để thấy rõ bề mặt
  let direction = new THREE.Vector3(-0.5, -1, -0.5).normalize();

  // Zoom cực sát: camera cách bề mặt hành tinh rất gần
  let zoomDistance = 0.05;
  if (planetMesh.geometry && planetMesh.geometry.boundingSphere) {
    zoomDistance =
      planetMesh.geometry.boundingSphere.radius * planetMesh.scale.x * 0.05;
  } else if (planetMesh.scale && planetMesh.scale.x) {
    zoomDistance = planetMesh.scale.x * 0.05;
  }

  // Tính vị trí camera mới
  const end = pos.clone().add(direction.multiplyScalar(zoomDistance));
  const start = camera.position.clone();
  let t = 0;
  function animateCamera() {
    t += 0.03;
    camera.position.lerpVectors(start, end, t);
    camera.lookAt(pos);
    controls.target.copy(pos);
    controls.update();
    if (t < 1) {
      requestAnimationFrame(animateCamera);
    }
  }
  animateCamera();
  document.getElementById("planet-info").style.display = "none";
}

// Thoát focus: hiện lại toàn bộ hệ mặt trời, reset scale
function unfocusPlanet() {
  if (!isPlanetFocused) return;
  planetMeshes.forEach(mesh => mesh.scale.set(1, 1, 1));
  scene.children.forEach(obj => { obj.visible = true; });
  isPlanetFocused = false;
}

// === UI BUTTONS ===
const musicBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const viewBtn = document.getElementById('view-toggle');
const viewIcon = document.getElementById('view-icon');

// Thông tin bài hát (có thể mở rộng)
const musicMeta = [
  { title: 'Painting The Solar System', artist: 'Travis Fitzsimmons' },
  { title: 'Discovery Of Planet X', artist: 'Imphezia Soundtrack' },
  { title: 'Aura Of The Alien Piano', artist: 'Imphezia Soundtrack' },
  { title: 'Aura Of The Alien', artist: 'Imphezia Soundtrack' },
];
const musicTracks = [
  '/solar-system-threejs/assets/click.mp3',
  '/solar-system-threejs/assets/click_1.mp3',
  '/solar-system-threejs/assets/click_2.mp3',
  '/solar-system-threejs/assets/click_3.mp3',
];
let currentTrack = 0;
const bgMusic = new Audio(musicTracks[currentTrack]);
bgMusic.loop = true;
bgMusic.volume = 0.5;
let musicOn = false;

// SVG ICONS
const svgMusicOn = `<svg viewBox="0 0 64 64" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 24v16h12l12 12V12L28 24H16z" fill="#ffe81f"/><path d="M44 24a8 8 0 0 1 0 16" stroke="#ffe81f" stroke-width="4" stroke-linecap="round"/><path d="M48 16a16 16 0 0 1 0 32" stroke="#ffe81f" stroke-width="4" stroke-linecap="round"/></svg>`;
const svgMusicOff = `<svg viewBox="0 0 64 64" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 24v16h12l12 12V12L28 24H16z" fill="#ffe81f"/><path d="M44 24a8 8 0 0 1 0 16" stroke="#ffe81f" stroke-width="4" stroke-linecap="round"/><path d="M48 16a16 16 0 0 1 0 32" stroke="#ffe81f" stroke-width="4" stroke-linecap="round"/><line x1="18" y1="18" x2="46" y2="46" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
const svgEye = `<svg viewBox="0 0 24 24" fill="none" stroke="#ffe81f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="6"/><circle cx="12" cy="12" r="2.5" fill="#ffe81f"/></svg>`;
const svgReset = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffe81f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><polyline points="3 16 3 12 7 12"/></svg>`;

musicIcon.innerHTML = svgMusicOff;
viewIcon.innerHTML = svgEye;

function playMusic() {
  bgMusic.play();
  musicOn = true;
  musicIcon.innerHTML = svgMusicOn;
  musicBtn.title = 'Tắt nhạc';
}
function pauseMusic() {
  bgMusic.pause();
  musicOn = false;
  musicIcon.innerHTML = svgMusicOff;
  musicBtn.title = 'Bật nhạc';
}

// === MUSIC PANEL ===
const musicPanel = document.getElementById('music-panel');
const musicPanelClose = document.getElementById('music-panel-close');
const musicPanelMusicSlider = document.getElementById('music-panel-music-slider');
const musicPanelSfxSlider = document.getElementById('music-panel-sfx-slider');
const musicPanelTitle = document.getElementById('music-panel-title');
const musicPanelArtist = document.getElementById('music-panel-artist');
const musicPanelPlay = document.getElementById('music-panel-play');
const musicPanelPrev = document.getElementById('music-panel-prev');
const musicPanelNext = document.getElementById('music-panel-next');
const musicPanelPlaylist = document.getElementById('music-panel-playlist');

function updateMusicPanelInfo() {
  musicPanelTitle.textContent = musicMeta[currentTrack]?.title || 'Bài hát';
  musicPanelArtist.textContent = musicMeta[currentTrack]?.artist || '';
  musicPanelMusicSlider.value = bgMusic.volume;
  // SFX volume: nếu có SFX, đồng bộ ở đây
  musicPanelSfxSlider.value = clickSound.volume;
  // Nút play/pause
  musicPanelPlay.innerHTML = musicOn ? '&#10073;&#10073;' : '&#9654;';
}

musicBtn.onclick = (e) => {
  e.stopPropagation();
  if (musicPanel.style.display === 'block') {
    musicPanel.style.display = 'none';
  } else {
    musicPanel.style.display = 'block';
    updateMusicPanelInfo();
  }
};
musicPanelClose.onclick = () => {
  musicPanel.style.display = 'none';
};
window.addEventListener('click', (e) => {
  if (musicPanel.style.display === 'block' && !musicPanel.contains(e.target) && e.target !== musicBtn) {
    musicPanel.style.display = 'none';
  }
});

musicPanelMusicSlider.addEventListener('input', (e) => {
  bgMusic.volume = parseFloat(e.target.value);
});
musicPanelSfxSlider.addEventListener('input', (e) => {
  clickSound.volume = parseFloat(e.target.value);
});
musicPanelPlay.onclick = () => {
  if (!musicOn) {
    playMusic();
  } else {
    pauseMusic();
  }
  updateMusicPanelInfo();
};
musicPanelPrev.onclick = () => {
  currentTrack = (currentTrack - 1 + musicTracks.length) % musicTracks.length;
  bgMusic.src = musicTracks[currentTrack];
  if (musicOn) bgMusic.play();
  updateMusicPanelInfo();
};
musicPanelNext.onclick = () => {
  currentTrack = (currentTrack + 1) % musicTracks.length;
  bgMusic.src = musicTracks[currentTrack];
  if (musicOn) bgMusic.play();
  updateMusicPanelInfo();
};
// Playlist button: có thể mở rộng popup danh sách bài hát
musicPanelPlaylist.onclick = () => {
  alert('Tính năng playlist sẽ được cập nhật!');
};

// === VIEW BUTTON ===
const defaultCameraPos = { x: 30 * Math.cos(Math.PI / 6), y: 30 * Math.sin(Math.PI / 6), z: 40 };
const defaultTarget = { x: 0, y: 0, z: 0 };
let isZoomedOut = false;

viewBtn.onclick = () => {
  if (!isZoomedOut) {
    // Zoom ra xa toàn cảnh
    const end = new THREE.Vector3(60, 60, 80);
    const start = camera.position.clone();
    let t = 0;
    function animateZoomOut() {
      t += 0.02;
      camera.position.lerpVectors(start, end, t);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
      if (t < 1) {
        requestAnimationFrame(animateZoomOut);
      } else {
        isZoomedOut = true;
        viewIcon.innerHTML = svgReset;
        viewBtn.title = 'Quay lại góc nhìn ban đầu';
      }
    }
    animateZoomOut();
  } else {
    // Quay lại góc nhìn ban đầu
    const end = new THREE.Vector3(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);
    const start = camera.position.clone();
    let t = 0;
    function animateZoomIn() {
      t += 0.02;
      camera.position.lerpVectors(start, end, t);
      camera.lookAt(defaultTarget.x, defaultTarget.y, defaultTarget.z);
      controls.target.set(defaultTarget.x, defaultTarget.y, defaultTarget.z);
      controls.update();
      if (t < 1) {
        requestAnimationFrame(animateZoomIn);
      } else {
        isZoomedOut = false;
        viewIcon.innerHTML = svgEye;
        viewBtn.title = 'Xem toàn cảnh';
      }
    }
    animateZoomIn();
  }
};

// Hover glow effect for planets
let hoveredPlanet = null;
let hoverGlowMesh = null;
let lastOrbitMaterial = null;

renderer.domElement.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes, true);
  // Reset orbit glow nếu có
  if (lastOrbitMaterial) {
    lastOrbitMaterial.opacity = 0.5;
    lastOrbitMaterial.linewidth = 2;
    lastOrbitMaterial.color.set(0x00ffff);
    lastOrbitMaterial = null;
}
  if (hoverGlowMesh && hoverGlowMesh.parent) {
    hoverGlowMesh.parent.remove(hoverGlowMesh);
    hoverGlowMesh = null;
  }
  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData.planetId) {
      obj = obj.parent;
    }
    if (obj && obj !== hoveredPlanet) {
      hoveredPlanet = obj;
      // Tìm mesh hình cầu thật sự
      let planetMesh = null;
      obj.traverse(o => {
        if (o.type === "Mesh" && o.geometry && o.geometry.type === "IcosahedronGeometry") {
          planetMesh = o;
        }
      });
      if (planetMesh) {
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff99,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide
        });
        hoverGlowMesh = new THREE.Mesh(planetMesh.geometry.clone(), glowMaterial);
        hoverGlowMesh.scale.copy(planetMesh.scale).multiplyScalar(1.25);
        hoverGlowMesh.position.copy(planetMesh.position);
        hoverGlowMesh.quaternion.copy(planetMesh.quaternion);
        obj.add(hoverGlowMesh);
      }
      // Orbit glow highlight
      if (obj.parent && obj.parent.orbitMaterial) {
        lastOrbitMaterial = obj.parent.orbitMaterial;
        lastOrbitMaterial.opacity = 1;
        lastOrbitMaterial.linewidth = 4;
        lastOrbitMaterial.color.set(0xffffff);
      }
    }
  } else {
    hoveredPlanet = null;
  }
});


function updateShadowLOD() {
  const cameraDistance = camera.position.length();
  
  if (cameraDistance > 50) {
    // Xa: shadow quality thấp
    sunLight.shadow.mapSize.setScalar(1024);
    directionalLight.shadow.mapSize.setScalar(512);
  } else if (cameraDistance > 30) {
    // Trung bình: shadow quality vừa
    sunLight.shadow.mapSize.setScalar(2048);
    directionalLight.shadow.mapSize.setScalar(1024);
  } else {
    // Gần: shadow quality cao
    sunLight.shadow.mapSize.setScalar(4096);
    directionalLight.shadow.mapSize.setScalar(2048);
  }
}

// 2. Selective shadow casting - chỉ objects quan trọng mới cast shadow
function optimizeShadowCasting() {
  // Chỉ các hành tinh lớn mới cast shadow
  planetMeshes.forEach((mesh, index) => {
    const planetSize = planets[index]?.planetSize || 0.5;
    
    mesh.traverse(obj => {
      if (obj.isMesh) {
        // Chỉ hành tinh lớn hơn 0.4 mới cast shadow
        obj.castShadow = planetSize > 0.4;
        obj.receiveShadow = true; // Tất cả đều receive shadow
      }
    });
  });
  
  // Asteroid chỉ cast shadow khi gần camera
  asteroidGroup.children.forEach(asteroid => {
    const distanceToCamera = asteroid.position.distanceTo(camera.position);
    asteroid.castShadow = distanceToCamera < 30;
    asteroid.receiveShadow = distanceToCamera < 50;
  });
}

// 3. Dynamic shadow updates - không update shadow mỗi frame
let shadowUpdateCounter = 0;
const SHADOW_UPDATE_FREQUENCY = 3; // Update mỗi 3 frames

function conditionalShadowUpdate() {
  shadowUpdateCounter++;
  
  if (shadowUpdateCounter >= SHADOW_UPDATE_FREQUENCY) {
    renderer.shadowMap.autoUpdate = true;
    shadowUpdateCounter = 0;
  } else {
    renderer.shadowMap.autoUpdate = false;
  }
}

// 4. Frustum-based shadow optimization
function updateShadowFrustum() {
  // Điều chỉnh shadow camera frustum dựa trên vị trí camera
  const cameraPos = camera.position;
  const distanceFromCenter = cameraPos.length();
  
  // Điều chỉnh near/far planes
  sunLight.shadow.camera.near = Math.max(0.1, distanceFromCenter * 0.1);
  sunLight.shadow.camera.far = Math.min(200, distanceFromCenter * 3);
  
  // Cập nhật projection matrix
  sunLight.shadow.camera.updateProjectionMatrix();
}

// 5. Shadow bias để tránh shadow acne
sunLight.shadow.bias = -0.0001;
sunLight.shadow.normalBias = 0.02;
directionalLight.shadow.bias = -0.0001;
directionalLight.shadow.normalBias = 0.02;

// 6. Cập nhật hàm updateShadows() với các tối ưu
function updateShadows() {
  // Các tối ưu hiệu suất
  updateShadowLOD();
  optimizeShadowCasting();
  conditionalShadowUpdate();
  updateShadowFrustum();
  
  // Cập nhật DirectionalLight position
  directionalLight.position.copy(camera.position);
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.target.updateMatrixWorld();
}

// 7. Debug shadow - để kiểm tra shadow hoạt động
function createShadowDebugPanel() {
  const debugDiv = document.createElement('div');
  debugDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1000;
  `;
  
  function updateDebugInfo() {
    const shadowMapSize = sunLight.shadow.mapSize.x;
    const shadowsEnabled = renderer.shadowMap.enabled;
    const castingShadows = planetMeshes.filter(mesh => 
      mesh.children.some(child => child.castShadow)
    ).length;
    
    debugDiv.innerHTML = `
      Shadow Map Size: ${shadowMapSize}x${shadowMapSize}<br>
      Shadows Enabled: ${shadowsEnabled}<br>
      Objects Casting Shadows: ${castingShadows}<br>
      Camera Distance: ${camera.position.length().toFixed(1)}
    `;
  }
  
  document.body.appendChild(debugDiv);
  
  // Cập nhật debug info mỗi giây
  setInterval(updateDebugInfo, 1000);
}