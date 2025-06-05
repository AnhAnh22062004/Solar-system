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

renderer.render(scene, camera);

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// --- PHYSICS SETUP ---
// (Đã loại bỏ mô phỏng vật lý hấp dẫn và va chạm)

// Khôi phục hàm animate cũ:
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();

renderer.domElement.addEventListener("pointerdown", onPointerDown, false);

const clickSound = new Audio('/solar-system-threejs/assets/click.mp3');

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Kiểm tra va chạm với các hành tinh
  const intersects = raycaster.intersectObjects(planetMeshes, true);

  if (intersects.length > 0) {
    clickSound.currentTime = 0;
    clickSound.play();
    // Truy ngược lên cha có planetId
    let obj = intersects[0].object;
    while (obj && !obj.userData.planetId) {
      obj = obj.parent;
    }
    let planetId = obj ? obj.userData.planetId : null;
    if (planetId) {
      showPlanetInfo(planetId);
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
function focusOnPlanet(planetId) {
  // Tìm group của hành tinh
  let mesh = null;
  for (let i = 0; i < planetMeshes.length; i++) {
    if (planetMeshes[i].userData.planetId === planetId) {
      mesh = planetMeshes[i];
      break;
    }
  }
  if (!mesh) return;

  // Tìm mesh hành tinh thật sự (planetMesh) bên trong group
  let planetMesh = null;
  mesh.traverse(obj => {
    if (obj.type === "Mesh" && obj.geometry && obj.geometry.type === "IcosahedronGeometry") {
      planetMesh = obj;
    }
  });
  if (!planetMesh) return;

  // Lấy vị trí thế giới của mesh hành tinh
  const pos = new Vector3();
  planetMesh.getWorldPosition(pos);

  // Lấy hướng từ camera đến hành tinh
  const direction = camera.position.clone().sub(pos).normalize();

  // Zoom sát hơn nữa: giảm hệ số zoomDistance
  let zoomDistance = 0.7;
  if (planetMesh.geometry && planetMesh.geometry.boundingSphere) {
    zoomDistance = planetMesh.geometry.boundingSphere.radius * planetMesh.scale.x * 0.7;
  } else if (planetMesh.scale && planetMesh.scale.x) {
    zoomDistance = planetMesh.scale.x * 0.7;
  }

  // Tính vị trí camera mới: đứng phía trước hành tinh, cách hành tinh một đoạn zoomDistance
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
  document.getElementById('planet-info').style.display = 'none';
}
