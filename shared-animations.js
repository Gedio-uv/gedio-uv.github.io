/* shared-animations.js — included on every page.
   Everything here is an enhancement: pages are complete without it. */

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── NAV: scroll state ──
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── NAV: mobile menu ──
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    var setOpen = function (open) {
      document.body.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.setAttribute('aria-controls', 'navLinks');
    setOpen(false);

    navToggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setOpen(false);
        navToggle.focus();
      }
    });
  }

  // ── SCROLL REVEAL: once per element ──
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // ── TABS ──
  // Markup is two plain sections. This turns them into an ARIA tab set;
  // #design-process in the URL opens that tab directly.
  var tablist = document.querySelector('[data-tabs]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[data-panel]'));
    var selectTab = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.dataset.panel).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tablist.setAttribute('role', 'tablist');
    tabs.forEach(function (tab, i) {
      var panel = document.getElementById(tab.dataset.panel);
      tab.id = 'tab-' + tab.dataset.panel;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', function () {
        selectTab(tab, false);
        if (history.replaceState) history.replaceState(null, '', i === 0 ? location.pathname + location.search : '#' + panel.id);
      });
      tab.addEventListener('keydown', function (e) {
        var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (next === null) return;
        e.preventDefault();
        selectTab(tabs[(next + tabs.length) % tabs.length], true);
      });
    });
    var fromHash = tabs.filter(function (t) { return '#' + t.dataset.panel === location.hash; })[0];
    selectTab(fromHash || tabs[0], false);
  }

  // ── VIDEO LIGHTBOX (Motion) ──
  // Cards are ordinary links to the video. This plays them in place instead.
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var frame = document.getElementById('lightboxFrame');
    var closeBtn = document.getElementById('lightboxClose');
    var opener = null;
    // Everything outside the dialog is made inert while it is open
    var setInert = function (on) {
      var el = lightbox;
      while (el && el !== document.body) {
        Array.prototype.forEach.call(el.parentElement.children, function (sib) {
          if (sib !== el && sib.tagName !== 'SCRIPT') sib.inert = on;
        });
        el = el.parentElement;
      }
    };
    var closeLightbox = function () {
      if (lightbox.hidden) return;
      lightbox.classList.remove('open');
      lightbox.hidden = true;
      frame.removeAttribute('src');
      setInert(false);
      document.body.style.overflow = '';
      if (opener) opener.focus();
    };
    document.querySelectorAll('.video-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab clicks through
        e.preventDefault();
        var id = card.dataset.id;
        frame.src = card.dataset.type === 'vimeo'
          ? 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0'
          : 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
        opener = card;
        lightbox.hidden = false;
        setInert(true);
        // next frame, so the opacity transition runs
        requestAnimationFrame(function () { lightbox.classList.add('open'); });
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
      });
    });
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ── READ PROGRESS BAR (scroll-linked, transform only) ──
  var progressBar = document.querySelector('.read-progress');
  if (progressBar) {
    var onProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressBar.style.transform = 'scaleX(' + pct + ')';
    };
    window.addEventListener('scroll', onProgress, { passive: true });
    onProgress();
  }

  // ── NUMBER COUNT-UP ──
  // The final value lives in the HTML. This only plays a short count-up
  // to that value the first time the number scrolls into view.
  var numberEls = document.querySelectorAll('.animate-number');
  var format = function (value, decimals) {
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US');
  };
  numberEls.forEach(function (el) {
    var target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    var decimals = parseInt(el.dataset.decimals, 10) || 0;
    el.dataset.final = format(target, decimals);
    el.textContent = el.dataset.final;
  });

  if (!reduceMotion && 'IntersectionObserver' in window && numberEls.length) {
    var DURATION = 500;
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countObserver.unobserve(el);
        var target = parseFloat(el.dataset.target);
        var decimals = parseInt(el.dataset.decimals, 10) || 0;
        var start = performance.now();
        var tick = function (now) {
          var t = Math.min((now - start) / DURATION, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = t < 1 ? format(target * eased, decimals) : el.dataset.final;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    numberEls.forEach(function (el) { countObserver.observe(el); });
  }
})();
