import * as THREE from 'three';

export class Universe {
  constructor(scene) {
    this.scene = scene;
    this.createBackgroundStars();
    this.createAsteroids();
    
    // Global lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.4);
    this.scene.add(ambientLight);
    
    // Shared noise logic for shaders
    this.glslNoise = `
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + .1); p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(vec3 x) {
            vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                           mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                       mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                           mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        float fbm(vec3 p) {
            float f = 0.0, amp = 0.5;
            for(int i=0; i<4; i++) { f += amp * noise(p); p *= 2.0; amp *= 0.5; }
            return f;
        }
    `;
    
    // Lighting Math
    this.terminatorVertexLogic = `
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `;
    this.terminatorLightMath = `
        vec3 lightDir = normalize(-vWorldPosition); 
        float nDotL = dot(normalize(vWorldNormal), lightDir);
        float light = mix(0.15, 1.0, smoothstep(-0.1, 0.2, nDotL));
    `;
  }

  createBackgroundStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 8000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const c1 = new THREE.Color(0xffffff); 
    const c2 = new THREE.Color(0x93c5fd); 
    const c3 = new THREE.Color(0xfef08a); 

    for (let i = 0; i < starCount; i++) {
        const r = 600 + Math.random() * 1200;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i*3+2] = r * Math.cos(phi);

        const randColor = Math.random();
        let c = c1;
        if(randColor > 0.7) c = c2;
        if(randColor > 0.9) c = c3;

        starColors[i*3] = c.r; starColors[i*3+1] = c.g; starColors[i*3+2] = c.b;
        starSizes[i] = Math.random() * 4.0 + 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    const starMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            attribute float size; varying vec3 vColor;
            void main() {
                vColor = color; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                if(d > 0.5) discard;
                float intensity = pow(1.0 - (d * 2.0), 1.0);
                gl_FragColor = vec4(vColor * intensity * 1.5, intensity);
            }
        `,
        transparent: true, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  createAsteroids() {
    this.asteroidCount = 120;
    const asteroidGeo = new THREE.DodecahedronGeometry(1.5, 1); 
    const asteroidMat = new THREE.MeshStandardMaterial({
        color: 0x666666, roughness: 0.9, metalness: 0.1, flatShading: true 
    });
    this.asteroidMesh = new THREE.InstancedMesh(asteroidGeo, asteroidMat, this.asteroidCount);
    
    this.astOrig = []; this.astRot = []; this.astRotSpd = []; this.astScale = [];
    this.dummy = new THREE.Object3D(); const colorDummy = new THREE.Color();

    for (let i = 0; i < this.asteroidCount; i++) {
        const radius = 50 + Math.random() * 300;
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 200; 
        
        this.astOrig.push(new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta)));
        this.astRot.push(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI));
        this.astRotSpd.push(new THREE.Euler((Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005));
        
        const baseScale = 1.0 + Math.random() * 3.5;
        this.astScale.push(new THREE.Vector3(
            baseScale * (0.6 + Math.random() * 0.8),
            baseScale * (0.5 + Math.random() * 0.5),
            baseScale * (0.6 + Math.random() * 0.8)
        ));
        
        colorDummy.setHSL(0, 0, 0.15 + Math.random() * 0.2);
        this.asteroidMesh.setColorAt(i, colorDummy);
    }
    this.asteroidMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.asteroidMesh);
  }

  update(time) {
    this.asteroidMesh.rotation.y = time * 0.003; 
    for (let i = 0; i < this.asteroidCount; i++) {
        this.astRot[i].x += this.astRotSpd[i].x; 
        this.astRot[i].y += this.astRotSpd[i].y; 
        this.astRot[i].z += this.astRotSpd[i].z;
        this.dummy.position.copy(this.astOrig[i]); 
        this.dummy.rotation.copy(this.astRot[i]); 
        this.dummy.scale.copy(this.astScale[i]);
        this.dummy.updateMatrix(); 
        this.asteroidMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.asteroidMesh.instanceMatrix.needsUpdate = true;
  }
}
