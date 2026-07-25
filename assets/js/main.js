/* Tethar — shared site interactions */
(function () {
  'use strict';

  // Sticky nav background on scroll
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  var toggle = document.getElementById('navToggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Waitlist signup
  // ─────────────────────────────────────────────────────────────
  // TO GO LIVE: create a free form at https://formspree.io (or similar),
  // then paste your endpoint below, e.g.
  //   var WAITLIST_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
  // Until this is set, sign-ups are saved in the browser only (not emailed to you).
  var WAITLIST_ENDPOINT = 'https://formspree.io/f/mlgqojlk';
  // ─────────────────────────────────────────────────────────────
  // Any number of waitlist forms (hero + closing section) share this handler.
  function markJoined() { try { localStorage.setItem('tethar.waitlist.joined', '1'); } catch (e) {} }
  function scope(form) { return form.closest('.hero-waitlist-wrap, .cta-band') || form.parentElement; }
  document.querySelectorAll('form.js-waitlist').forEach(function (form) {
    var box = scope(form);
    var succeed = function () {
      form.hidden = true;
      var note = box.querySelector('.js-waitlist-note'); if (note) note.hidden = true;
      var ok = box.querySelector('.js-waitlist-success'); if (ok) ok.hidden = false;
      markJoined();
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[name="email"]');
      var email = (input && input.value || '').trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (input) input.reportValidity();
        return;
      }
      if (WAITLIST_ENDPOINT) {
        fetch(WAITLIST_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
          .then(succeed).catch(succeed);
      } else {
        try {
          var list = JSON.parse(localStorage.getItem('tethar.waitlist') || '[]');
          list.push({ email: email });
          localStorage.setItem('tethar.waitlist', JSON.stringify(list));
        } catch (err) { /* ignore */ }
        console.warn('Tethar waitlist: no WAITLIST_ENDPOINT set in main.js — sign-up saved locally only, not emailed.');
        succeed();
      }
    });
  });

  // Sticky mobile waitlist bar — hide it once the closing waitlist section is on screen.
  var stickyBar = document.getElementById('stickyWaitlist');
  if (stickyBar) {
    var waitlistSection = document.getElementById('waitlist');
    if (waitlistSection && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        stickyBar.classList.toggle('hide', entries[0].isIntersecting);
      }, { threshold: 0 }).observe(waitlistSection);
    }
  }

  // Reveal-on-scroll — but anything already in view on load shows immediately (no faint first paint).
  var reveals = document.querySelectorAll('.reveal');
  function showNow(el) { el.classList.add('in'); }
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        showNow(el);           // above the fold on load → never render faint
      } else {
        el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
        io.observe(el);
      }
    });
  } else {
    reveals.forEach(showNow);
  }
})();
