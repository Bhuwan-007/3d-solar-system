import * as THREE from 'three';

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.targetPos = new THREE.Vector3(0, 30, 80);
    this.targetLook = new THREE.Vector3(0, 0, 0);
    this.smoothPos = new THREE.Vector3(0, 30, 80);
    this.smoothLook = new THREE.Vector3(0, 0, 0);
    
    // Base orbital angle
    this.camTheta = 3.5;
    this.camPhi = Math.PI / 2.5;
    
    // Mouse parallax
    this.mouseNormX = 0;
    this.mouseNormY = 0;
    
    this.smoothScrollVelocity = 0;
    this.currentZoomLevel = 0; // 0=planets, 1=solar overview, 2=neighborhood, 3=galaxy
  }

  updateMouseParallax(normX, normY) {
    this.mouseNormX += (normX - this.mouseNormX) * 0.06;
    this.mouseNormY += (normY - this.mouseNormY) * 0.06;
  }

  getCameraTarget(planet, isFocused, time) {
    let targetDist = isFocused ? Math.max(planet.r * 2.5, (planet.maxMoonDist || 0) * 1.5 + 2) : (planet.r * 6 + 6);
    if (planet.id === 'sun') targetDist = isFocused ? 20 : 32;

    const parallaxTheta = this.mouseNormX * 0.8;
    const parallaxPhi = this.mouseNormY * 0.4;
    
    const finalTheta = planet.bodyRef.orbitAngle + this.camTheta + parallaxTheta;
    const finalPhi = Math.max(0.2, Math.min(Math.PI - 0.2, this.camPhi + parallaxPhi));
    
    const offsetX = targetDist * Math.sin(finalPhi) * Math.cos(finalTheta);
    const offsetY = targetDist * Math.cos(finalPhi);
    const offsetZ = targetDist * Math.sin(finalPhi) * Math.sin(finalTheta);

    const worldPos = new THREE.Vector3();
    planet.bodyRef.meshGroup.getWorldPosition(worldPos);

    return new THREE.Vector3(
      worldPos.x + offsetX, 
      worldPos.y + offsetY, 
      worldPos.z + offsetZ
    );
  }

  /**
   * Main update. Now handles both planet-level scrolling and zoom-out phases.
   * @param {number} scrollFraction - 0 to 1 across the entire scroll
   * @param {number} planetCount - number of planet sections
   * @param {Array} zoomOutSections - the zoom-out section configs
   * @param {Array} allEntities - array containing both planets and stars for focusing
   */
  update(delta, scrollFraction, targetScrollVelocity, planets, activePlanetId, time, zoomOutSections, allEntities = []) {
    // Scroll FOV Warp
    this.smoothScrollVelocity += (Math.abs(targetScrollVelocity) - this.smoothScrollVelocity) * 0.05;
    const targetFov = 45 + Math.min(this.smoothScrollVelocity * 0.3, 30); 
    this.camera.fov += (targetFov - this.camera.fov) * 0.08;
    this.camera.updateProjectionMatrix();

    const totalSections = planets.length + zoomOutSections.length;
    const continuousSection = scrollFraction * (totalSections - 1);
    const currentSectionIdx = Math.floor(continuousSection);
    let t = continuousSection - currentSectionIdx;
    t = t * t * t * (t * (t * 6 - 15) + 10); // quintic ease

    if (currentSectionIdx < planets.length - 1) {
      // ========== PLANET SECTIONS ==========
      this.currentZoomLevel = 0;
      
      const secA = currentSectionIdx;
      const secB = Math.min(secA + 1, planets.length - 1);

      const posA = this.getCameraTarget(planets[secA], activePlanetId === planets[secA].id, time);
      const posB = this.getCameraTarget(planets[secB], activePlanetId === planets[secB].id, time);
      this.targetPos.copy(posA).lerp(posB, t);

      const lookA = new THREE.Vector3();
      planets[secA].bodyRef.meshGroup.getWorldPosition(lookA);
      
      const lookB = new THREE.Vector3();
      planets[secB].bodyRef.meshGroup.getWorldPosition(lookB);
      
      this.targetLook.copy(lookA).lerp(lookB, t);

    } else {
      // ========== TRANSITION & ZOOM-OUT SECTIONS ==========
      const zoomIdx = currentSectionIdx - (planets.length - 1);
      let baseTargetPos = new THREE.Vector3();
      let baseTargetLook = new THREE.Vector3();
      
      if (zoomIdx === 0) {
        // Transitioning from last planet (Pluto) to first zoom-out section
        const lastPlanet = planets[planets.length - 1];
        const planetPos = this.getCameraTarget(lastPlanet, false, time);
        
        const planetLook = new THREE.Vector3();
        lastPlanet.bodyRef.meshGroup.getWorldPosition(planetLook);
        
        const zoomSection = zoomOutSections[0];
        const zoomPos = new THREE.Vector3(zoomSection.cameraPos.x, zoomSection.cameraPos.y, zoomSection.cameraPos.z);
        const zoomLook = new THREE.Vector3(zoomSection.cameraLook.x, zoomSection.cameraLook.y, zoomSection.cameraLook.z);
        
        // Add parallax dynamically based on view distance
        const zoomDist = zoomPos.distanceTo(zoomLook);
        zoomPos.x += this.mouseNormX * (zoomDist * 0.1);
        zoomPos.z += this.mouseNormY * (zoomDist * 0.06);
        
        baseTargetPos = new THREE.Vector3().copy(planetPos).lerp(zoomPos, t);
        baseTargetLook = new THREE.Vector3().copy(planetLook).lerp(zoomLook, t);
        this.currentZoomLevel = t > 0.3 ? zoomSection.zoomLevel : 0;
        
      } else {
        // Between zoom-out sections
        const idxA = Math.min(zoomIdx - 1, zoomOutSections.length - 1);
        const idxB = Math.min(zoomIdx, zoomOutSections.length - 1);
        
        const sA = zoomOutSections[idxA];
        const sB = zoomOutSections[idxB];
        
        const posA = new THREE.Vector3(sA.cameraPos.x, sA.cameraPos.y, sA.cameraPos.z);
        const posB = new THREE.Vector3(sB.cameraPos.x, sB.cameraPos.y, sB.cameraPos.z);
        const lookA = new THREE.Vector3(sA.cameraLook.x, sA.cameraLook.y, sA.cameraLook.z);
        const lookB = new THREE.Vector3(sB.cameraLook.x, sB.cameraLook.y, sB.cameraLook.z);
        
        // Parallax scales automatically with distance so it works at galaxy and supercluster scale!
        const distB = posB.distanceTo(lookB);
        posB.x += this.mouseNormX * (distB * 0.1);
        posB.z += this.mouseNormY * (distB * 0.06);
        
        const distA = posA.distanceTo(lookA);
        posA.x += this.mouseNormX * (distA * 0.1);
        posA.z += this.mouseNormY * (distA * 0.06);
        
        baseTargetPos = new THREE.Vector3().copy(posA).lerp(posB, t);
        baseTargetLook = new THREE.Vector3().copy(lookA).lerp(lookB, t);
        this.currentZoomLevel = t > 0.5 ? sB.zoomLevel : sA.zoomLevel;
      }

      // If a nearby star is clicked during any of the stellar neighborhood zoom sections
      // Wait, we don't need this specific activePlanetId override for stars if the 
      // whole scrolling system swaps to the active star system! 
      // I should remove this activePlanetId override here entirely, as it will be handled by the main planet sections when the UI swaps context!
      // But let's leave it in case we are in zoom-out and want to smoothly zoom into the star before the scroll fraction updates.
      // Actually, if we swap context, currentSectionIdx will be 0 (Star), which uses the PLANET SECTIONS logic!
      // So we don't need this override here anymore if we fully swap context! Let's remove it to keep it clean.
      this.targetPos.copy(baseTargetPos);
      this.targetLook.copy(baseTargetLook);
    }

    // Smooth camera interpolation — slower for big movements
    const dist = this.smoothPos.distanceTo(this.targetPos);
    const lerpSpeed = dist > 100 ? 0.02 : 0.04;
    
    this.smoothPos.lerp(this.targetPos, lerpSpeed);
    this.smoothLook.lerp(this.targetLook, lerpSpeed + 0.02);
    
    this.camera.position.copy(this.smoothPos);
    this.camera.lookAt(this.smoothLook);
    
    return this.camera.position.distanceTo(this.smoothLook);
  }
}
