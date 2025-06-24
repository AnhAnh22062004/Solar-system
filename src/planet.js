import {
  Mesh,
  Color,
  Group,
  DoubleSide,
  RingGeometry,
  TorusGeometry,
  TextureLoader,
  ShaderMaterial,
  SRGBColorSpace,
  AdditiveBlending,
  MeshPhongMaterial,
  MeshBasicMaterial,
  IcosahedronGeometry,
} from "three";

export class Planet {
  group;
  loader;
  animate;
  planetGroup;
  planetGeometry;
  planetMesh;
  orbitMaterial;
  orbitMesh;
  haloGroup;

  constructor({
    orbitSpeed = 1,
    orbitRadius = 1,
    orbitRotationDirection = "clockwise",

    planetSize = 1,
    planetAngle = 0,
    planetRotationSpeed = 1,
    planetRotationDirection = "clockwise",
    planetTexture = "/solar-system-threejs/assets/mercury-map.jpg",

    rimHex = 0x0088ff,
    facingHex = 0x000000,

    rings = null,
  } = {}) {
    this.orbitSpeed = orbitSpeed;
    this.orbitRadius = orbitRadius;
    this.orbitRotationDirection = orbitRotationDirection;

    this.planetSize = planetSize;
    this.planetAngle = planetAngle;
    this.planetTexture = planetTexture;
    this.planetRotationSpeed = planetRotationSpeed;
    this.planetRotationDirection = planetRotationDirection;

    this.rings = rings;

    this.group = new Group();
    this.planetGroup = new Group();
    this.loader = new TextureLoader();
    this.planetGeometry = new IcosahedronGeometry(this.planetSize, 12);

    this.createOrbit();
    this.createRings();
    this.createPlanet();
    this.createGlow(rimHex, facingHex);
    this.createHalo();
    this.animate = this.createAnimateFunction();
    this.animate();
  }

  createOrbit() {
    const orbitGeometry = new TorusGeometry(this.orbitRadius, 0.01, 100);
    this.orbitMaterial = new MeshBasicMaterial({
      color: 0x00ffff,
      side: DoubleSide,
      transparent: true,
      opacity: 0.5,
      linewidth: 2
    });
    this.orbitMesh = new Mesh(orbitGeometry, this.orbitMaterial);
    this.orbitMesh.rotation.x = Math.PI / 2;
    this.group.add(this.orbitMesh);
  }

  createPlanet() {
    const map = this.loader.load(this.planetTexture);
    // Luôn sáng, không đổ bóng
    const planetMaterial = new MeshBasicMaterial({ map });
    const planetMesh = new Mesh(this.planetGeometry, planetMaterial);
    this.planetGroup.add(planetMesh);
    this.planetGroup.position.x = this.orbitRadius - this.planetSize / 9;
    this.planetGroup.rotation.z = this.planetAngle;
    this.group.add(this.planetGroup);
    this.planetMesh = planetMesh;
  }

  createGlow(rimHex, facingHex) {
    const uniforms = {
      color1: { value: new Color(rimHex) },
      color2: { value: new Color(facingHex) },
      fresnelBias: { value: 0.2 },
      fresnelScale: { value: 1.5 },
      fresnelPower: { value: 4.0 },
    };

    const vertexShader = `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    
    varying float vReflectionFactor;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    
      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    
      vec3 I = worldPosition.xyz - cameraPosition;
    
      vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
    
      gl_Position = projectionMatrix * mvPosition;
    }
    `;

    const fragmentShader = `
      uniform vec3 color1;
      uniform vec3 color2;
      
      varying float vReflectionFactor;
      
      void main() {
        float f = clamp( vReflectionFactor, 0.0, 1.0 );
        gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
      }
    `;

    const planetGlowMaterial = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: AdditiveBlending,
    });
    const planetGlowMesh = new Mesh(this.planetGeometry, planetGlowMaterial);
    planetGlowMesh.scale.setScalar(1.1);
    this.planetGroup.add(planetGlowMesh);
  }

  createRings() {
    if (!this.rings) return;

    const innerRadius = this.planetSize + 0.1;
    const outerRadius = innerRadius + this.rings.ringsSize;

    const ringsGeometry = new RingGeometry(innerRadius, outerRadius, 32);

    const ringsMaterial = new MeshBasicMaterial({
      side: DoubleSide,
      transparent: true,
      map: this.loader.load(this.rings.ringsTexture),
    });

    const ringMeshs = new Mesh(ringsGeometry, ringsMaterial);
    ringMeshs.rotation.x = Math.PI / 2;
    this.planetGroup.add(ringMeshs);
  }

  createHalo() {
    this.haloGroup = new Group();
    const haloCount = Math.floor(Math.random() * 10) + 1;
    const baseRadius = this.planetSize * 1.28;
    for (let i = 0; i < haloCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = baseRadius + Math.random() * 0.12;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      const mat = new MeshBasicMaterial({ color: 0xfff700, transparent: true, opacity: 1 });
      const sphere = new Mesh(new IcosahedronGeometry(this.planetSize * 0.04, 2), mat);
      sphere.position.set(x, y, z);
      this.haloGroup.add(sphere);
    }
    this.planetGroup.add(this.haloGroup);
  }

  createAnimateFunction() {
    return () => {
      requestAnimationFrame(this.animate);
      this.updateOrbitRotation();
      this.updatePlanetRotation();
      if (this.haloGroup) {
        this.haloGroup.rotation.y += 0.008;
      }
    };
  }

  updateOrbitRotation() {
    if (this.orbitRotationDirection === "clockwise") {
      this.group.rotation.y -= this.orbitSpeed;
    } else if (this.orbitRotationDirection === "counterclockwise") {
      this.group.rotation.y += this.orbitSpeed;
    }
  }

  updatePlanetRotation() {
    if (this.planetRotationDirection === "clockwise") {
      this.planetGroup.rotation.y -= this.planetRotationSpeed;
    } else if (this.planetRotationDirection === "counterclockwise") {
      this.planetGroup.rotation.y += this.planetRotationSpeed;
    }
  }

  getPlanet() {
    return this.group;
  }
}
