(function () {
  const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/27340760/uvu4hlz/';
  const SQUARE_BOOKING_URL = 'https://app.squareup.com/appointments/book/5fkwsauqjb7usp/L7T8SMADNB80P/start';
  const SESSION_KEY = 'pptSquareBookingSessionId';
  const STATE_KEY = 'pptSquareBookingIntentState';
  const PAGE_VIEW_TTL_MS = 30 * 60 * 1000;

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return 'ppt-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function getSessionId() {
    try {
      const existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      const next = uuid();
      sessionStorage.setItem(SESSION_KEY, next);
      return next;
    } catch (error) {
      return uuid();
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
    const state = readState();
    const pageView = state.pageView || {};
    if (pageView.sessionId !== sessionId) return true;
    if (!pageView.sentAt) return true;
    return Date.now() - Date.parse(pageView.sentAt) > PAGE_VIEW_TTL_MS;
  }

  function markEvent(key, payload) {
    const state = readState();
    state[key] = payload;
    writeState(state);
  }

  function basePayload(sessionId) {
    const attribution = window.pptAttribution || {};
    return {
      source: 'passport-photo-toronto-site',
      booking_platform: 'square_appointments',
      matching_strategy: 'time_window_approximation',
      booking_session_id: sessionId,
      page_url: window.location.href,
      scheduling_page_url: window.location.href,
      square_booking_url: SQUARE_BOOKING_URL,
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
      first_landing_page: attribution.firstLandingPage || '',
      latest_landing_page: attribution.latestLandingPage || window.location.href,
      first_seen_at: attribution.firstSeenAt || '',
      last_seen_at: attribution.lastSeenAt || '',
      referrer: attribution.referrer || document.referrer || ''
    };
  }

  function sendPayload(payload) {
    const formBody = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formBody.append(key, String(value));
    });

    return fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formBody,
      mode: 'cors',
      keepalive: true
    })
      .then(() => true)
      .catch((error) => {
        console.warn('Unable to send Square booking payload', error);
        return false;
      });
  }

  function sendBookingConfirmed(sessionId, source, detail) {
    const state = readState();
    if (state.confirmed && state.confirmed.sessionId === sessionId) {
      return Promise.resolve(false);
    }

    const payload = {
      event: 'square_booking_confirmed',
      confirmation_source: source,
      confirmation_detail: detail || '',
      ...basePayload(sessionId)
    };
    payload.matching_strategy = 'session_id_exact';

    return sendPayload(payload).then(() => {
      markEvent('confirmed', {
        sessionId,
        sentAt: payload.captured_at,
        source
      });
      return true;
    });
  }

  function hasClickId(attribution) {
    return !!(attribution.gclid || attribution.gbraid || attribution.wbraid || attribution.fbclid);
  }

  function sendLandingPageView(sessionId) {
    const attribution = window.pptAttribution || {};
    if (!hasClickId(attribution)) return Promise.resolve(false);

    const key = window.location.pathname + (window.location.search || '');
    const state = readState();
    const seen = state.pageViews || {};
    const paths = seen.sessionId === sessionId && Array.isArray(seen.paths) ? seen.paths : [];
    if (paths.indexOf(key) !== -1) return Promise.resolve(false);

    const payload = {
      event: 'site_page_view',
      page_path: key,
      ...basePayload(sessionId),
      scheduling_page_url: ''
    };

    return sendPayload(payload).then(() => {
      const nextPaths = paths.concat([key]).slice(-20);
      markEvent('pageViews', { sessionId, paths: nextPaths });
      return true;
    });
  }

  function isSquareOrigin(origin) {
    try {
      const host = new URL(origin).hostname;
      return host.endsWith('square.site') || host.endsWith('squareup.com');
    } catch (error) {
      return false;
    }
  }

  function sendPageView(sessionId) {
    const payload = {
      event: 'square_booking_page_view',
      ...basePayload(sessionId)
    };

    return sendPayload(payload).then(() => {
      markEvent('pageView', {
        sessionId,
        sentAt: payload.captured_at
      });
    });
  }

  function sendInteraction(sessionId, reason) {
    const state = readState();
    if (state.firstInteraction && state.firstInteraction.sessionId === sessionId) {
      return Promise.resolve(false);
    }

    const payload = {
      event: 'square_booking_widget_interaction',
      interaction_reason: reason,
      ...basePayload(sessionId)
    };

    return sendPayload(payload).then(() => {
      markEvent('firstInteraction', {
        sessionId,
        sentAt: payload.captured_at,
        reason
      });
      return true;
    });
  }

  window.addEventListener('message', function (event) {
    if (!isSquareOrigin(event.origin)) return;

    const sessionId = getSessionId();
    let text = '';
    try {
      text = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
    } catch (error) {
      return;
    }
    if (!text) return;

    const lower = text.toLowerCase();
    if (lower.indexOf('booking') !== -1 &&
        (lower.indexOf('confirm') !== -1 || lower.indexOf('complete') !== -1 || lower.indexOf('success') !== -1)) {
      sendBookingConfirmed(sessionId, 'widget_message', text.slice(0, 300));
      return;
    }

    const state = readState();
    const debug = state.debug || {};
    const count = debug.sessionId === sessionId ? (debug.count || 0) : 0;
    if (count < 2) {
      const payload = {
        event: 'square_widget_message',
        message_sample: text.slice(0, 300),
        ...basePayload(sessionId)
      };
      sendPayload(payload);
      markEvent('debug', { sessionId, count: count + 1 });
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('square-booking-root');
    if (!container) {
      sendLandingPageView(getSessionId());
      return;
    }

    const sessionId = getSessionId();

    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.get('ppt_test_booking') === '1') {
        sendBookingConfirmed(sessionId, 'manual_test', 'ppt_test_booking=1');
      }
    } catch (error) {
      console.warn('Unable to read test booking flag', error);
    }

    if (shouldSendPageView(sessionId)) {
      sendPageView(sessionId);
    }

    container.addEventListener('click', function () {
      sendInteraction(sessionId, 'container_click');
    }, true);

    const observer = new MutationObserver(function () {
      const actionable = container.querySelector('a[href*="squareup.com/appointments"], a[href*="square.site/appointments"], button');
      if (!actionable || actionable.dataset.pptIntentBound === '1') return;
      actionable.dataset.pptIntentBound = '1';
      actionable.addEventListener('click', function () {
        sendInteraction(sessionId, 'widget_button_click');
      }, { once: true, capture: true });
    });

    observer.observe(container, { childList: true, subtree: true });
  });
})();
