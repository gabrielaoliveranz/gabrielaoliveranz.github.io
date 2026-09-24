// Contact modal, shared by index.html and small-business/index.html.
//
// Progressive enhancement over real mailto: links, same standard as the
// rest of this site (see script.js's own header comment): both
// .js-contact-trigger buttons are plain <a href="mailto:...">, so a
// no-JS visitor gets exactly today's behaviour. This only intercepts
// the click (unlike script.js's copy-email listener, which deliberately
// never calls preventDefault) to open the modal instead, because
// rerouting the interaction to a nicer form is the whole point here.
// The form posts to Formspree, which emails the same inbox the mailto:
// links point at, so both paths end up in the same place.

(function () {
  'use strict';

  var triggers = document.querySelectorAll('.js-contact-trigger');
  var overlay = document.getElementById('contact-modal-overlay');
  var modal = document.getElementById('contact-modal');
  var closeBtn = document.getElementById('contact-modal-close');
  if (!triggers.length || !overlay || !modal || !closeBtn) return;

  var lastFocused = null;
  var resetForm = function () {};

  function focusableElements() {
    // Visible ones only: the form and the success panel swap places, and
    // the hidden one's controls mustn't count as the trap's first/last.
    return Array.prototype.filter.call(modal.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    ), function (el) { return el.offsetParent !== null; });
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
    resetForm();
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

  // Submits over fetch so the visitor stays on this page. Formspree
  // returns JSON when asked with Accept: application/json. If fetch
  // is missing, the form falls back to a normal POST.
  var form = document.getElementById('contact-form');
  var status = document.getElementById('contact-form-status');
  if (!form || !status || !window.fetch || !window.FormData) return;
  var success = document.getElementById('contact-form-success');
  var doneBtn = document.getElementById('contact-form-done');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn.innerHTML;

  // Each time the modal opens, start from the form again, not from the
  // previous visit's "Message sent" panel.
  resetForm = function () {
    if (success) success.hidden = true;
    form.hidden = false;
    setStatus('', null);
  };
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = 'sme-modal__status' + (kind ? ' sme-modal__status--' + kind : '');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setStatus('', null);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      form.reset();
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } else {
        setStatus("Thanks, your message has been sent. I'll get back to you soon.", 'success');
      }
    }).catch(function () {
      setStatus("Sorry, that didn't send. Please try again, or email hello@gabrielaolivera.nz directly.", 'error');
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitLabel;
    });
  });
})();
