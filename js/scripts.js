// Subtle starfield with occasional shooting stars
(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, stars = [], shooting = [];

  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize(){
    w = canvas.width = Math.floor(window.innerWidth * DPR);
    h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // regenerate stars based on size
    const count = Math.floor(Math.max(100, window.innerWidth * 0.18));
    stars = Array.from({length: count}, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      hue: Math.random() * 40 + 180
    }));
  }

  function spawnShooting(){
    if (Math.random() < 0.02) { // occasional spawn
      // spawn position anywhere near the viewport edges to give variety
      const edge = Math.floor(Math.random() * 4); // 0:top,1:right,2:bottom,3:left
      let x, y;
      if (edge === 0) { x = Math.random() * window.innerWidth; y = -10; }
      else if (edge === 1) { x = window.innerWidth + 10; y = Math.random() * window.innerHeight; }
      else if (edge === 2) { x = Math.random() * window.innerWidth; y = window.innerHeight + 10; }
      else { x = -10; y = Math.random() * window.innerHeight; }

      const angle = Math.random() * Math.PI * 2; // full 360° random direction
      const speed = Math.random() * 6 + 4; // moderate speed
      const life = Math.floor(Math.random() * 20 + 18); // short life (frames)
      const size = Math.random() * 2 + 1;
      shooting.push({x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, size});
    }
  }

  function draw(){
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    // faint space gradient
    const g = ctx.createLinearGradient(0,0,0,window.innerHeight);
    g.addColorStop(0, 'rgba(6,10,14,0.0)');
    g.addColorStop(1, 'rgba(2,4,8,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

    // draw stars
    for(const s of stars){
      s.twinkle += 0.02 + Math.random()*0.02;
      const a = 0.35 + Math.sin(s.twinkle) * 0.35;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }

    // shooting stars
    for(let i = shooting.length - 1; i >= 0; i--){
      const s = shooting[i];
      s.x += s.vx; s.y += s.vy; s.life -= 1;
      // shorter trail proportional to speed and remaining life
      const trailLen = Math.max(18, Math.min(48, Math.hypot(s.vx, s.vy) * 8));
      const tx = s.x - s.vx * (trailLen / Math.hypot(s.vx || 1, s.vy || 1));
      const ty = s.y - s.vy * (trailLen / Math.hypot(s.vx || 1, s.vy || 1));
      const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(110,231,183,0)');
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, (s.size || 1));
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // small head glow
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.arc(s.x, s.y, Math.max(1.8, (s.size || 1) * 1.6), 0, Math.PI*2);
      ctx.fill();

      if(s.life <= 0 || s.x < -120 || s.x > window.innerWidth + 120 || s.y < -120 || s.y > window.innerHeight + 120){
        shooting.splice(i,1);
      }
    }

    spawnShooting();
  }

  let raf;
  function loop(){ draw(); raf = requestAnimationFrame(loop); }

  window.addEventListener('resize', ()=>{ resize(); });
  resize(); loop();

  // small DOM tweaks
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})();

// Navbar scroll effect
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  
  let lastScrollY = window.scrollY;
  
  function updateHeader() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
  }
  
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // Initial call
})();

// Mobile menu toggle
(() => {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav');
  
  if (!mobileToggle || !nav) return;
  
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    nav.classList.toggle('mobile-open');
  });
  
  // Close mobile menu when clicking on a link
  const navLinks = nav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      nav.classList.remove('mobile-open');
    });
  });
})();

// Skill belt carousel initializer
(() => {
  function initBelt(){
    const belt = document.querySelector('.skill-belt');
    if(!belt) return;
    const tracks = belt.querySelectorAll('.belt-track');
    // Ensure each track width is at least twice the container for smooth loop
    const containerWidth = belt.clientWidth;
    tracks.forEach(t => {
      // measure original content width first (before duplication)
      const originalWidth = t.scrollWidth;
      // duplicate content exactly once to create two copies for smooth looping
      if(!t.hasAttribute('data-duplicated')){
        t.innerHTML = t.innerHTML + t.innerHTML;
        t.setAttribute('data-duplicated','1');
      }
      // set a CSS variable for exact animation distance (one copy width)
      t.style.setProperty('--anim-distance', originalWidth + 'px');
      // set track width to combined width (two copies)
      t.style.width = (originalWidth * 2) + 'px';
    });

    // Remove tracks from document flow by absolutely positioning them inside the belt container.
    // This prevents their large combined width from expanding ancestor layout and causing page overflow.
    const firstTrackHeight = tracks[0] ? tracks[0].offsetHeight : 0;
    if(tracks.length > 0){
      const totalHeight = firstTrackHeight * tracks.length;
      belt.style.height = totalHeight + 'px';
      tracks.forEach((t, i) => {
        t.style.position = 'absolute';
        t.style.left = '0';
        t.style.top = (i * firstTrackHeight) + 'px';
        t.style.margin = '0';
        // initial offset for second track (will be animated)
        if(i === 1){
          const animDist = t.style.getPropertyValue('--anim-distance') || '50%';
          t.style.transform = `translateX(calc(${animDist} * -1))`;
        } else {
          t.style.transform = 'translateX(0)';
        }
      });
    }

    // start playing unless reduced motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    belt.setAttribute('data-playing', reduced ? 'false' : 'true');

    // pause on hover/focus
    belt.addEventListener('mouseenter', ()=> belt.setAttribute('data-playing','false'));
    belt.addEventListener('mouseleave', ()=> belt.setAttribute('data-playing','true'));
    belt.addEventListener('focusin', ()=> belt.setAttribute('data-playing','false'));
    belt.addEventListener('focusout', ()=> belt.setAttribute('data-playing','true'));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBelt);
  else initBelt();
  window.addEventListener('resize', ()=>{ setTimeout(initBelt, 120); });
})();
