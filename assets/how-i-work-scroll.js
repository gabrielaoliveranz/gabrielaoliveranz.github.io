// Gabriela Olivera — portfolio site — "How I work" scroll-driven canvas.
//
// A canvas draws a grid of points that evolves through three phases as
// the visitor scrolls through a tall (340vh) container: scattered
// ("noise"), aligned to a grid ("processing"), then collapsed into a
// single trend line on the right half only ("signal") — timed to the
// same four text blocks (numeral, stage label, title, body) that
// cross-fade in sync. Ported from a design reference; see CLAUDE.md.
//
// Progressive enhancement, same contract as the rest of this site: only
// activates once html.motion-ready is present (IntersectionObserver
// support and no prefers-reduced-motion — see script.js). Otherwise
// #how-i-work-grid (already visible, real cards) is the entire
// experience for this section — nothing here can leave it blank.
//
// Accessibility: #how-i-work-grid is the one accessible source and
// never leaves the accessibility tree (moved to .sr-only, not
// display:none, once the scroll version takes over). #how-i-work-scroll
// is aria-hidden in the HTML unconditionally — its text exists only to
// be seen mid-crossfade at partial opacity, which is exactly the kind
// of transient state that read as a real (if brief) contrast failure
// the last time this site animated text opacity (see CLAUDE.md,
// "Tooling-bar" history) — aria-hidden keeps axe from ever auditing it,
// rather than trying to time a contrast-safe threshold.

(function () {
  'use strict';

  var motionReady = document.documentElement.classList.contains('motion-ready');

  var grid = document.getElementById('how-i-work-grid');
  var scrollSection = document.getElementById('how-i-work-scroll');
  var canvas = document.getElementById('how-i-work-canvas');
  var textStage = document.getElementById('how-i-work-text-stage');
  var signalStack = document.getElementById('signal-stack');

  if (!motionReady || !grid || !scrollSection || !canvas || !textStage) return;

  grid.classList.add('sr-only');
  scrollSection.classList.add('is-active');

  var items = Array.prototype.slice.call(textStage.querySelectorAll('.how-i-work-scroll__item'));
  // 0.07 + i * 0.28 — each item's progress "centre", evenly spaced
  // across the scroll container's four acts.
  var CENTERS = [0.07, 0.35, 0.63, 0.91];

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // Deterministic point field — fixed seed, so the "noise" phase looks
  // identical on every load.
  var pts = [];
  (function seed() {
    var s = 20260901;
    function rnd() { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }
    var narrow = window.innerWidth < 720;
    var cols = narrow ? 12 : 18, rows = narrow ? 8 : 10;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var outlier = rnd() < 0.13;
        pts.push({
          gx: (c + 0.5) / cols, gy: (r + 0.5) / rows,
          rx: rnd(), ry: rnd(),
          jitterPh: rnd() * Math.PI * 2,
          outlier: outlier, size: outlier ? 2.4 : 1.6 + rnd() * 0.8
        });
      }
    }
  })();

  var progress = 0;

  function updateProgress() {
    var rect = scrollSection.getBoundingClientRect();
    var span = Math.max(1, scrollSection.offsetHeight - window.innerHeight);
    progress = clamp(-rect.top / span, 0, 1);
  }

  function updateText() {
    var plateau = 0.055, fall = 0.11;
    for (var i = 0; i < items.length; i++) {
      var center = CENTERS[i];
      var dist = Math.abs(progress - center);
      var op = dist <= plateau ? 1 : clamp(1 - (dist - plateau) / fall, 0, 1);
      var textY = (progress - center) * -34;
      items[i].style.opacity = op.toFixed(3);
      items[i].style.transform = 'translate3d(0, calc(-50% + ' + textY.toFixed(1) + 'px), 0)';
    }
  }

  function updateGlow() {
    if (!signalStack) return;
    var atEnd = progress >= 0.98;
    signalStack.style.borderTopColor = atEnd ? 'rgba(79,195,255,0.55)' : 'rgba(79,195,255,0.12)';
    signalStack.style.boxShadow = atEnd ? '0 -1px 18px rgba(79,195,255,0.35)' : '0 -1px 18px rgba(79,195,255,0)';
  }

  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      updateProgress();
      updateText();
      updateGlow();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateProgress();
  updateText();
  updateGlow();

  function draw() {
    var rect = canvas.getBoundingClientRect();
    // Skip drawing (but keep ticking) while the canvas is nowhere near
    // the viewport — this section's own container is 340vh tall, so
    // most of a page load never needs a single frame drawn here.
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.round(rect.width), h = Math.round(rect.height);
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    var g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#101B2E';
    g.fillRect(0, 0, w, h);

    var p = progress;
    var raw = 1 - ease(clamp(p / 0.32, 0, 1));
    var toGrid = ease(clamp((p - 0.05) / 0.55, 0, 1));
    var toLine = ease(clamp((p - 0.62) / 0.36, 0, 1));
    var outlierFade = clamp((p - 0.28) / 0.28, 0, 1);
    var t = performance.now() / 1000;

    var padX = w * 0.08, padY = h * 0.2;
    var iw = w - padX * 2, ih = h - padY * 2;
    var lineY = padY + ih * 0.72;
    var lineStartX = padX + iw * 0.46;
    var lineSpan = (padX + iw) - lineStartX;

    g.strokeStyle = 'rgba(231,238,246,0.08)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(lineStartX, padY + ih);
    g.lineTo(padX + iw, padY + ih);
    g.stroke();

    if (toLine > 0.02) {
      g.strokeStyle = 'rgba(79,195,255,' + (0.85 * toLine) + ')';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(lineStartX, lineY);
      g.lineTo(lineStartX + lineSpan * toLine, lineY);
      g.stroke();
      for (var tk = 0; tk <= 4; tk++) {
        var tx = lineStartX + (lineSpan * tk) / 4;
        if (tx > lineStartX + lineSpan * toLine) break;
        g.strokeStyle = 'rgba(79,195,255,' + (0.5 * toLine) + ')';
        g.beginPath();
        g.moveTo(tx, lineY - 4);
        g.lineTo(tx, lineY + 4);
        g.stroke();
      }
    }

    for (var i = 0; i < pts.length; i++) {
      var pt = pts[i];
      var breathe = Math.sin(t * 0.6 + pt.jitterPh) * raw * 3;
      var rawX = padX + pt.rx * iw + breathe;
      var rawY = padY + pt.ry * ih + breathe * 0.6;
      var gridX = padX + pt.gx * iw;
      var gridY = padY + pt.gy * ih;
      var lineTargetX = lineStartX + pt.gx * lineSpan;
      var lineTargetY = lineY + (pt.gy - 0.5) * ih * 0.05 * (1 - toLine);

      var x = rawX + (gridX - rawX) * toGrid;
      var y = rawY + (gridY - rawY) * toGrid;
      x = x + (lineTargetX - x) * toLine;
      y = y + (lineTargetY - y) * toLine;

      var alpha;
      if (pt.outlier) {
        alpha = Math.max(0.06, 0.6 * (1 - outlierFade));
        g.fillStyle = 'rgba(231,238,246,' + alpha + ')';
        g.strokeStyle = 'rgba(231,238,246,' + (alpha * 0.6) + ')';
        g.lineWidth = 1;
        g.beginPath();
        g.rect(x - pt.size, y - pt.size, pt.size * 2, pt.size * 2);
        g.stroke();
        continue;
      }
      alpha = 0.5 + 0.35 * toLine;
      g.fillStyle = toLine > 0.7 ? 'rgba(79,195,255,' + alpha + ')' : 'rgba(195,210,227,' + alpha + ')';
      g.beginPath();
      g.rect(x - pt.size / 2, y - pt.size / 2, pt.size, pt.size);
      g.fill();
    }
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
