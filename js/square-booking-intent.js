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
    return fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors',
      keepalive: true
    })
      .then(() => true)
      .catch((error) => {
        console.warn('Unable to send Square booking payload', error);
        return false;
      });
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

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('square-booking-root');
    if (!container) return;

    const sessionId = getSessionId();

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
