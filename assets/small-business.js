// small-business/index.html only — contact modal.
//
// Progressive enhancement over real mailto: links, same standard as the
// rest of this site (see script.js's own header comment): both
// .js-contact-trigger buttons are plain <a href="mailto:...">, so a
// no-JS visitor gets exactly today's behaviour. This only intercepts
// the click (unlike script.js's copy-email listener, which deliberately
// never calls preventDefault) to open the modal instead, because
// rerouting the interaction to a nicer form is the whole point here —
// the form's own action is still the same mailto:, so both paths end at
// the same place either way.

(function () {
  'use strict';

  var triggers = document.querySelectorAll('.js-contact-trigger');
  var overlay = document.getElementById('contact-modal-overlay');
  var modal = document.getElementById('contact-modal');
  var closeBtn = document.getElementById('contact-modal-close');
  if (!triggers.length || !overlay || !modal || !closeBtn) return;

  var lastFocused = null;

  function focusableElements() {
    return modal.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    var focusables = focusableElements();
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openModal(event) {
    event.preventDefault();
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var focusables = focusableElements();
    if (focusables.length) focusables[0].focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', openModal);
  });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeModal();
  });
})();

// "The questions this usually starts with" — equalizes all four card
// heights across the whole 2x2 grid, not just within a CSS Grid row.
// Grid's own default stretch already matches the two cards inside a
// single row to each other (that part needs no JS) — but these two rows
// hold different amounts of copy, so left to itself the grid reads as
// two different-height rows stacked on top of each other. Re-measures
// on resize since the 2-column layout only applies above 760px (see
// styles.css); below that each card is its own full-width row and
// doesn't need equalizing at all, so the inline min-height is cleared
// there instead of forced to something meaningless.
(function () {
  'use strict';

  var cards = document.querySelectorAll('.sme-card-grid .sme-card');
  if (!cards.length) return;

  var narrowQuery = window.matchMedia('(max-width: 760px)');

  function equalizeHeights() {
    cards.forEach(function (card) { card.style.minHeight = ''; });
    if (narrowQuery.matches) return;
    var tallest = 0;
    cards.forEach(function (card) {
      tallest = Math.max(tallest, card.getBoundingClientRect().height);
    });
    cards.forEach(function (card) { card.style.minHeight = tallest + 'px'; });
  }

  equalizeHeights();
  window.addEventListener('resize', equalizeHeights);
})();
