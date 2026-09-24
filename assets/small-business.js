// small-business/index.html only. (The contact modal lives in
// assets/contact-modal.js, shared with index.html.)
//
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
