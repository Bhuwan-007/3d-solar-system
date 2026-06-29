import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { nearbyStarsData } from '../data/nearbyStars.js';

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
    
    this.createAsteroidBelt();
    this.createKuiperBelt();
    this.createMilkyWay();
    this.createNearbyStars();
    
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
    this.solarSystemMarker.position.set(
      Math.cos(armAngle) * armR,
      0,
      Math.sin(armAngle) * armR
    );
    this.galaxyGroup.add(this.solarSystemMarker);
    
    // Galaxy is at a huge offset so it doesn't interfere with the solar system
    // We'll translate the camera to it during the zoom-out transition
    this.galaxyGroup.position.set(0, 0, 0); // centered at origin, same as solar system
    this.galaxyGroup.visible = false;
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

  getInteractables() {
    return this.nearbyStarBodies ? this.nearbyStarBodies.map(b => b.mesh) : [];
  }

  getStarsData() {
    if (!this.nearbyStarBodies) return [];
    
    const flatData = [];
    let bodyIndex = 0;
    
    nearbyStarsData.forEach(starConfig => {
      flatData.push({
        ...starConfig,
        isStar: true,
        bodyRef: this.nearbyStarBodies[bodyIndex++]
      });
      
      if (starConfig.planets) {
        starConfig.planets.forEach(planetConfig => {
          flatData.push({
            ...planetConfig,
            isStar: false,
            bodyRef: this.nearbyStarBodies[bodyIndex++]
          });
        });
      }
    });
    
    return flatData;
  }

  /**
   * Update visibility based on the current zoom level.
   * @param {number} zoomLevel - 0 = planet view, 1 = solar overview, 2 = stellar neighborhood, 3 = galaxy
   * @param {boolean} isStarSystemFocused - true if user is exploring a nearby star system
   */
  updateVisibility(zoomLevel, isStarSystemFocused = false) {
    if (isStarSystemFocused) {
      this.group.visible = true;
      this.asteroidBelt.visible = false;
      this.kuiperBelt.visible = false;
      this.nearbyStarsGroup.visible = true;
      this.milkyWay.visible = false;
      this.galaxyGroup.visible = false;
    } else {
      this.group.visible = zoomLevel >= 1; 
      this.asteroidBelt.visible = zoomLevel >= 1 && zoomLevel < 3;
      this.kuiperBelt.visible = zoomLevel >= 1;
      this.nearbyStarsGroup.visible = zoomLevel >= 2;
      this.milkyWay.visible = zoomLevel >= 3;
      this.galaxyGroup.visible = zoomLevel >= 3;
    }
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
  }
}
