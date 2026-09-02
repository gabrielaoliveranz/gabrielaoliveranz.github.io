// Gabriela Olivera — portfolio site — progressive enhancement only.
//
// Every number and every section is already in the HTML source and
// fully visible without this file (see index.html and CLAUDE.md,
// "Hand-written, semantic HTML — never a bundled export"). This script
// adds the stat count-up, the scroll-reveal fade-ins, the copy-email
// control, and the back-to-top button. The tooling-bar's own animation
// (falling-word physics) lives in assets/tooling-physics.js, loaded
// after this file, since it depends on the .motion-ready class this
// file sets below. None of it hides or delays content by default: the
// count-up starts from the real number already in the HTML, and the
// reveal CSS only takes effect once .motion-ready is added below
// (IntersectionObserver support + motion allowed) — a no-JS visitor,
// an older browser, or a reduced-motion visitor all see the finished
// page immediately, never a hidden one.

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var motionEnabled = 'IntersectionObserver' in window && !prefersReducedMotion;

  if (motionEnabled) {
    document.documentElement.classList.add('motion-ready');

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });

    var repeatObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll('[data-reveal-repeat]').forEach(function (el) {
      repeatObserver.observe(el);
    });

    var allStats = document.querySelectorAll('.stats');
    allStats.forEach(function (statsEl) {
      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            countObserver.disconnect();
            entry.target
              .querySelectorAll('[data-count-target]')
              .forEach(animateCount);
          });
        },
        { threshold: 0.4 }
      );
      countObserver.observe(statsEl);
    });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count-target'), 10);
    var duration = 1400;
    var start = performance.now();

    function step(t) {
      var p = Math.min(1, (t - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-NZ');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-NZ');
    }
    requestAnimationFrame(step);
  }

  var navLinks = document.querySelectorAll('.site-header__nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var sectionMap = [];
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) sectionMap.push({ link: link, section: section });
    });
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sectionMap.find(function (m) { return m.section === entry.target; });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
            match.link.setAttribute('aria-current', 'true');
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sectionMap.forEach(function (m) { navObserver.observe(m.section); });
  }

  // The tooling-bar's own play/pause wiring now lives in
  // assets/tooling-physics.js, next to the animation it controls.

  // copy-email is a real mailto: <a> now, not a plain <button> — clicking
  // it opens a mail client on its own via the href, with no JS required,
  // same "content/behaviour doesn't depend on script" standard as the rest
  // of this site. This listener only adds the clipboard copy on top (for
  // desktop visitors with no mail client configured, where the mailto does
  // nothing and the button would otherwise look broken) — it never calls
  // preventDefault, so the mailto navigation always proceeds regardless of
  // whether the copy succeeds.
  var copyBtn = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');
  if (copyBtn && copyStatus) {
    copyBtn.addEventListener('click', function () {
      // Read the address from the href actually used to email, rather than
      // a second hand-typed copy, so the two can't drift apart — same
      // failure mode as the tooling ticker's old hand-duplicated second
      // half (CLAUDE.md, "Tooling-bar ticker").
      var value = copyBtn.getAttribute('href').replace(/^mailto:/, '');
      var announce = function (ok) {
        copyStatus.textContent = ok ? 'Copied' : 'Could not copy — select and copy manually';
        window.clearTimeout(copyBtn._copyTimeout);
        copyBtn._copyTimeout = window.setTimeout(function () {
          copyStatus.textContent = '';
        }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () { announce(true); },
          function () { announce(false); }
        );
      } else {
        var temp = document.createElement('textarea');
        temp.value = value;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(temp);
        announce(ok);
      }
    });
  }

  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener(
      'scroll',
      function () {
        backToTop.classList.toggle('is-visible', window.scrollY > 700);
      },
      { passive: true }
    );
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
