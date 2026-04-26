(function () {
  const STORAGE_KEY = 'pptAttribution';
  const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'];
  const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

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

  const params = getParams();
  const stored = readStored();
  const next = {
    ...stored,
    firstLandingPage: stored.firstLandingPage || window.location.href,
    latestLandingPage: window.location.href,
    firstSeenAt: stored.firstSeenAt || new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    referrer: stored.referrer || document.referrer || ''
  };

  let hasNewAttribution = false;

  CLICK_ID_KEYS.concat(CAMPAIGN_KEYS).forEach((key) => {
    const value = params.get(key);
    if (value) {
      next[key] = value;
      hasNewAttribution = true;
    }
  });

  if (!next.utm_source && next.gclid) {
    next.utm_source = 'google';
  }

  if (!next.utm_medium && (next.gclid || next.gbraid || next.wbraid)) {
    next.utm_medium = 'cpc';
  }

  if (hasNewAttribution || !stored.firstLandingPage) {
    writeStored(next);
  }

  window.pptAttribution = next;
})();
