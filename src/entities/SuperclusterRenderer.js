import * as THREE from 'three';
import { superclustersData } from '../data/superclusters.js';
import { extremePhenomenaData } from '../data/extremePhenomena.js';
import { BlackHole } from './BlackHole.js';

export class SuperclusterRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    
    // We only show this group when zoomLevel === 5
    this.group.visible = false;
    this.scene.add(this.group);
    
    this.createInstancedGalaxies();
    this.createDarkMatterFilaments();
    this.createTitanBlackHole();
    this.createLabels();
  }

  createLabels() {
    superclustersData.forEach(cluster => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      ctx.shadowColor = cluster.uiColor === 'cyan' ? '#00ffff' : '#ff00ff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff'; 
      ctx.font = 'bold 80px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cluster.kicker + ': ' + cluster.name, 1024, 128);
      
      const texture = new THREE.CanvasTexture(canvas);
      // Ensure depthTest is false so labels are never hidden by anything
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 1.0, depthWrite: false, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      
      sprite.scale.set(200000, 25000, 1); // Aspect ratio 8:1
      sprite.renderOrder = 999; // Ensure labels always render on top
      sprite.position.set(
        Math.cos(cluster.angle) * cluster.dist,
        cluster.yOffset + cluster.radius * 0.4, // Reduced offset so Laniakea is not above the camera's FOV
        Math.sin(cluster.angle) * cluster.dist
      );
      
      this.group.add(sprite);
    });
  }

  createTitanBlackHole() {
    const m87Config = extremePhenomenaData.blackHoles.find(bh => bh.id === 'm87-titan');
    if (m87Config) {
      // Create a massive simplex noise texture generator for the black hole
      const glslNoise = `
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
      `;
      this.m87 = new BlackHole(m87Config, glslNoise);
      this.group.add(this.m87.meshGroup);
    }
  }

  createInstancedGalaxies() {
    const totalGalaxies = 25000; // Increased for more density
    
    // A simple plane geometry for a galaxy sprite
    const geo = new THREE.PlaneGeometry(1, 1);
    
    // Create a procedural glowing galaxy texture for the instanced mesh
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 220, 200, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Reverting to the universally stable MeshBasicMaterial.
    // We will use group rotation for movement instead of custom shaders.
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    this.instancedMesh = new THREE.InstancedMesh(geo, mat, totalGalaxies);
    
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    let i = 0;
    const virgo = superclustersData.find(s => s.id === 'virgo-supercluster');
    const laniakea = superclustersData.find(s => s.id === 'laniakea');
    
    const virgoPos = new THREE.Vector3(
      Math.cos(virgo.angle) * virgo.dist,
      virgo.yOffset,
      Math.sin(virgo.angle) * virgo.dist
    );
    
    const laniakeaPos = new THREE.Vector3(
      Math.cos(laniakea.angle) * laniakea.dist,
      laniakea.yOffset,
      Math.sin(laniakea.angle) * laniakea.dist
    );

    // Distribution arrays
    const tints = [
      new THREE.Color(0xffaa55), // Old elliptical
      new THREE.Color(0x88ccff), // Young spiral
      new THREE.Color(0xffffff), // Standard
      new THREE.Color(0xff5555)  // Red shifted
    ];
    
    // Generate 25 random cluster centers for the cosmic web spread wider
    const randomClusters = [];
    for(let j=0; j<25; j++) {
      randomClusters.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 3500000,
          (Math.random() - 0.5) * 800000,
          (Math.random() - 0.5) * 3500000
        ),
        radius: 100000 + Math.random() * 300000
      });
    }

    while (i < totalGalaxies) {
      let centerPos, radius;
      
      // 20% in Virgo, 20% in Laniakea, 30% in random clusters, 30% scattered freely (fills empty spaces)
      const rand = Math.random();
      if (rand < 0.2) {
        centerPos = virgoPos;
        radius = virgo.radius * (0.1 + Math.pow(Math.random(), 2) * 0.9);
      } else if (rand < 0.4) {
        centerPos = laniakeaPos;
        radius = laniakea.radius * (0.1 + Math.pow(Math.random(), 2) * 0.9);
      } else if (rand < 0.7) {
        const rc = randomClusters[Math.floor(Math.random() * randomClusters.length)];
        centerPos = rc.pos;
        radius = rc.radius * (0.1 + Math.pow(Math.random(), 2) * 0.9);
      } else {
        // Intergalactic space - use spherical distribution as it creates a much better web
        centerPos = new THREE.Vector3(
          Math.random() > 0.8 ? 500000 : 0, // 20% bias towards positive X (right side)
          Math.random() > 0.8 ? -300000 : 0, // 20% bias towards negative Y (bottom)
          Math.random() > 0.8 ? 300000 : 0  // 20% bias towards positive Z (right side)
        );
        radius = 2500000 * Math.random();
      }

      let px, py, pz;
      
      if (centerPos !== null) {
        // Spherical distribution for the actual clusters
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        px = centerPos.x + radius * Math.sin(phi) * Math.cos(theta);
        py = centerPos.y + radius * Math.cos(phi) * 0.3; // Flattened clusters
        pz = centerPos.z + radius * Math.sin(phi) * Math.sin(theta);
      }

      dummy.position.set(px, py, pz);
      
      // Random rotation to face all directions
      dummy.rotation.x = Math.random() * Math.PI;
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.rotation.z = Math.random() * Math.PI;
      
      // Galaxy scale ranges from 1500 to 5000
      const scale = 1500 + Math.random() * 3500;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, dummy.matrix);
      
      // Color
      color.copy(tints[Math.floor(Math.random() * tints.length)]);
      this.instancedMesh.setColorAt(i, color);
      
      i++;
    }
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;
    
    // Crucial for performance and visibility
    this.instancedMesh.frustumCulled = false;
    
    this.group.add(this.instancedMesh);
  }

  createDarkMatterFilaments() {
    // We will render massive dark matter webs spanning the superclusters
    const particleCount = 200000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);
    
    let i = 0;
    while (i < particleCount) {
      // Span across a 2-million unit cube covering Virgo and Laniakea
      const x = (Math.random() - 0.5) * 2000000;
      const y = (Math.random() - 0.5) * 2000000;
      const z = (Math.random() - 0.5) * 2000000;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      alphas[i] = Math.random();
      i++;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const vertexShader = `
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      float snoise(vec3 v){ 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      attribute float alpha;
      varying float vAlpha;
      uniform float time;

      void main() {
        vec3 pos = position;
        
        // Massive scale noise for filaments
        float noiseVal = snoise(pos * 0.000003 + time * 0.02);
        
        // Create thin tendrils by slicing the noise
        float tendril = smoothstep(0.4, 0.6, abs(noiseVal));
        
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPos;
        
        vAlpha = alpha * tendril;
        // Massive size to be visible at zoom level 5
        gl_PointSize = (400000.0 / -mvPos.z) * tendril;
      }
    `;

    const fragmentShader = `
      uniform vec3 baseColor;
      varying float vAlpha;
      void main() {
        if (vAlpha < 0.05) discard;
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;
        
        // Boost brightness by 5-10% as requested
        gl_FragColor = vec4(baseColor, vAlpha * 0.40); 
      }
    `;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0xaa44ff) } // Glowing dark matter
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  updateVisibility(zoomLevel) {
    // Only visible at Supercluster scale
    this.group.visible = zoomLevel >= 5;
  }

  update(time) {
    if (!this.group.visible) return;
    
    // Slowly rotate the entire supercluster structure for a majestic drifting effect
    this.group.rotation.y = time * 0.00003;

    if (this.material) {
      this.material.uniforms.time.value = time;
    }
    
    if (this.m87) {
      this.m87.update(time);
    }
  }
}
