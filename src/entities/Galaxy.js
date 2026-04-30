import * as THREE from 'three';

/**
 * Galaxy entity — creates the Milky Way spiral galaxy from particles
 * and the asteroid/Kuiper belts for the solar system overview.
 */
export class Galaxy {
  constructor(scene) {
    this.scene = scene;
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
    
    const nearbyStars = [
      { name: 'Alpha Centauri', dist: 350, angle: 0.8, color: 0xffee88, size: 2.5 },
      { name: "Barnard's Star", dist: 420, angle: 2.1, color: 0xff8866, size: 1.5 },
      { name: 'Sirius', dist: 550, angle: 4.2, color: 0xaaccff, size: 3.5 },
      { name: 'Proxima Centauri', dist: 330, angle: 0.6, color: 0xff6644, size: 0.8 },
      { name: 'Vega', dist: 600, angle: 5.5, color: 0xbbddff, size: 2.8 },
      { name: 'Tau Ceti', dist: 480, angle: 3.4, color: 0xffdd77, size: 1.8 },
    ];
    
    nearbyStars.forEach(star => {
      const starGrp = new THREE.Group();
      
      // Star sphere
      const starMat = new THREE.MeshBasicMaterial({ color: star.color });
      const starMesh = new THREE.Mesh(
        new THREE.SphereGeometry(star.size, 16, 16), starMat
      );
      starGrp.add(starMesh);
      
      // Glow
      const glowMat = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(star.color) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color; varying vec3 vNormal;
          void main() {
            float f = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 3.0);
            gl_FragColor = vec4(color, f * 0.5);
          }
        `,
        transparent: true, blending: THREE.AdditiveBlending, 
        side: THREE.FrontSide, depthWrite: false
      });
      const glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(star.size * 3, 16, 16), glowMat
      );
      starGrp.add(glowMesh);
      
      // Label
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 48;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(star.name, 128, 30);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.7 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(40, 7.5, 1);
      sprite.position.y = star.size * 4 + 5;
      starGrp.add(sprite);
      
      const y = (Math.random() - 0.5) * 40;
      starGrp.position.set(
        Math.cos(star.angle) * star.dist,
        y,
        Math.sin(star.angle) * star.dist
      );
      
      this.nearbyStarsGroup.add(starGrp);
    });
    
    this.nearbyStarsGroup.visible = false;
    this.group.add(this.nearbyStarsGroup);
  }

  /**
   * Update visibility based on the current zoom level.
   * @param {number} zoomLevel - 0 = planet view, 1 = solar overview, 2 = stellar neighborhood, 3 = galaxy
   */
  updateVisibility(zoomLevel) {
    this.group.visible = zoomLevel >= 1;
    this.asteroidBelt.visible = zoomLevel >= 1;
    this.kuiperBelt.visible = zoomLevel >= 1;
    this.nearbyStarsGroup.visible = zoomLevel >= 2;
    this.galaxyGroup.visible = zoomLevel >= 3;
  }

  update(time) {
    if (this.asteroidBelt.visible) {
      this.asteroidBelt.rotation.y = time * 0.002;
    }
    if (this.kuiperBelt.visible) {
      this.kuiperBelt.rotation.y = time * 0.0005;
    }
    if (this.milkyWay.visible) {
      this.milkyWay.rotation.y = time * 0.0003;
    }
  }
}
