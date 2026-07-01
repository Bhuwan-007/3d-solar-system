import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class Renderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020203, 0.00000005); // Massively reduced for supercluster visibility
    
    // Camera — far plane reverted to 15m to fix depth artifacting
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 15000000);
    
    // Camera headlamp — strong enough to illuminate moons at distance
    this.cameraLight = new THREE.PointLight(0xffffff, 3.0, 600);
    this.cameraLight.position.set(0, 0, 0); // at camera position
    this.camera.add(this.cameraLight);
    
    // Also add a dim hemisphere light so nothing is ever pitch black
    const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x222244, 0.6);
    this.scene.add(hemiLight);
    
    this.scene.add(this.camera); // camera must be in scene for child lights to work
    
    // Renderer
    this.webgl = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.webgl.setSize(window.innerWidth, window.innerHeight);
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.toneMapping = THREE.ACESFilmicToneMapping;
    this.webgl.toneMappingExposure = 1.0;
    this.container.appendChild(this.webgl.domElement);

    // Post-Processing
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.15, 0.6, 0.2);

    this.composer = new EffectComposer(this.webgl);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  update(delta) {
    this.composer.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.webgl.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
