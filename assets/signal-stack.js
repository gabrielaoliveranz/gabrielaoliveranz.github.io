// Gabriela Olivera — portfolio site — "Signal stack" word carousel.
//
// One tool word at a time is spelled out by real Matter.js physics:
// each letter drops from above under gravity into its own natural
// typeset position — x is never touched, only y — staggered slightly
// (dropY offset by -260 - i*14 per letter index) so letters cascade
// down left to right rather than landing in unison. The word recomposes
// every 2700ms, timed from performance.now() rather than chained
// setTimeouts, so a dropped frame can't leave the cycle stuck. Ported
// from a design reference; see CLAUDE.md.
//
// Progressive enhancement, same contract as the rest of this site: only
// runs once html.motion-ready is present AND the self-hosted Matter.js
// build actually loaded — otherwise #signal-stack-static (already
// visible) is the whole story, same fallback shape the old
// tooling-bar/marquee had.
//
// Accessibility: #signal-stack-static is the one accessible source
// (moved to .sr-only, never display:none, once physics takes over);
// #signal-stack-frame is aria-hidden in the HTML unconditionally — a
// decorative duplicate, not a second source of content.

(function () {
  'use strict';

  var TOOLS = ['SQL', 'Python', 'R', 'Power BI', 'Excel', 'ETL', 'Data quality', 'Git'];
  var CYCLE_MS = 2700;

  var motionReady = document.documentElement.classList.contains('motion-ready');
  var hasMatter = typeof Matter !== 'undefined';

  var staticList = document.getElementById('signal-stack-static');
  var frame = document.getElementById('signal-stack-frame');
  var track = document.getElementById('signal-stack-track');

  if (!motionReady || !hasMatter || !staticList || !frame || !track) return;

  staticList.classList.add('sr-only');
  frame.classList.add('is-active');

  var Engine = Matter.Engine;
  var World = Matter.World;
  var Bodies = Matter.Bodies;
  var Body = Matter.Body;

  var cycleStart = performance.now();
  var wordIndex = -1;
  var engine = null;
  var bodies = null;
  var physicsReady = false;

  function buildWord(index) {
    var word = TOOLS[index % TOOLS.length];
    var color = index % 2 === 0 ? '#4FC3FF' : '#fff';
    track.innerHTML = '';
    for (var i = 0; i < word.length; i++) {
      var ch = word.charAt(i);
      var span = document.createElement('span');
      span.className = 'signal-stack__letter';
      span.setAttribute('data-k', index + '_' + i);
      span.style.color = color;
      span.textContent = ch === ' ' ? ' ' : ch;
      track.appendChild(span);
    }
    physicsReady = false;
    bodies = null;
    engine = null;
  }

  function startPhysics() {
    var chars = Array.prototype.slice.call(track.querySelectorAll('[data-k]'));
    if (!chars.length) return;
    var rect = track.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    engine = Engine.create();
    engine.world.gravity.y = 1;
    // Default gravity.scale (0.001) measured too slow to reliably land
    // every letter of a longer word (e.g. "Data quality", 12 characters)
    // within the 2700ms cycle before the next word swaps in — the same
    // "sluggish for this stage size" finding as the tooling-bar's own
    // physics tuning (CLAUDE.md). Doubling it keeps gravity.y at the
    // reference's own value while halving how long the fall takes.
    engine.gravity.scale = 0.002;

    var floorY = rect.height + 6;
    World.add(engine.world, Bodies.rectangle(rect.width / 2, floorY + 20, rect.width * 2, 40, { isStatic: true }));

    bodies = {};
    chars.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var startX = r.left - rect.left + r.width / 2;
      var restY = r.top - rect.top + r.height / 2;
      var dropY = restY - 260 - i * 14;
      var body = Bodies.rectangle(startX, dropY, r.width * 0.92, r.height * 0.85, {
        restitution: 0.1,
        friction: 0.5,
        frictionAir: 0.045,
        inertia: Infinity,
        // All letters share one negative collision group: Matter's rule
        // is that same-negative-group bodies never collide with each
        // other regardless of category/mask, while each still collides
        // normally with the (group 0) floor. Without this, longer words
        // land jumbled — adjacent letters converging on the same
        // baseline row at slightly staggered times collided with each
        // other and got shoved sideways, breaking "sin movimiento
        // horizontal" (caught by screenshot: "Power BI" landed with
        // overlapping, illegible letters).
        collisionFilter: { group: -1 }
      });
      // inertia: Infinity above is Matter's documented way to lock
      // rotation, but on this build the letters still visibly rotated
      // (caught by screenshot: "Data quality" landed with every letter
      // tilted along a diagonal). Body.setInertia after creation sets
      // inertia and inverseInertia directly and reliably zeroes any
      // torque's effect on angular velocity, which the constructor
      // option evidently didn't.
      Body.setInertia(body, Infinity);
      World.add(engine.world, body);
      bodies[el.getAttribute('data-k')] = { body: body, restY: restY };
    });
    physicsReady = true;
  }

  function updatePhysics() {
    Engine.update(engine, 16.6);
    var chars = track.querySelectorAll('[data-k]');
    Array.prototype.forEach.call(chars, function (el) {
      var rec = bodies[el.getAttribute('data-k')];
      if (!rec) return;
      var dy = Math.min(0, rec.body.position.y - rec.restY);
      el.style.transform = 'translate3d(0,' + dy.toFixed(1) + 'px,0)';
    });
  }

  function tick() {
    var idx = Math.floor((performance.now() - cycleStart) / CYCLE_MS) % TOOLS.length;
    if (idx !== wordIndex) {
      wordIndex = idx;
      buildWord(wordIndex);
      requestAnimationFrame(tick);
      return;
    }
    if (!physicsReady) {
      startPhysics();
    } else {
      updatePhysics();
    }
    requestAnimationFrame(tick);
  }

  buildWord(0);
  requestAnimationFrame(tick);
})();
