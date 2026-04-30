import * as THREE from 'three';
import './styles/main.css';

import { Renderer } from './engine/Renderer.js';
import { CameraRig } from './engine/CameraRig.js';
import { InputManager } from './engine/InputManager.js';
import { UIManager } from './engine/UIManager.js';
import { AudioEngine } from './engine/AudioEngine.js';

import { Universe } from './entities/Universe.js';
import { StarSystem } from './entities/StarSystem.js';
import { Galaxy } from './entities/Galaxy.js';
import { solarSystemData } from './data/solarSystem.js';
import { zoomOutSections } from './data/zoomOutSections.js';

class App {
  constructor() {
    this.clock = new THREE.Clock();
    
    // Core Engine Setup
    this.renderer = new Renderer('canvas-container');
    this.cameraRig = new CameraRig(this.renderer.camera);
    
    // Entities Setup
    this.universe = new Universe(this.renderer.scene);
    this.solarSystem = new StarSystem(
        this.renderer.scene, 
        solarSystemData, 
        this.universe.glslNoise, 
        this.universe.terminatorVertexLogic, 
        this.universe.terminatorLightMath
    );
    this.galaxy = new Galaxy(this.renderer.scene);

    // Engine Managers — total sections = planets + zoom-out sections
    const totalSections = solarSystemData.length + zoomOutSections.length;
    this.uiManager = new UIManager(totalSections);
    this.uiManager.injectAllSections(solarSystemData, zoomOutSections);
    
    this.inputManager = new InputManager(this.renderer.camera, this.solarSystem.getInteractables());
    this.audioEngine = new AudioEngine();

    // State
    this.activePlanetId = null;
    this.activePlanetData = null;
    this.ORBIT_MULTIPLIER = 4000;  
    this.ROTATION_MULTIPLIER = 12;
    this.MOON_MULTIPLIER = 10;

    this.bindEvents();
    
    // Start first typewriter
    this.uiManager.triggerTypewriter(0);
    
    // Start loop
    this.animate();
  }

  findPlanetDataById(id) {
    return solarSystemData.find(p => p.id === id) || null;
  }

  unfocus() {
    this.activePlanetId = null;
    this.activePlanetData = null;
    this.uiManager.setFocusState(false);
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#init-audio-btn')) {
        this.audioEngine.toggle();
      }
    });

    this.inputManager.onScroll = () => {
      if (this.activePlanetId) {
        this.unfocus();
      }
    };

    this.inputManager.onPlanetClick = (mesh) => {
      if (this.activePlanetId === mesh.userData.id) {
        this.unfocus();
      } else {
        this.activePlanetId = mesh.userData.id;
        this.activePlanetData = this.findPlanetDataById(mesh.userData.id);
        this.uiManager.setFocusState(true, this.activePlanetData);
        this.audioEngine.playUIClick();
      }
    };

    this.inputManager.onBackgroundClick = () => {
      if (this.activePlanetId) {
        this.unfocus();
      }
    };

    this.uiManager.onCloseDashboard = () => {
      this.unfocus();
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activePlanetId) {
        this.unfocus();
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Update Input state
    this.inputManager.update();
    
    // 2. Update UI
    this.uiManager.updateCursor();
    this.uiManager.updateScrollSection(this.inputManager.scrollFraction);

    // 3. Update Audio
    this.audioEngine.updateWarpSound(this.inputManager.targetScrollVelocity);

    // 4. Mouse parallax
    this.cameraRig.updateMouseParallax(this.inputManager.mouseNormX, this.inputManager.mouseNormY);

    // 5. Update Universe & System
    this.universe.update(time);
    this.solarSystem.update(time, delta, this.activePlanetId, this.ORBIT_MULTIPLIER, this.ROTATION_MULTIPLIER, this.MOON_MULTIPLIER);

    // 6. Update Camera Rig — now handles zoom-out sections too
    this.cameraRig.update(
        delta, 
        this.inputManager.scrollFraction, 
        this.inputManager.targetScrollVelocity, 
        this.solarSystem.getPlanetsData(), 
        this.activePlanetId, 
        time,
        zoomOutSections
    );

    // 7. Update Galaxy visibility based on zoom level
    this.galaxy.updateVisibility(this.cameraRig.currentZoomLevel);
    this.galaxy.update(time);

    // 8. Render
    this.renderer.update(delta);
  }
}

window.onload = () => {
  new App();
};
