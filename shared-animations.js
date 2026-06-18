/* shared-animations.js — included in every page */

(function () {
  'use strict';

  // ── NAV SCROLL & MOBILE TOGGLE ──
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
      });
    });
  }

  // ── PAGE TRANSITION (fade in/out) ──
  document.body.style.opacity = '0';
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.28s ease';
    document.body.style.opacity = '1';
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#') && !href.startsWith('//')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        
        // SPECIAL TRANSITION FOR AI PROJECTS (DARK MODE)
        if (href.includes('deutschlernen.html') && !window.location.href.includes('deutschlernen.html')) {
          const darkOverlay = document.createElement('div');
          darkOverlay.style.position = 'fixed';
          darkOverlay.style.top = '0';
          darkOverlay.style.left = '0';
          darkOverlay.style.width = '100vw';
          darkOverlay.style.height = '100vh';
          darkOverlay.style.backgroundColor = '#0a0a0a';
          darkOverlay.style.zIndex = '9999';
          darkOverlay.style.opacity = '0';
          darkOverlay.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          document.body.appendChild(darkOverlay);
          
          // Force reflow
          void darkOverlay.offsetWidth;
          
          darkOverlay.style.opacity = '1';
          
          setTimeout(() => { window.location.href = href; }, 500);
        } else {
          // NORMAL TRANSITION
          document.body.style.transition = 'opacity 0.2s ease';
          document.body.style.opacity = '0';
          setTimeout(() => { window.location.href = href; }, 200);
        }
      });
    }
  });

  // ── SCROLL REVEAL (IntersectionObserver) ──
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => revealObserver.observe(el));

  // ── READ PROGRESS BAR ──
  const progressBar = document.querySelector('.read-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // ── COUNTER ANIMATION ──
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.animate-number').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals) || 0;
        const duration = 1500; // 1.5s
        const startTime = performance.now();
        
        function update(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
          const val = eased * target;
          
          if (decimals > 0) {
            el.textContent = val.toFixed(decimals);
          } else {
            // Add commas for large numbers like 770,452
            el.textContent = Math.round(val).toLocaleString('en-US');
          }
          
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stats, .stats-grid, #stats, .impact-dashboard').forEach(el => counterObserver.observe(el));

})();
