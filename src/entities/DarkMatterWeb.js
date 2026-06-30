import * as THREE from 'three';

export class DarkMatterWeb {
  constructor(nodes) {
    this.meshGroup = new THREE.Group();
    this.createVolumetricWeb();
  }

  createVolumetricWeb() {
    // Generate a massive, universe-spanning point cloud
    const particleCount = 250000; // Drastically optimized for 60fps
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);
    
    // We want the dark matter to span the entire screen infinitely
    let i = 0;
    while (i < particleCount) {
      // Random position in a huge bounding box covering the Local Group view
      const x = (Math.random() - 0.3) * 60000;
      const y = (Math.random() - 0.5) * 40000;
      const z = (Math.random() - 0.3) * 60000;
      
      // Simple custom distance falloff to cluster near galaxies, 
      // but we want it everywhere, just clumped. We'll rely on the shader for noise clumping.
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      alphas[i] = Math.random(); // Base alpha
      i++;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    // Custom shader to only show points where 3D noise is high (creating thin tendrils)
    const vertexShader = `
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
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 1.0/7.0; // N=7
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  
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
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }
      
      attribute float alpha;
      varying float vAlpha;
      uniform float time;

      void main() {
        // Calculate noise based on world position
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        
        // Multi-octave noise to create intricate tendrils
        // Lower frequency for longer, screen-spanning webs
        float n = snoise(worldPos.xyz * 0.00005 + time * 0.01) * 0.5 + 0.5;
        float n2 = snoise(worldPos.xyz * 0.00015 - time * 0.005) * 0.5 + 0.5;
        
        // Combine noises. Only where both are high, we get a tendril.
        float tendril = n * n2;
        
        // If it's not part of a tendril, make it completely transparent
        // We lower the threshold so more of the web is visible across the screen
        vAlpha = smoothstep(0.2, 0.5, tendril) * alpha * 0.35; // 35% max opacity
        
        // Size variation
        gl_PointSize = 40.0 * tendril * (10000.0 / - (viewMatrix * worldPos).z);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      uniform vec3 baseColor;
      varying float vAlpha;
      void main() {
        if (vAlpha < 0.05) discard;
        // Soft circle
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;
        
        gl_FragColor = vec4(baseColor, vAlpha * 0.4); // Boosted opacity
      }
    `;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0xaa66ff) } // Brighter, more visible purple
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false; // Never hide this massive web
    this.meshGroup.add(this.points);
  }

  update(time) {
    if (this.material) {
      this.material.uniforms.time.value = time;
    }
  }
}
