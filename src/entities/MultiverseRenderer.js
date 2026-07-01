import * as THREE from 'three';
export class MultiverseRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;

    // Add to scene
    this.scene.add(this.group);

    this.createCosmicFoam();
    this.createVoidTendrils();
    this.createLabel();
  }
  createLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Our Universe', 1024, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 1.0, depthWrite: false, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);

    sprite.scale.set(4000000, 500000, 1);
    sprite.renderOrder = 999;
    sprite.position.set(0, 1500000, 0); // Above our home bubble

    this.group.add(sprite);
  }
  createCosmicFoam() {
    const totalBubbles = 1000;

    // Low-poly sphere geometry for instancing
    const geo = new THREE.IcosahedronGeometry(1, 4);

    // Custom Shader for iridescence, fake refraction, and shifting colors
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vInstanceColor;
        varying float vPhase;
        void main() {
          #ifdef USE_INSTANCING_COLOR
            vInstanceColor = instanceColor;
          #else
            vInstanceColor = vec3(1.0);
          #endif
          
          #ifdef USE_INSTANCING
            // Use translation part of instanceMatrix for phase offset
            vPhase = instanceMatrix[3][0] * 0.000001;
            vec4 mvPosition = viewMatrix * instanceMatrix * vec4(position, 1.0);
            
            // Transform normal for the fragment shader (rim lighting)
            vNormal = normalize((modelViewMatrix * instanceMatrix * vec4(normal, 0.0)).xyz);
          #else
            vPhase = 0.0;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
          #endif
          
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vInstanceColor;
        varying float vPhase;
        
        // Simplex noise helper for organic surface rippling
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
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          // Calculate Fresnel effect (rim lighting)
          float fresnel = dot(viewDir, normal);
          fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
          fresnel = pow(fresnel, 3.0);
          
          // Calculate thin-film interference (Iridescence)
          // The color shifts based on the viewing angle and time
          float interference = snoise(normal * 3.0 + time * 0.1 + vPhase);
          vec3 iridescence = vec3(
            0.5 + 0.5 * sin(fresnel * 10.0 + interference + 0.0),
            0.5 + 0.5 * sin(fresnel * 10.0 + interference + 2.0),
            0.5 + 0.5 * sin(fresnel * 10.0 + interference + 4.0)
          );
          
          // Combine base instance color with the iridescent rim
          vec3 finalColor = mix(vInstanceColor * 0.1, iridescence, fresnel);
          
          // Add a pulsating "core" glow that is distinct for each universe
          // Very subtle core glow so it isn't too bright
          float coreGlow = snoise(vec3(vPhase * 10.0, time * 0.2, 0.0)) * 0.2 + 0.2;
          finalColor += vInstanceColor * coreGlow * 0.1 * (1.0 - fresnel);
          // Alpha blending - almost completely transparent in center, distinct iridescent rim
          float alpha = mix(0.01, 0.7, fresnel);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide // Front side looks cleaner for transparent bubbles
    });
    this.foamMesh = new THREE.InstancedMesh(geo, mat, totalBubbles);

    // Colors representing different physical constants
    const colors = [
      new THREE.Color(0xff44aa), // Magenta/Pink
      new THREE.Color(0x44ffaa), // Cyan/Mint
      new THREE.Color(0xaa44ff), // Purple
      new THREE.Color(0xffaa44), // Gold
      new THREE.Color(0x44aaff)  // Blue
    ];
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // For inner galaxies
    const allGalaxyPositions = [];
    const allGalaxyColors = [];

    for (let i = 0; i < totalBubbles; i++) {
      let px, py, pz, radius;

      if (i === 0) {
        // Our Universe (Home Bubble)
        px = 0; py = 0; pz = 0;
        radius = 1000000;
        color.setHex(0xaa44ff); // Our purple-ish tint
      } else {
        // Spread bubbles densely around the bulk
        px = (Math.random() - 0.5) * 60000000;
        py = (Math.random() - 0.5) * 60000000;
        pz = (Math.random() - 0.5) * 60000000;
        radius = 500000 + Math.random() * 1500000;

        color.copy(colors[Math.floor(Math.random() * colors.length)]);
      }
      dummy.position.set(px, py, pz);

      // Random rotation
      dummy.rotation.x = Math.random() * Math.PI;
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.rotation.z = Math.random() * Math.PI;

      dummy.scale.set(radius, radius, radius);
      dummy.updateMatrix();

      this.foamMesh.setMatrixAt(i, dummy.matrix);
      this.foamMesh.setColorAt(i, color);

      // Generate inner galaxies for this bubble
      const innerGalaxiesCount = 200 + Math.random() * 300;
      for (let g = 0; g < innerGalaxiesCount; g++) {
        // Random point inside sphere
        const r = radius * 0.9 * Math.cbrt(Math.random()); // 0.9 to keep inside the rim
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        const gx = px + r * Math.sin(phi) * Math.cos(theta);
        const gy = py + r * Math.cos(phi);
        const gz = pz + r * Math.sin(phi) * Math.sin(theta);

        allGalaxyPositions.push(gx, gy, gz);

        // Galaxies inherit the universe's physics constant (base color) but with some noise
        //const tint = new THREE.Color().copy(color);
        //tint.lerp(new THREE.Color(0xffffff), Math.random() * 0.5);
        // Galaxies get completely random colors instead of inheriting the universe tint
        const tint = new THREE.Color();
        tint.setHSL(Math.random(), 0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.5);
        allGalaxyColors.push(tint.r, tint.g, tint.b);
      }
    }

    this.foamMesh.instanceMatrix.needsUpdate = true;
    if (this.foamMesh.instanceColor) this.foamMesh.instanceColor.needsUpdate = true;

    this.foamMesh.frustumCulled = false;
    this.group.add(this.foamMesh);

    // Build the inner galaxies Points mesh
    const innerGeo = new THREE.BufferGeometry();
    innerGeo.setAttribute('position', new THREE.Float32BufferAttribute(allGalaxyPositions, 3));
    innerGeo.setAttribute('color', new THREE.Float32BufferAttribute(allGalaxyColors, 3));

    const innerMat = new THREE.PointsMaterial({
      size: 40000, // Size of tiny galaxies at this scale
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const innerPoints = new THREE.Points(innerGeo, innerMat);
    innerPoints.frustumCulled = false;
    this.group.add(innerPoints);
  }
  createVoidTendrils() {
    // Ultra-high-frequency dark energy tendrils pushing the bubbles apart
    const particleCount = 200000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80000000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80000000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80000000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.tendrilUniforms = {
      time: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.tendrilUniforms,
      vertexShader: `
        uniform float time;
        varying float vAlpha;
        
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
          vec3 pos = position;
          
          // High frequency crackling animation
          float noise = snoise(pos * 0.0000001 + time * 0.5);
          
          // Tendrils clump together dynamically
          pos.x += snoise(pos.xyz * 0.0000002 + time * 0.1) * 200000.0;
          pos.y += snoise(pos.yzx * 0.0000002 + time * 0.1) * 200000.0;
          pos.z += snoise(pos.zxy * 0.0000002 + time * 0.1) * 200000.0;
          
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          
          // Flicker
          vAlpha = (noise + 1.0) * 0.5;
          vAlpha = pow(vAlpha, 3.0); // Sharpen the tendrils
          
          gl_PointSize = (2000000.0 / -mvPos.z) * vAlpha;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          // Circular particle
          vec2 coord = gl_PointCoord - vec2(0.5);
          if (length(coord) > 0.5) discard;
          
          // Pitch black void laced with ultra-bright dark energy
          gl_FragColor = vec4(0.8, 0.0, 1.0, vAlpha * 0.4);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.tendrils = new THREE.Points(geometry, material);
    this.tendrils.frustumCulled = false;
    this.group.add(this.tendrils);
  }
  updateVisibility(zoomLevel) {
    this.group.visible = zoomLevel >= 6;
  }
  update(time) {
    if (!this.group.visible) return;

    // Slow rotation of the bulk
    this.group.rotation.y = time * 0.00002;
    this.group.rotation.x = time * 0.00001;

    if (this.foamMesh) {
      this.foamMesh.material.uniforms.time.value = time;
    }

    if (this.tendrils) {
      this.tendrils.material.uniforms.time.value = time;
    }
  }
}