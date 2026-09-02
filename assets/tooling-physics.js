// Gabriela Olivera — portfolio site — tooling-bar physics animation.
//
// Replaces the old CSS marquee: one tool word at a time drops in under
// gravity (Matter.js), bounces slightly, settles, holds for a moment,
// then drops on through the floor and out of view before the next word
// falls. The exit is a second drop, not an opacity fade — an opacity
// transition on the neon-blue text was caught mid-transition by
// check:a11y's animated-state axe pass with a real (if transient)
// color-contrast violation, since a partially-transparent word blended
// toward the dark background loses contrast for however many frames it
// takes to reach 0. Staying fully opaque throughout and only ever
// moving position sidesteps that entirely. Same progressive-enhancement
// contract as script.js's other motion: this only runs once
// html.motion-ready is present (IntersectionObserver support and no
// prefers-reduced-motion — see script.js) AND the self-hosted Matter.js
// build actually loaded. Either condition failing leaves #tooling-static
// as the plain, fully readable list it already is by default — nothing
// here can ever leave the tooling bar blank.
//
// #tooling-static stays in the accessibility tree even while the
// physics stage is visible: it's moved to .sr-only, not hidden, and
// #tooling-stage (the animated duplicate) is aria-hidden. Same
// principle as the old marquee's aria-hidden clone — one accessible
// source of truth, one decorative visual copy.

(function () {
  'use strict';

  var motionReady = document.documentElement.classList.contains('motion-ready');
  var hasMatter = typeof Matter !== 'undefined';

  var toggle = document.getElementById('tooling-toggle');
  var stage = document.getElementById('tooling-stage');
  var staticList = document.getElementById('tooling-static');

  if (!motionReady || !hasMatter || !toggle || !stage || !staticList) return;

  var words = Array.prototype.map.call(
    staticList.querySelectorAll('.tooling-bar__item'),
    function (el) { return el.textContent; }
  );
  if (!words.length) return;

  staticList.classList.add('sr-only');
  stage.classList.add('is-active');

  var Engine = Matter.Engine;
  var Bodies = Matter.Bodies;
  var Composite = Matter.Composite;
  var Body = Matter.Body;

  var engine = Engine.create();
  // No ground body in the Matter world — measured first with one: Matter's
  // own resting-contact resolution stopped the body dead at first contact
  // with zero rebound at any restitution up to 0.75, on top of forcing its
  // x/angle back every frame (needed so the word only ever moves on Y)
  // fighting the solver's own position correction. Matter still drives
  // the part that matters most, free-fall under gravity (verified: Y
  // accelerates correctly frame over frame); the floor contact and its
  // bounce are resolved by hand below instead, against a plain
  // groundSurfaceY number, so the "leve rebote" the design calls for is
  // actually visible rather than swallowed by the solver.
  //
  // Default gravity.scale (0.001) also read as sluggish for a ~120px
  // stage — measured: with the default, a word spends over half a second
  // sitting still (velocity too low to register as "falling") before any
  // visible motion, which read as a stall rather than a fall. Doubling it
  // keeps the same gravity.y (so the drop still feels like gravity, not a
  // fast-forward) while halving how long that build-up takes.
  engine.gravity.scale = 0.002;
  var stageWidth = stage.clientWidth;
  var stageHeight = stage.clientHeight;
  var groundSurfaceY = stageHeight - 22;

  window.addEventListener('resize', function () {
    stageWidth = stage.clientWidth;
    stageHeight = stage.clientHeight;
    groundSurfaceY = stageHeight - 22;
  }, { passive: true });

  var HOLD_MS = 1400;
  var GAP_MS = 220;
  var LEAVE_MS = 260;
  var SETTLE_SPEED = 0.5;
  var SETTLE_FRAMES = 15;
  var BOUNCE_FACTOR = 0.4;
  var BOUNCE_MIN_SPEED = 1.5;

  var wordIndex = 0;
  var current = null;
  var awaitingSpawn = false;
  var gapElapsed = 0;
  var isPaused = false;
  var lastTime = null;

  function spawnNext() {
    var text = words[wordIndex];
    wordIndex = (wordIndex + 1) % words.length;

    var el = document.createElement('span');
    el.className = 'tooling-bar__item tooling-bar__falling-word';
    el.textContent = text;
    stage.appendChild(el);

    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var centerX = stageWidth / 2;
    // Starts well above the stage (clipped by its overflow: hidden, so
    // this is invisible) rather than just off the top edge by its own
    // height — that gave a real drop distance of only ~20-30px, which
    // settled in a couple of frames and read as a flash, not a fall.
    var startY = -110;
    el.style.transform = 'translate(' + (centerX - width / 2) + 'px, ' + startY + 'px)';

    // restitution: 0 — the ground isn't a body in this world (see the
    // engine-setup comment above), so Matter never sees this collide with
    // anything; the bounce is applied by hand in tick() instead.
    var body = Bodies.rectangle(centerX, startY, width, height, {
      restitution: 0,
      frictionAir: 0.02
    });
    Composite.add(engine.world, body);

    current = {
      el: el,
      body: body,
      width: width,
      height: height,
      centerX: centerX,
      state: 'falling',
      hasStartedFalling: false,
      settledFrames: 0,
      holdElapsed: 0,
      leaveElapsed: 0,
      leaveStartY: 0
    };
  }

  function removeCurrent() {
    if (!current) return;
    Composite.remove(engine.world, current.body);
    if (current.el.parentNode) current.el.parentNode.removeChild(current.el);
    current = null;
  }

  function tick(now) {
    if (lastTime === null) lastTime = now;
    var delta = Math.min(now - lastTime, 33);
    lastTime = now;

    if (!isPaused) {
      if (current && (current.state === 'falling' || current.state === 'holding')) {
        Engine.update(engine, delta);

        // The word must only ever move on Y — force x and angle back to
        // their fixed values every frame rather than trusting friction
        // and symmetric contact alone to keep it from drifting or
        // tilting, so the word stays fully readable while it falls.
        var vy = current.body.velocity.y;
        var bottom = current.body.position.y + current.height / 2;
        if (bottom >= groundSurfaceY) {
          var restY = groundSurfaceY - current.height / 2;
          var bouncedVy = vy > BOUNCE_MIN_SPEED ? -vy * BOUNCE_FACTOR : 0;
          Body.setPosition(current.body, { x: current.centerX, y: restY });
          Body.setVelocity(current.body, { x: 0, y: bouncedVy });
        } else {
          Body.setPosition(current.body, { x: current.centerX, y: current.body.position.y });
          Body.setVelocity(current.body, { x: 0, y: vy });
        }
        if (current.body.angle !== 0) Body.setAngle(current.body, 0);

        var top = current.body.position.y - current.height / 2;
        var left = current.centerX - current.width / 2;
        current.el.style.transform = 'translate(' + left + 'px, ' + top + 'px)';

        if (current.state === 'falling') {
          if (!current.hasStartedFalling) {
            // Freshly spawned bodies start at velocity 0, same as a
            // body that has already landed and stopped — checking the
            // settle condition before gravity has actually accelerated
            // it would (and, before this guard, did) call it "settled"
            // within the first few frames, while it was still sitting
            // at its off-stage starting position.
            if (current.body.velocity.y > SETTLE_SPEED) current.hasStartedFalling = true;
          } else if (Math.abs(current.body.velocity.y) < SETTLE_SPEED) {
            current.settledFrames += 1;
            if (current.settledFrames > SETTLE_FRAMES) {
              current.state = 'holding';
            }
          } else {
            current.settledFrames = 0;
          }
        } else {
          current.holdElapsed += delta;
          if (current.holdElapsed > HOLD_MS) {
            // Detach from the physics world and hand off to a plain
            // tween for the exit — see the file header comment on why
            // this drops out of frame instead of fading.
            Composite.remove(engine.world, current.body);
            current.leaveStartY = current.body.position.y;
            current.state = 'leaving';
          }
        }
      } else if (current && current.state === 'leaving') {
        current.leaveElapsed += delta;
        var t = Math.min(1, current.leaveElapsed / LEAVE_MS);
        var eased = t * t;
        var y = current.leaveStartY + eased * (current.height + 140);
        current.el.style.transform =
          'translate(' + (current.centerX - current.width / 2) + 'px, ' + (y - current.height / 2) + 'px)';
        if (t >= 1) {
          removeCurrent();
          awaitingSpawn = true;
          gapElapsed = 0;
        }
      } else if (awaitingSpawn) {
        gapElapsed += delta;
        if (gapElapsed > GAP_MS) {
          awaitingSpawn = false;
          spawnNext();
        }
      } else {
        spawnNext();
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  var setPausedState = function (paused) {
    isPaused = paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play the tools animation' : 'Pause the tools animation');
    document.getElementById('tooling-icon-pause').style.display = paused ? 'none' : '';
    document.getElementById('tooling-icon-play').style.display = paused ? '' : 'none';
  };
  setPausedState(false);
  toggle.addEventListener('click', function () {
    setPausedState(!isPaused);
  });
})();
