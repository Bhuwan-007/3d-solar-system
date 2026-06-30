import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { nearbyStarsData } from '../data/nearbyStars.js';
import { localGroupData } from '../data/localGroup.js';
import { extremePhenomenaData } from '../data/extremePhenomena.js';
import { BlackHole } from './BlackHole.js';
import { DarkMatterWeb } from './DarkMatterWeb.js';

/**
 * Galaxy entity — creates the Milky Way spiral galaxy from particles
 * and the asteroid/Kuiper belts for the solar system overview.
 */
export class Galaxy {
  constructor(scene, glslNoise, terminatorVertexLogic, terminatorLightMath) {
    this.scene = scene;
    this.glslNoise = glslNoise;
    this.terminatorVertexLogic = terminatorVertexLogic;
    this.terminatorLightMath = terminatorLightMath;
    
    this.group = new THREE.Group();
    this.group.visible = false; // hidden until zoom-out reaches galaxy scale
    
    this.extremePhenomena = [];

    this.createAsteroidBelt();
    this.createKuiperBelt();
    this.createMilkyWay();
    this.createNearbyStars();
    this.createLocalGroup();
    this.createBackgroundGalaxies();
    this.createExtremePhenomena();
    
    this.scene.add(this.group);
  }

  /** Asteroid belt between Mars and Jupiter (dist ~55-65 in our scale) */
  createAsteroidBelt() {
    const count = 1500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 55 + Math.random() * 12; // between Mars (46) and Jupiter (72)
      const y = (Math.random() - 0.5) * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      sizes[i] = 0.3 + Math.random() * 0.8;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = 1.0 - d * 2.0;
          gl_FragColor = vec4(0.6, 0.55, 0.5, a * 0.7);
        }
      `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    
    this.asteroidBelt = new THREE.Points(geo, mat);
    this.group.add(this.asteroidBelt);
  }

  /** Kuiper belt beyond Neptune (dist ~170-250 in our scale) */
  createKuiperBelt() {
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 185 + Math.random() * 80;
      const y = (Math.random() - 0.5) * 8;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      sizes[i] = 0.2 + Math.random() * 0.5;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = 1.0 - d * 2.0;
          gl_FragColor = vec4(0.4, 0.45, 0.6, a * 0.5);
        }
      `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    
    this.kuiperBelt = new THREE.Points(geo, mat);
    this.group.add(this.kuiperBelt);
  }

  /** Milky Way spiral galaxy — enormous particle cloud */
  createMilkyWay() {
    this.galaxyGroup = new THREE.Group();
    
    const armCount = 4;
    const particlesPerArm = 15000;
    const totalParticles = armCount * particlesPerArm + 5000; // + core
    
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    
    let idx = 0;
    
    // Spiral arms
    for (let arm = 0; arm < armCount; arm++) {
      const armOffset = (arm / armCount) * Math.PI * 2;
      
      for (let i = 0; i < particlesPerArm; i++) {
        const t = i / particlesPerArm;
        const angle = armOffset + t * Math.PI * 3.5; // ~1.75 full rotations
        const r = 200 + t * 2800; // galaxy radius
        
        // Add scatter
        const scatter = 80 + t * 200;
        const sx = (Math.random() - 0.5) * scatter;
        const sy = (Math.random() - 0.5) * (20 + t * 40);
        const sz = (Math.random() - 0.5) * scatter;
        
        const x = Math.cos(angle) * r + sx;
        const y = sy;
        const z = Math.sin(angle) * r + sz;
        
        pos[idx * 3] = x;
        pos[idx * 3 + 1] = y;
        pos[idx * 3 + 2] = z;
        
        // Color: whiter in center, bluer on edges
        const coreInfluence = 1.0 - t;
        if (Math.random() > 0.85) {
          // Blue-white hot stars
          colors[idx * 3] = 0.6 + coreInfluence * 0.4;
          colors[idx * 3 + 1] = 0.7 + coreInfluence * 0.3;
          colors[idx * 3 + 2] = 1.0;
        } else if (Math.random() > 0.7) {
          // Yellowish stars
          colors[idx * 3] = 1.0;
          colors[idx * 3 + 1] = 0.9 - t * 0.3;
          colors[idx * 3 + 2] = 0.5 + coreInfluence * 0.3;
        } else {
          // White/dim stars
          const brightness = 0.5 + Math.random() * 0.5;
          colors[idx * 3] = brightness;
          colors[idx * 3 + 1] = brightness * 0.95;
          colors[idx * 3 + 2] = brightness * 0.85;
        }
        
        sizes[idx] = (1.0 + Math.random() * 3.0) * (1.0 - t * 0.5);
        idx++;
      }
    }
    
    // Dense core
    for (let i = 0; i < 5000; i++) {
      const r = Math.random() * 400;
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[idx * 3] = r * Math.sin(phi) * Math.cos(angle);
      pos[idx * 3 + 1] = r * Math.cos(phi) * 0.15; // flatten
      pos[idx * 3 + 2] = r * Math.sin(phi) * Math.sin(angle);
      
      const brightness = 0.8 + Math.random() * 0.2;
      colors[idx * 3] = brightness;
      colors[idx * 3 + 1] = brightness * 0.9;
      colors[idx * 3 + 2] = brightness * 0.6;
      
      sizes[idx] = 1.5 + Math.random() * 4.0;
      idx++;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (800.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = pow(1.0 - d * 2.0, 1.5);
          gl_FragColor = vec4(vColor * 1.5, a);
        }
      `,
      transparent: true, vertexColors: true, 
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    
    this.milkyWay = new THREE.Points(geo, mat);
    this.milkyWay.frustumCulled = false;
    this.galaxyGroup.add(this.milkyWay);
    
    // "You are here" marker — solar system position in galaxy
    // Place it at roughly 2/3 out from center along one arm
    this.solarSystemMarker = new THREE.Group();
    const markerGeo = new THREE.RingGeometry(12, 14, 32);
    const markerMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffaa, side: THREE.DoubleSide, transparent: true, opacity: 0.8 
    });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.rotation.x = Math.PI / 2;
    this.solarSystemMarker.add(markerMesh);
    
    // Label sprite
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00ffaa';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☀ YOU ARE HERE', 128, 40);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(60, 15, 1);
    sprite.position.y = 25;
    this.solarSystemMarker.add(sprite);
    
    // Position at ~2/3 along first spiral arm
    const armAngle = 0 + 0.65 * Math.PI * 3.5;
    const armR = 200 + 0.65 * 2800;
    const markerX = Math.cos(armAngle) * armR;
    const markerZ = Math.sin(armAngle) * armR;
    this.solarSystemMarker.position.set(markerX, 0, markerZ);
    this.galaxyGroup.add(this.solarSystemMarker);
    
    // Offset the entire galaxy so that the solar system marker precisely aligns with world (0,0,0)
    this.galaxyGroup.position.set(-markerX, 0, -markerZ);
    this.group.add(this.galaxyGroup);
  }

  /** Nearby star systems — visible in the "stellar neighborhood" view */
  createNearbyStars() {
    this.nearbyStarsGroup = new THREE.Group();
    this.nearbyStarBodies = [];
    
    nearbyStarsData.forEach(starConfig => {
      const config = {
        ...starConfig,
        isStar: true,
        isFixedPosition: true,
      };
      
      const body = new CelestialBody(config, this.glslNoise, this.terminatorVertexLogic, this.terminatorLightMath);
      
      body.meshGroup.position.set(
        Math.cos(starConfig.angle) * starConfig.dist,
        starConfig.yOffset || 0,
        Math.sin(starConfig.angle) * starConfig.dist
      );
      
      // Label
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      // Add a subtle dark background for the text to improve contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(128, 30, 256, 60, 15);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(starConfig.name, 256, 60);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true, 
        opacity: 0.9,
        depthWrite: false, // Ensures labels render nicely
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(60, 15, 1);
      sprite.position.y = starConfig.r * 1.5 + 8;
      
      // We attach the label to a pivot so it scales correctly, but wait, the sprite is added directly to meshGroup
      body.meshGroup.add(sprite);
      this.nearbyStarsGroup.add(body.meshGroup);
      this.nearbyStarBodies.push(body);

      // Create exoplanets if any
      if (starConfig.planets) {
        starConfig.planets.forEach(planetConfig => {
          // Exoplanets orbit their star, so they are not fixed position!
          const planetConfigData = {
            ...planetConfig,
            isStar: false,
            isFixedPosition: false
          };
          
          const planetBody = new CelestialBody(planetConfigData, this.glslNoise, this.terminatorVertexLogic, this.terminatorLightMath);
          
          // Draw orbit ring around the star
          if (planetConfig.dist > 0) {
            const geo = new THREE.RingGeometry(planetConfig.dist - 0.05, planetConfig.dist + 0.05, 64);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
            const orbitRing = new THREE.Mesh(geo, mat);
            orbitRing.rotation.x = Math.PI / 2;
            body.meshGroup.add(orbitRing);
          }

          body.meshGroup.add(planetBody.meshGroup);
          // We push them into the same array so they become interactables and animate
          this.nearbyStarBodies.push(planetBody);
        });
      }
    });
    
    this.nearbyStarsGroup.visible = false;
    this.group.add(this.nearbyStarsGroup);
  }

  /** The Local Group (Neighboring Galaxies) */
  createLocalGroup() {
    this.localGroupGroup = new THREE.Group();
    this.localGroupBodies = [];
    
    localGroupData.forEach(galaxyConfig => {
      const config = {
        ...galaxyConfig,
        isStar: true, // Treat as click target like a star
        isFixedPosition: true,
      };
      
      const body = new CelestialBody(config, this.glslNoise, this.terminatorVertexLogic, this.terminatorLightMath);
      
      body.meshGroup.position.set(
        Math.cos(galaxyConfig.angle) * galaxyConfig.dist,
        galaxyConfig.yOffset || 0,
        Math.sin(galaxyConfig.angle) * galaxyConfig.dist
      );
      
      // Make the actual sphere invisible since we will draw particles
      body.mesh.material.transparent = true;
      body.mesh.material.opacity = 0.2;
      
      // Generate procedural galaxy particles
      let particleGroup;
      if (galaxyConfig.id === 'andromeda') {
        particleGroup = this.createSpiralGalaxyParticles(3500, 5, 20000, new THREE.Color(0.2, 0.4, 1.0));
      } else if (galaxyConfig.id === 'triangulum') {
        particleGroup = this.createSpiralGalaxyParticles(1500, 3, 8000, new THREE.Color(0.2, 0.8, 0.8));
      } else {
        // Restored to larger sizes as requested
        particleGroup = this.createIrregularGalaxyParticles(800, 5000, new THREE.Color(1.0, 0.6, 0.8));
      }
      body.meshGroup.add(particleGroup);
      
      // Label
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(64, 30, 384, 60, 15);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(galaxyConfig.name, 256, 60);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9, depthWrite: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(600, 150, 1);
      sprite.position.y = galaxyConfig.r * 1.5 + 400;
      body.meshGroup.add(sprite);
      
      this.localGroupGroup.add(body.meshGroup);
      this.localGroupBodies.push(body);
    });
    
    this.localGroupGroup.visible = false;
    this.group.add(this.localGroupGroup);
  }

  createExtremePhenomena() {
    // 1. Black Holes
    extremePhenomenaData.blackHoles.forEach(bhConfig => {
      const bh = new BlackHole(bhConfig, this.glslNoise);
      this.extremePhenomena.push(bh);
      
      // Sagittarius A* belongs to the Milky Way (galaxyGroup)
      if (bhConfig.id === 'sagittarius-a-star') {
        this.galaxyGroup.add(bh.meshGroup);
      } else {
        // Others belong to the Local Group
        this.localGroupGroup.add(bh.meshGroup);
      }
    });

    // 2. Dark Matter Web
    const darkMatter = new DarkMatterWeb(extremePhenomenaData.darkMatterNodes);
    this.localGroupGroup.add(darkMatter.meshGroup);
    this.extremePhenomena.push({ update: (t) => darkMatter.update(t) }); // Wrap for unified update loop
  }

  createSpiralGalaxyParticles(radius, armCount, particleCount, baseColor) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    let idx = 0;
    
    const particlesPerArm = Math.floor((particleCount - 2000) / armCount);
    for (let arm = 0; arm < armCount; arm++) {
      const armOffset = (arm / armCount) * Math.PI * 2;
      for (let i = 0; i < particlesPerArm; i++) {
        const t = i / particlesPerArm;
        const angle = armOffset + t * Math.PI * 4.0;
        const r = 100 + t * radius;
        const scatter = 100 + t * 400;
        pos[idx * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * scatter;
        pos[idx * 3 + 1] = (Math.random() - 0.5) * (40 + t * 80);
        pos[idx * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * scatter;
        colors[idx * 3] = baseColor.r + Math.random() * 0.2;
        colors[idx * 3 + 1] = baseColor.g + Math.random() * 0.2;
        colors[idx * 3 + 2] = baseColor.b + Math.random() * 0.2;
        sizes[idx] = (1.5 + Math.random() * 5.0) * (1.0 - t * 0.5);
        idx++;
      }
    }
    for (let i = 0; i < 2000; i++) {
      const r = Math.random() * (radius * 0.2);
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[idx * 3] = r * Math.sin(phi) * Math.cos(angle);
      pos[idx * 3 + 1] = r * Math.cos(phi) * 0.2;
      pos[idx * 3 + 2] = r * Math.sin(phi) * Math.sin(angle);
      colors[idx * 3] = 1.0; colors[idx * 3 + 1] = 0.9; colors[idx * 3 + 2] = 0.8;
      sizes[idx] = 2.0 + Math.random() * 6.0;
      idx++;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { opacity: { value: 1.0 } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (12000.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = pow(1.0 - d * 2.0, 1.5);
          gl_FragColor = vec4(vColor * 1.5, a * opacity);
        }
      `,
      transparent: true, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false; // Prevent flickering when camera moves
    return points;
  }

  createIrregularGalaxyParticles(radius, particleCount, baseColor) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * radius;
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(angle);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.5;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(angle);
      colors[i * 3] = baseColor.r + Math.random() * 0.2;
      colors[i * 3 + 1] = baseColor.g + Math.random() * 0.2;
      colors[i * 3 + 2] = baseColor.b + Math.random() * 0.2;
      sizes[i] = 2.0 + Math.random() * 4.0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { opacity: { value: 1.0 } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (12000.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = pow(1.0 - d * 2.0, 1.5);
          gl_FragColor = vec4(vColor * 1.5, a * opacity);
        }
      `,
      transparent: true, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return points;
  }

  getInteractables() {
    const interactables = [];
    if (this.nearbyStarBodies) interactables.push(...this.nearbyStarBodies.map(b => b.mesh));
    if (this.localGroupBodies) interactables.push(...this.localGroupBodies.map(b => b.mesh));
    return interactables;
  }

  getStarsData() {
    const flatData = [];
    if (this.nearbyStarBodies) {
      let bodyIndex = 0;
      nearbyStarsData.forEach(starConfig => {
        flatData.push({ ...starConfig, isStar: true, bodyRef: this.nearbyStarBodies[bodyIndex++] });
        if (starConfig.planets) {
          starConfig.planets.forEach(planetConfig => {
            flatData.push({ ...planetConfig, isStar: false, bodyRef: this.nearbyStarBodies[bodyIndex++] });
          });
        }
      });
    }
    if (this.localGroupBodies) {
      let bodyIndex = 0;
      localGroupData.forEach(galaxyConfig => {
        flatData.push({ ...galaxyConfig, isStar: true, bodyRef: this.localGroupBodies[bodyIndex++] });
        if (galaxyConfig.planets) {
          galaxyConfig.planets.forEach(planetConfig => {
            flatData.push({ ...planetConfig, isStar: false, bodyRef: this.localGroupBodies[bodyIndex++] });
          });
        }
      });
    }
    return flatData;
  }

  /**
   * Update visibility based on the current zoom level.
   * @param {number} zoomLevel - 0=planet, 1=solar, 2=neighborhood, 3=galaxy, 4=local group
   * @param {boolean} isStarSystemFocused - true if user is exploring a nearby star system or Andromeda
   * @param {string} activePlanetId - id of the currently focused system
   */
  updateVisibility(zoomLevel, isStarSystemFocused = false, activePlanetId = null) {
    if (isStarSystemFocused) {
      this.group.visible = true;
      this.asteroidBelt.visible = false;
      this.kuiperBelt.visible = false;
      
      // If we are focused on a nearby star (level 2 objects)
      const isNearbyStar = nearbyStarsData.some(s => s.id === activePlanetId || (s.planets && s.planets.some(p => p.id === activePlanetId)));
      this.nearbyStarsGroup.visible = isNearbyStar;
      
      // If we are focused on Andromeda or Local Group object
      const isLocalGroupObject = localGroupData.some(g => g.id === activePlanetId || (g.planets && g.planets.some(p => p.id === activePlanetId)));
      this.localGroupGroup.visible = isLocalGroupObject;
      
      // Strict Culling: Hide the Milky Way entirely when zoomed into Andromeda or another Local Group system
      this.milkyWay.visible = false;
      this.galaxyGroup.visible = false;
      
      // Fade the glaring galaxy particles and hide labels
      if (this.localGroupBodies) {
        this.localGroupBodies.forEach(body => {
          body.meshGroup.children.forEach(child => {
            if (child.type === 'Points') {
              child.visible = true;
              if (child.material.uniforms && child.material.uniforms.opacity) {
                child.material.uniforms.opacity.value = 0.20; // Increased glow
              }
            } else if (child.type === 'Sprite') {
              child.visible = false;
            }
          });
        });
      }
    } else {
      this.group.visible = zoomLevel >= 1; 
      this.asteroidBelt.visible = zoomLevel >= 1 && zoomLevel < 3;
      this.kuiperBelt.visible = zoomLevel >= 1;
      this.nearbyStarsGroup.visible = zoomLevel >= 2;
      this.milkyWay.visible = zoomLevel >= 3 && zoomLevel < 5;
      this.galaxyGroup.visible = zoomLevel >= 3 && zoomLevel < 5;
      this.localGroupGroup.visible = zoomLevel >= 4 && zoomLevel < 5;
      
      // Strict culling at supercluster level to save massive performance
      if (zoomLevel >= 5) {
        this.group.visible = false;
        return; // Don't process the rest of the Local Group visibility
      }
      
      // Restore galaxy particles and labels
      if (this.localGroupBodies) {
        this.localGroupBodies.forEach(body => {
          body.meshGroup.children.forEach(child => {
            if (child.type === 'Points') {
              child.visible = true;
              if (child.material.uniforms && child.material.uniforms.opacity) {
                child.material.uniforms.opacity.value = 1.0;
              }
            } else if (child.type === 'Sprite') {
              child.visible = true;
            }
          });
        });
      }
    }
  }

  createBackgroundGalaxies() {
    // Generate dozens of highly performant background galaxies to fill the Universe View
    const numGalaxies = 80;
    const particlesPerGalaxy = 3000;
    const totalParticles = numGalaxies * particlesPerGalaxy;
    
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    
    let idx = 0;
    
    for (let g = 0; g < numGalaxies; g++) {
      // Random position far outside the Local Group (avoiding the center where the main galaxies are)
      const dist = 30000 + Math.random() * 60000;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI; // Full sphere distribution
      
      const gX = dist * Math.cos(phi) * Math.cos(theta);
      const gY = dist * Math.sin(phi);
      const gZ = dist * Math.cos(phi) * Math.sin(theta);
      
      // Galaxy properties
      const gRadius = 2000 + Math.random() * 4000;
      const armCount = Math.floor(2 + Math.random() * 4);
      
      // Random tint (gold, blue, red, pink)
      const tints = [
        new THREE.Color(0xffcc88), // Gold
        new THREE.Color(0x88ccff), // Blue
        new THREE.Color(0xff8888), // Red
        new THREE.Color(0xff88cc), // Pink
      ];
      const baseColor = tints[Math.floor(Math.random() * tints.length)];
      
      const tiltX = Math.random() * Math.PI;
      const tiltZ = Math.random() * Math.PI;
      
      for (let arm = 0; arm < armCount; arm++) {
        const armOffset = (arm / armCount) * Math.PI * 2;
        const armParticles = particlesPerGalaxy / armCount;
        
        for (let i = 0; i < armParticles; i++) {
          const t = i / armParticles;
          const angle = armOffset + t * Math.PI * 4.0;
          const r = t * gRadius;
          const scatter = t * gRadius * 0.4;
          
          // Local coords
          let lx = Math.cos(angle) * r + (Math.random() - 0.5) * scatter;
          let ly = (Math.random() - 0.5) * scatter * 0.3;
          let lz = Math.sin(angle) * r + (Math.random() - 0.5) * scatter;
          
          // Apply tilt
          const x1 = lx; const y1 = ly * Math.cos(tiltX) - lz * Math.sin(tiltX); const z1 = ly * Math.sin(tiltX) + lz * Math.cos(tiltX);
          const x2 = x1 * Math.cos(tiltZ) - y1 * Math.sin(tiltZ); const y2 = x1 * Math.sin(tiltZ) + y1 * Math.cos(tiltZ); const z2 = z1;
          
          pos[idx * 3] = gX + x2;
          pos[idx * 3 + 1] = gY + y2;
          pos[idx * 3 + 2] = gZ + z2;
          
          // Color falls off to edge
          colors[idx * 3] = baseColor.r * (1.0 - t * 0.5) + (Math.random() * 0.2);
          colors[idx * 3 + 1] = baseColor.g * (1.0 - t * 0.5) + (Math.random() * 0.2);
          colors[idx * 3 + 2] = baseColor.b * (1.0 - t * 0.5) + (Math.random() * 0.2);
          
          sizes[idx] = 2.0 + Math.random() * 4.0;
          idx++;
        }
      }
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (25000.0 / -mvPos.z); // Scale up for massive distance
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = pow(1.0 - d * 2.0, 1.5);
          gl_FragColor = vec4(vColor * 1.5, a * 0.8);
        }
      `,
      transparent: true, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    
    this.backgroundGalaxies = new THREE.Points(geo, mat);
    this.backgroundGalaxies.frustumCulled = false;
    this.localGroupGroup.add(this.backgroundGalaxies);
  }

  update(time, delta, activePlanetId, ORBIT_MULTIPLIER, ROTATION_MULTIPLIER, MOON_MULTIPLIER) {
    if (this.asteroidBelt.visible) {
      this.asteroidBelt.rotation.y = time * 0.002;
    }
    if (this.kuiperBelt.visible) {
      this.kuiperBelt.rotation.y = time * 0.0005;
    }
    if (this.milkyWay.visible) {
      this.milkyWay.rotation.y = time * 0.0003;
    }
    if (this.nearbyStarBodies && this.nearbyStarsGroup.visible) {
      this.nearbyStarBodies.forEach(body => {
        const isFocused = (activePlanetId === body.id);
        body.update(time, delta, isFocused, ORBIT_MULTIPLIER, ROTATION_MULTIPLIER, MOON_MULTIPLIER);
      });
    }
    if (this.localGroupBodies && this.localGroupGroup.visible) {
      this.localGroupGroup.children.forEach(child => {
        if (child.type === 'Points') { // Rotate galaxies slowly
          child.rotation.y = time * 0.0001;
        }
      });
      this.localGroupBodies.forEach(body => {
        const isFocused = (activePlanetId === body.id);
        body.update(time, delta, isFocused, ORBIT_MULTIPLIER, ROTATION_MULTIPLIER, MOON_MULTIPLIER);
      });
    }
    
    if (this.extremePhenomena) {
      this.extremePhenomena.forEach(ep => {
        if (ep.update) ep.update(time);
      });
    }
  }
}
