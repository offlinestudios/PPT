/* Redesign runtime: booking modal, mobile drawer, FAQ accordion.
   Progressive enhancement — every control is a real link/button without JS. */
(function () {
  'use strict';

  var CONFIG = window.PPT_BOOKING_INTENTS_CONFIG || {};
  var WEBHOOK_URL =
    CONFIG.endpointUrl ||
    'https://ppt-booking-intents.summer-frog-a66e.workers.dev/';
  var SQUARE_SRC = 'https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P';
  var ATTRIBUTION_STORAGE_KEY = 'pptAttribution';
  var CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'];
  var CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var ATTRIBUTION_KEYS = CLICK_ID_KEYS.concat(CAMPAIGN_KEYS);
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

  function isConfigured() {
    return Boolean(WEBHOOK_URL);
  }

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

  function getSearchParams() {
    try {
      return new URLSearchParams(window.location.search || '');
    } catch (error) {
      return new URLSearchParams();
    }
  }

  function readStoredAttribution() {
    try {
      return JSON.parse(localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || 'null') || {};
    } catch (error) {
      return {};
    }
  }

  function readAttribution() {
    var live = window.pptAttribution || {};
    var stored = readStoredAttribution();
    var params = getSearchParams();
    var incoming = {};

    ATTRIBUTION_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) incoming[key] = value;
    });

    var attribution = {};

    ATTRIBUTION_KEYS.forEach(function (key) {
      attribution[key] = live[key] || incoming[key] || stored[key] || '';
    });

    attribution.firstLandingPage =
      live.firstLandingPage ||
      stored.firstLandingPage ||
      window.location.href;
    attribution.latestLandingPage =
      live.latestLandingPage ||
      window.location.href;
    attribution.firstSeenAt =
      live.firstSeenAt ||
      stored.firstSeenAt ||
      '';
    attribution.lastSeenAt =
      live.lastSeenAt ||
      stored.lastSeenAt ||
      '';
    attribution.referrer =
      live.referrer ||
      stored.referrer ||
      document.referrer ||
      '';

    if (!attribution.utm_source && attribution.gclid) {
      attribution.utm_source = 'google';
    }

    if (!attribution.utm_medium && (attribution.gclid || attribution.gbraid || attribution.wbraid)) {
      attribution.utm_medium = 'cpc';
    }

    return attribution;
  }

  function basePayload(sessionId) {
    var attribution = readAttribution();

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
    if (!isConfigured()) {
      console.warn('PPT booking intents endpoint is not configured.');
      return Promise.resolve(false);
    }

    return fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      keepalive: true
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Booking-intent endpoint returned HTTP ' + response.status);
        }
        return true;
      })
      .catch(function (error) {
        console.warn('Unable to send Square booking payload', error);
        return false;
      });
  }

  function sendCustomEvent(sessionId, eventName, reason) {
    var payload = basePayload(sessionId);
    payload.event = eventName;
    payload.interaction_reason = reason || '';
    return sendPayload(payload);
  }

  window.pptBookingIntents = {
    getSessionId: getSessionId,
    isConfigured: isConfigured,
    sendCustomEvent: sendCustomEvent
  };

  function sendPageView(sessionId, surface) {
    var payload = basePayload(sessionId);
    payload.event = 'square_booking_page_view';

    return sendPayload(payload).then(function (sent) {
      if (sent) {
        markEvent('pageView', {
          sessionId: sessionId,
          sentAt: payload.captured_at,
          surface: surface
        });
      }
      return sent;
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

    return sendPayload(payload).then(function (sent) {
      if (sent) {
        markEvent('firstInteraction', {
          sessionId: sessionId,
          sentAt: payload.captured_at,
          reason: reason
        });
      }
      return sent;
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
