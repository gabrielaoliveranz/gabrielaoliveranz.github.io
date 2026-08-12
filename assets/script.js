// Gabriela Olivera — portfolio site — progressive enhancement only.
//
// Every number and every section is already in the HTML source and
// fully visible without this file (see index.html and CLAUDE.md,
// "Hand-written, semantic HTML — never a bundled export"). This script
// adds the stat count-up, the scroll-reveal fade-ins, the tooling-bar
// ticker toggle, the copy-email control, and the back-to-top button.
// None of it hides or delays content by default: the count-up starts
// from the real number already in the HTML, and the reveal CSS only
// takes effect once .motion-ready is added below (IntersectionObserver
// support + motion allowed) — a no-JS visitor, an older browser, or a
// reduced-motion visitor all see the finished page immediately, never
// a hidden one.

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var motionEnabled = 'IntersectionObserver' in window && !prefersReducedMotion;

  if (motionEnabled) {
    document.documentElement.classList.add('motion-ready');

    // Seamless-loop marquee: the CSS scroll animation (translateX(-50%))
    // assumes the track is two pixel-identical halves. Clone the real,
    // hand-written half instead of hand-writing a second copy in the
    // HTML — a clone can never drift out of sync with its source the
    // way two separately edited copies could. See the HTML comment
    // above #tooling-track and CLAUDE.md, "Tooling-bar ticker".
    var toolingTrackEl = document.getElementById('tooling-track');
    if (toolingTrackEl) {
      Array.prototype.slice.call(toolingTrackEl.children).forEach(function (node) {
        var clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        toolingTrackEl.appendChild(clone);
      });
    }

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

  var toolingToggle = document.getElementById('tooling-toggle');
  var toolingTrack = document.getElementById('tooling-track');
  if (toolingToggle && toolingTrack) {
    var startPaused = prefersReducedMotion;
    var setToolingState = function (paused) {
      toolingTrack.classList.toggle('is-paused', paused);
      toolingToggle.setAttribute('aria-pressed', String(paused));
      toolingToggle.setAttribute('aria-label', paused ? 'Play the tools ticker' : 'Pause the tools ticker');
      document.getElementById('tooling-icon-pause').style.display = paused ? 'none' : '';
      document.getElementById('tooling-icon-play').style.display = paused ? '' : 'none';
    };
    setToolingState(startPaused);
    toolingToggle.addEventListener('click', function () {
      setToolingState(!toolingTrack.classList.contains('is-paused'));
    });
  }

  var copyBtn = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');
  if (copyBtn && copyStatus) {
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-copy');
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
