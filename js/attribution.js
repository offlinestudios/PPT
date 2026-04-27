(function () {
  const STORAGE_KEY = 'pptAttribution';
  const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'];
  const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const ATTRIBUTION_KEYS = CLICK_ID_KEYS.concat(CAMPAIGN_KEYS);

  function getParams() {
    try {
      return new URLSearchParams(window.location.search || '');
    } catch (error) {
      return new URLSearchParams();
    }
  }

  function readStored() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {};
    } catch (error) {
      return {};
    }
  }

  function writeStored(payload) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Unable to persist attribution data', error);
    }
  }

  function buildIncomingAttribution(params) {
    const incoming = {};
    ATTRIBUTION_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) incoming[key] = value;
    });
    return incoming;
  }

  function hasNewAttributionContext(stored, incoming) {
    return ATTRIBUTION_KEYS.some((key) => incoming[key] && incoming[key] !== (stored[key] || ''));
  }

  const params = getParams();
  const stored = readStored();
  const incoming = buildIncomingAttribution(params);
  const now = new Date().toISOString();
  const shouldReset = hasNewAttributionContext(stored, incoming);
  const next = {
    ...(shouldReset ? {} : stored),
    ...incoming,
    firstLandingPage: shouldReset ? window.location.href : (stored.firstLandingPage || window.location.href),
    latestLandingPage: window.location.href,
    firstSeenAt: shouldReset ? now : (stored.firstSeenAt || now),
    lastSeenAt: now,
    referrer: shouldReset ? (document.referrer || '') : (stored.referrer || document.referrer || '')
  };

  if (!next.utm_source && next.gclid) {
    next.utm_source = 'google';
  }

  if (!next.utm_medium && (next.gclid || next.gbraid || next.wbraid)) {
    next.utm_medium = 'cpc';
  }

  if (shouldReset || Object.keys(incoming).length || !stored.firstLandingPage) {
    writeStored(next);
  }

  window.pptAttribution = next;
})();
