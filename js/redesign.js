/* Redesign runtime: booking modal, mobile drawer, FAQ accordion.
   Progressive enhancement — every control is a real link/button without JS. */
(function () {
  'use strict';

  var WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/27340760/uvu4hlz/';
  var SQUARE_SRC = 'https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P';
  var SESSION_KEY = 'pptSquareBookingSessionId';
  var STATE_KEY = 'pptSquareBookingIntentState';
  var PAGE_VIEW_TTL_MS = 30 * 60 * 1000;
  var body = document.body;

  /* ---- booking modal ---- */
  var overlay = document.querySelector('.book-overlay');
  var frame = overlay && overlay.querySelector('iframe');
  var inlineFrame = document.querySelector('.booker iframe[src*="square.site/appointments/buyer/widget/"]');
  var lastFocus = null;
  var bookingSessionId = null;

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return 'ppt-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function getSessionId() {
    if (bookingSessionId) return bookingSessionId;

    try {
      bookingSessionId = sessionStorage.getItem(SESSION_KEY);
      if (bookingSessionId) return bookingSessionId;
      bookingSessionId = uuid();
      sessionStorage.setItem(SESSION_KEY, bookingSessionId);
      return bookingSessionId;
    } catch (error) {
      bookingSessionId = uuid();
      return bookingSessionId;
    }
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Unable to persist Square booking intent state', error);
    }
  }

  function shouldSendPageView(sessionId) {
    var state = readState();
    var pageView = state.pageView || {};

    if (pageView.sessionId !== sessionId) return true;
    if (!pageView.sentAt) return true;

    return Date.now() - Date.parse(pageView.sentAt) > PAGE_VIEW_TTL_MS;
  }

  function markEvent(key, payload) {
    var state = readState();
    state[key] = payload;
    writeState(state);
  }

  function basePayload(sessionId) {
    var attribution = window.pptAttribution || {};

    return {
      source: 'passport-photo-toronto-site',
      booking_platform: 'square_appointments',
      matching_strategy: 'time_window_approximation',
      booking_session_id: sessionId,
      page_url: window.location.href,
      scheduling_page_url: window.location.href,
      square_booking_url: SQUARE_SRC,
      captured_at: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto',
      user_agent: navigator.userAgent || '',
      gclid: attribution.gclid || '',
      gbraid: attribution.gbraid || '',
      wbraid: attribution.wbraid || '',
      utm_source: attribution.utm_source || '',
      utm_medium: attribution.utm_medium || '',
      utm_campaign: attribution.utm_campaign || '',
      utm_term: attribution.utm_term || '',
      utm_content: attribution.utm_content || '',
      first_landing_page: attribution.firstLandingPage || window.location.href,
      latest_landing_page: attribution.latestLandingPage || window.location.href,
      first_seen_at: attribution.firstSeenAt || '',
      last_seen_at: attribution.lastSeenAt || '',
      referrer: attribution.referrer || document.referrer || ''
    };
  }

  function sendPayload(payload) {
    var formBody = new URLSearchParams();

    Object.keys(payload).forEach(function (key) {
      var value = payload[key];
      if (value === undefined || value === null) return;
      formBody.append(key, String(value));
    });

    return fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formBody,
      mode: 'cors',
      keepalive: true
    })
      .then(function () { return true; })
      .catch(function (error) {
        console.warn('Unable to send Square booking payload', error);
        return false;
      });
  }

  function sendPageView(sessionId, surface) {
    var payload = basePayload(sessionId);
    payload.event = 'square_booking_page_view';

    return sendPayload(payload).then(function () {
      markEvent('pageView', {
        sessionId: sessionId,
        sentAt: payload.captured_at,
        surface: surface
      });
    });
  }

  function sendInteraction(sessionId, reason) {
    var state = readState();

    if (state.firstInteraction && state.firstInteraction.sessionId === sessionId) {
      return Promise.resolve(false);
    }

    var payload = basePayload(sessionId);
    payload.event = 'square_booking_widget_interaction';
    payload.interaction_reason = reason;

    return sendPayload(payload).then(function () {
      markEvent('firstInteraction', {
        sessionId: sessionId,
        sentAt: payload.captured_at,
        reason: reason
      });
      return true;
    });
  }

  function trackBookingEntry(surface, reason) {
    var sessionId = getSessionId();

    if (shouldSendPageView(sessionId)) {
      sendPageView(sessionId, surface);
    }

    if (reason) {
      sendInteraction(sessionId, reason);
    }
  }

  function openBooking(e) {
    if (e) e.preventDefault();
    if (!overlay) return;
    trackBookingEntry('booking_modal', 'open_button_click');
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

  if (inlineFrame) {
    trackBookingEntry('inline_scheduler', '');
    inlineFrame.addEventListener('focus', function () {
      sendInteraction(getSessionId(), 'inline_iframe_focus');
    });
  }

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
