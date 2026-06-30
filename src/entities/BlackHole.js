import * as THREE from 'three';

export class BlackHole {
  constructor(config, glslNoise) {
    this.config = config;
    this.meshGroup = new THREE.Group();
    this.meshGroup.position.set(config.position.x, config.position.y, config.position.z);
    
    this.meshGroup.userData = { id: config.id, isBlackHole: true };

    this.createEventHorizon();
    this.createPhotonRing();
    this.createGravitationalLensing();
    this.createAccretionDisk(glslNoise);
    
    if (this.config.hasJet) {
      this.createPlasmaJets();
    }
    
    this.createLabel();
  }

  createEventHorizon() {
    // Pure black sphere for the singularity/event horizon
    const geo = new THREE.SphereGeometry(this.config.radius, 64, 64);
    // DepthWrite true so it blocks things behind it properly
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true });
    this.eventHorizon = new THREE.Mesh(geo, mat);
    this.eventHorizon.renderOrder = 0; // Render first
    this.meshGroup.add(this.eventHorizon);
  }

  createPhotonRing() {
    // A brilliant, searing ring of light just outside the event horizon
    const geo = new THREE.SphereGeometry(this.config.radius * 1.05, 64, 64);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0xffcc88, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide 
    });
    this.photonRing = new THREE.Mesh(geo, mat);
    this.photonRing.renderOrder = 1;
    this.meshGroup.add(this.photonRing);
  }

  createGravitationalLensing() {
    // Thicker, stronger transmission for aggressive warping
    // Remove buggy transmission to fix flickering when cursor moves (mouse parallax)
    const geo = new THREE.SphereGeometry(this.config.radius * 2.5, 64, 64);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    this.lensingSphere = new THREE.Mesh(geo, mat);
    this.lensingSphere.renderOrder = 3; // Render LAST so it refracts everything behind it
    this.meshGroup.add(this.lensingSphere);
  }

  createAccretionDisk(glslNoise) {
    // Interstellar-style high-energy disk
    const geo = new THREE.RingGeometry(this.config.radius * 1.4, this.config.accretionRadius, 128);
    
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vLocalPosition;
      void main() {
        vUv = uv;
        vLocalPosition = position; // RingGeometry is flat on XY plane
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      ${glslNoise}
      uniform float time;
      uniform vec3 baseColor;
      varying vec2 vUv;
      varying vec3 vLocalPosition;
      
      void main() {
        float dist = vUv.y; // 0.0 at inner edge, 1.0 at outer edge
        
        // RingGeometry is on the XY plane, so we use y and x for the angle
        float angle = atan(vLocalPosition.y, vLocalPosition.x);
        
        // Multi-octave swirling gas noise
        float n1 = fbm(vec3(angle * 10.0 - time * 3.0, dist * 15.0, time * 0.5));
        float n2 = fbm(vec3(angle * 20.0 + time * 5.0, dist * 25.0, -time));
        float swirl = (n1 * 0.6 + n2 * 0.4);
        
        // Searing white/blue at inner edge, fading to orange/red at outer
        vec3 coreColor = vec3(1.0, 0.95, 0.8);
        vec3 outerColor = baseColor;
        vec3 finalColor = mix(coreColor, outerColor, dist + swirl * 0.3);
        
        // Intense glow at the inner edge, fading smoothly
        float intensity = pow(1.0 - dist, 2.0);
        finalColor += coreColor * intensity * 2.0;
        
        // Edge fading
        float alpha = smoothstep(0.0, 0.05, dist) * smoothstep(1.0, 0.6, dist);
        
        // Gas clumping
        alpha *= (0.3 + swirl * 0.7);
        
        // Doppler Beaming effect (one side approaches, one side recedes)
        // Makes one side of the disk appear vastly brighter and bluer
        float doppler = sin(angle - 0.5) * 0.5 + 0.5; 
        finalColor += vec3(0.2, 0.4, 0.6) * doppler * intensity;
        alpha *= 0.5 + doppler * 1.5;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    this.diskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(this.config.uiColor === 'red' ? 0xff4400 : 0xff7700) }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.accretionDisk = new THREE.Mesh(geo, this.diskMaterial);
    this.accretionDisk.renderOrder = 2; // Render after photon ring, before lensing
    
    // Tilt the disk for a cinematic angle
    this.accretionDisk.rotation.x = Math.PI / 2 + 0.15;
    this.accretionDisk.rotation.y = 0.1;
    
    this.meshGroup.add(this.accretionDisk);
  }

  createPlasmaJets() {
    // Relativistic jets shooting from poles
    const geo = new THREE.CylinderGeometry(this.config.radius * 0.5, this.config.radius * 0.1, this.config.radius * 30, 32, 32, true);
    
    // A turbulent volume shader using simplex noise
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPos;
      
      // Simplex 3D Noise
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

      void main() {
        // High speed turbulence moving UP the jet
        float noise = snoise(vec3(vUv.x * 10.0, vUv.y * 5.0 - time * 5.0, time));
        
        // Intensity fades at edges (x) and ends (y)
        float edgeFade = sin(vUv.x * 3.14159);
        float endFade = sin(vUv.y * 3.14159);
        
        float intensity = (noise * 0.5 + 0.5) * edgeFade * endFade;
        
        // Extremely bright blue/white core fading to purple edges
        vec3 coreColor = vec3(1.0, 1.0, 1.0);
        vec3 edgeColor = vec3(0.2, 0.4, 1.0);
        
        vec3 finalColor = mix(edgeColor, coreColor, intensity * intensity);
        
        if (intensity < 0.1) discard;
        
        gl_FragColor = vec4(finalColor, intensity * 0.8);
      }
    `;

    this.jetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.plasmaJets = new THREE.Mesh(geo, this.jetMaterial);
    this.plasmaJets.renderOrder = 2; // With accretion disk
    
    // Rotate to shoot out of poles (Y axis) instead of equator
    this.meshGroup.add(this.plasmaJets);
  }

  createLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Text only, no solid background pill to avoid the "black screen" overlap effect
    ctx.shadowColor = this.config.uiColor === 'red' ? '#ff0000' : '#00aaff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff'; 
    ctx.font = 'bold 72px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.kicker + ': ' + this.config.name, 512, 100);
    
    // Draw caret pointing down
    ctx.fillStyle = this.config.uiColor === 'red' ? '#ff4444' : '#44aaff';
    ctx.beginPath();
    ctx.moveTo(482, 160);
    ctx.lineTo(542, 160);
    ctx.lineTo(512, 220);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 1.0, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2400, 600, 1); // Absolutely massive
    sprite.position.y = this.config.accretionRadius + 2000; 
    sprite.renderOrder = 4; // Render above everything
    
    this.meshGroup.add(sprite);
  }

  update(time) {
    if (this.eventHorizon) {
      this.meshGroup.rotation.y = time * this.config.spinSpeed;
      this.meshGroup.rotation.x = time * this.config.spinSpeed * 0.5;
    }
    
    if (this.diskMaterial) {
      this.diskMaterial.uniforms.time.value = time * this.config.spinSpeed * 2.0;
    }
    
    if (this.accretionDisk) {
      this.accretionDisk.rotation.z -= 0.003;
    }

    if (this.jetMaterial) {
      this.jetMaterial.uniforms.time.value = time * this.config.spinSpeed * 10.0; // Jet flows much faster
    }
  }
}
