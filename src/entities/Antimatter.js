import * as THREE from 'three';

export class Antimatter {
  constructor(config) {
    this.config = config;
    this.meshGroup = new THREE.Group();
    this.meshGroup.position.set(config.position.x, config.position.y, config.position.z);
    
    // Antimatter is not interactive for now, just purely visual hazards.
    this.createFermiBubbles();
  }

  createFermiBubbles() {
    // Erupting perpendicularly (Up and Down on Y axis)
    const radius = this.config.radius;
    const height = radius * 3.0; // Elongated
    
    const geo = new THREE.SphereGeometry(radius, 64, 64);
    
    // We scale the spheres to be elongated bubbles
    geo.scale(1.0, 2.5, 1.0);

    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform vec3 colorTop;
      uniform vec3 colorBottom;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        // Fresnel effect for smooth, ghostly edges
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = dot(normal, viewDir);
        fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
        fresnel = pow(fresnel, 3.0); // Make it highly transparent in the center, glowing at edges
        
        // Vertical gradient
        // Since we scale the sphere, world y is roughly related to normal.y or we can use local position
        // But for simplicity, let's mix the colors using a slow time pulse
        float mixVal = sin(time * 0.5) * 0.5 + 0.5;
        vec3 baseColor = mix(colorTop, colorBottom, mixVal);
        
        // Eerie smooth emission
        gl_FragColor = vec4(baseColor, fresnel * 0.3); // Max 30% opacity
      }
    `;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorTop: { value: new THREE.Color(0x00ffff) }, // Cyan
        colorBottom: { value: new THREE.Color(0xff00ff) } // Magenta
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Top Bubble
    const topBubble = new THREE.Mesh(geo, this.material);
    topBubble.position.y = height * 0.8;
    this.meshGroup.add(topBubble);

    // Bottom Bubble
    const bottomBubble = new THREE.Mesh(geo, this.material);
    bottomBubble.position.y = -height * 0.8;
    this.meshGroup.add(bottomBubble);
  }

  update(time) {
    if (this.material) {
      this.material.uniforms.time.value = time;
    }
  }
}
