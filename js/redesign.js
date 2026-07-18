/* Redesign runtime: booking modal, mobile drawer, FAQ accordion.
   Progressive enhancement — every control is a real link/button without JS. */
(function () {
  'use strict';

  var SQUARE_SRC = 'https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P';
  var body = document.body;

  /* ---- booking modal ---- */
  var overlay = document.querySelector('.book-overlay');
  var frame = overlay && overlay.querySelector('iframe');
  var lastFocus = null;

  function openBooking(e) {
    if (e) e.preventDefault();
    if (!overlay) return;
    lastFocus = document.activeElement;
    // Lazy-load the Square widget on first open so it never blocks page load.
    if (frame && !frame.getAttribute('src')) frame.setAttribute('src', SQUARE_SRC);
    body.classList.add('book-open');
    var close = overlay.querySelector('.book-close');
    if (close) close.focus();
  }

  function closeBooking() {
    if (!overlay) return;
    body.classList.remove('book-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-book]');
    if (opener) { openBooking(e); return; }
    if (e.target.closest('.book-close') || e.target.closest('.book-backdrop')) {
      e.preventDefault();
      closeBooking();
    }
  });

  /* ---- mobile drawer ---- */
  function setDrawer(open) { body.classList.toggle('drawer-open', open); }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.hamburger')) { e.preventDefault(); setDrawer(true); return; }
    if (e.target.closest('.drawer-close') || e.target.closest('.drawer-backdrop')) {
      e.preventDefault();
      setDrawer(false);
    }
  });

  /* ---- FAQ accordion ---- */
  document.addEventListener('click', function (e) {
    var q = e.target.closest('.faq-q');
    if (!q) return;
    var item = q.parentElement;
    var open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
    var icon = q.querySelector('.icon');
    if (icon) icon.textContent = open ? '−' : '+';
  });

  /* ---- escape closes whatever is open ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (body.classList.contains('book-open')) closeBooking();
    else if (body.classList.contains('drawer-open')) setDrawer(false);
  });
})();
