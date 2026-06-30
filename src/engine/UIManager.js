export class UIManager {
  constructor(totalSections) {
    this.totalSections = totalSections;
    this.currentSection = 0;
    
    // Elements
    this.dotsContainer = document.getElementById('nav-dots');
    this.focusHint = document.getElementById('focus-hint');
    this.cursorDot = document.getElementById('cursor-dot');
    this.cursorRing = document.getElementById('cursor-ring');
    this.dashboard = document.getElementById('planet-dashboard');
    this.scrollContainer = document.getElementById('scroll-container');
    this.dashboardContainer = document.getElementById('dashboard-container');
    
    // Debug info element
    this.debugInfo = document.createElement('div');
    this.debugInfo.style.position = 'fixed';
    this.debugInfo.style.top = '10px';
    this.debugInfo.style.left = '10px';
    this.debugInfo.style.color = 'lime';
    this.debugInfo.style.zIndex = '9999';
    this.debugInfo.style.fontFamily = 'monospace';
    document.body.appendChild(this.debugInfo);
    
    this.dX = window.innerWidth / 2;
    this.dY = window.innerHeight / 2;
    this.rX = this.dX;
    this.rY = this.dY;
    
    this.initCursorTracking();
  }

  initDots(count) {
    this.dotsContainer.innerHTML = '';
    for(let i = 0; i < count; i++){
      const dot = document.createElement('div');
      dot.className = i === 0 ? "nav-dot active" : "nav-dot";
      this.dotsContainer.appendChild(dot);
    }
  }

  initCursorTracking() {
    this.mX = window.innerWidth / 2;
    this.mY = window.innerHeight / 2;
    window.addEventListener('mousemove', (e) => {
      this.mX = e.clientX; 
      this.mY = e.clientY;
    });
  }

  updateCursor() {
    this.dX += (this.mX - this.dX) * 0.95;
    this.dY += (this.mY - this.dY) * 0.95;
    this.cursorDot.style.transform = `translate(${this.dX}px, ${this.dY}px)`;
    
    this.rX += (this.mX - this.rX) * 0.35;
    this.rY += (this.mY - this.rY) * 0.35;
    this.cursorRing.style.transform = `translate(${this.rX}px, ${this.rY}px)`;
  }

  triggerTypewriter(sectionIndex) {
    const descElements = document.querySelectorAll('.desc-text');
    if (!descElements.length) return;
    
    if (this.typingInterval) clearInterval(this.typingInterval);
    
    descElements.forEach((el, idx) => {
      if (sectionIndex === idx) return; 
      el.classList.remove('typing-cursor');
    });
    
    const el = descElements[sectionIndex];
    if(!el) return;
    const fullText = el.getAttribute('data-text');
    el.innerHTML = '';
    el.classList.add('typing-cursor');
    
    let charIndex = 0;
    this.typingInterval = setInterval(() => {
      el.innerHTML += fullText.charAt(charIndex);
      charIndex++;
      if(charIndex >= fullText.length) {
        clearInterval(this.typingInterval);
        el.classList.remove('typing-cursor');
      }
    }, 20);
  }

  updateScrollSection(scrollFraction) {
    const continuousSection = scrollFraction * (this.totalSections - 1);
    const newSection = Math.round(continuousSection);
    
    if(newSection !== this.currentSection) {
      this.currentSection = newSection;
      this.triggerTypewriter(this.currentSection);
      
      const dots = document.querySelectorAll('.nav-dot');
      dots.forEach((dot, index) => {
        if (index === this.currentSection) {
          dot.classList.add('active'); 
        } else {
          dot.classList.remove('active'); 
        }
      });
    }
  }

  setFocusState(isFocused, planetData = null) {
    if (isFocused && planetData) {
      this.focusHint.classList.remove('opacity-0');
      this.scrollContainer.classList.add('hidden-sections');
      this.showDashboard(planetData);
    } else {
      this.focusHint.classList.add('opacity-0');
      this.scrollContainer.classList.remove('hidden-sections');
      this.hideDashboard();
    }
  }

  showDashboard(p) {
    if (!this.dashboard) return;

    const moonList = (p.moons || []).map(m => 
      `<div class="moon-tag"><span class="moon-dot"></span>${m.name || 'Unknown'}</div>`
    ).join('');

    const factList = (p.facts || []).map(f =>
      `<li>${f}</li>`
    ).join('');

    this.dashboard.innerHTML = `
      <div class="dash-overlay" id="dash-overlay">
        <div class="dash-left">
          <div class="dash-kicker">${p.kicker}</div>
          <h1 class="dash-title">${p.name}</h1>
          <p class="dash-desc">${p.description}</p>
          
          <div class="dash-time-grid">
            <div class="dash-time-item">
              <span class="dash-time-label">Day Length</span>
              <span class="dash-time-value">${p.dayLength || '—'}</span>
            </div>
            <div class="dash-time-item">
              <span class="dash-time-label">Year Length</span>
              <span class="dash-time-value">${p.yearLength || '—'}</span>
            </div>
          </div>

          ${(p.moons && p.moons.length > 0) ? `
            <div class="dash-moons-section">
              <h3 class="dash-section-title">Moons (${p.moons.length})</h3>
              <div class="dash-moons-grid">${moonList}</div>
            </div>
          ` : ''}
        </div>

        <div class="dash-right">
          <h3 class="dash-section-title">Interesting Facts</h3>
          <ul class="dash-facts">${factList}</ul>
        </div>

        <button id="close-dashboard" class="dash-close interactive-btn" title="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ESC
        </button>
      </div>
    `;

    requestAnimationFrame(() => {
      this.dashboard.classList.add('visible');
    });

    document.getElementById('close-dashboard').addEventListener('click', () => {
      if (this.onCloseDashboard) this.onCloseDashboard();
    });
  }

  hideDashboard() {
    if (!this.dashboard) return;
    this.dashboard.classList.remove('visible');
    setTimeout(() => {
      this.dashboard.innerHTML = '';
    }, 500);
  }

  /**
   * Inject both planet sections AND zoom-out sections into the scroll container.
   */
  injectAllSections(planetData, zoomOutData) {
    const container = document.getElementById('scroll-container');
    container.innerHTML = '';
    
    // Planet sections
    planetData.forEach((p, index) => {
      const alignClass = index % 2 !== 0 ? 'items-end text-right' : '';
      const html = `
        <section class="scroll-section ${alignClass}">
            <div class="info-panel">
                <div class="kicker">${p.kicker}</div>
                <h2 class="section-title">${p.name}</h2>
                <p class="desc-text" data-text="${p.description}"></p>
                ${index === 0 ? `
                  <button id="init-audio-btn" class="interactive-btn audio-btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 19h4l5 5V0L9 5H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Initiate Audio Override
                  </button>
                  <div class="scroll-hint">
                    <svg class="bounce-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    Scroll to travel • Click planet to focus
                  </div>
                ` : ''}
                <span class="click-hint">👆 Click planet to focus</span>
            </div>
        </section>
      `;
      container.innerHTML += html;
    });
    
    // Zoom-out sections — different visual style
    zoomOutData.forEach((section) => {
      const html = `
        <section class="scroll-section zoom-section">
            <div class="info-panel zoom-panel">
                <div class="kicker zoom-kicker">${section.kicker}</div>
                <h2 class="section-title zoom-title">${section.name}</h2>
                <p class="desc-text" data-text="${section.description}"></p>
            </div>
        </section>
      `;
      container.innerHTML += html;
    });
    
    container.innerHTML += `<div style="height: 30vh;"></div>`;
    
    // Set total sections and init dots
    this.totalSections = planetData.length + zoomOutData.length;
    this.initDots(this.totalSections);
  }
}
