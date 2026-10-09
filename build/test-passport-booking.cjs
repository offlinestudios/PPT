// Complete one-click booking regression suite. Network and Square appointments are never submitted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { JSDOM, VirtualConsole } = require('jsdom');
const D = require('./data');

const root = path.join(__dirname, '..');
const expected = Object.keys(D.svcData).filter(key => key !== 'document-services');
const photoFiles = new Set(expected.map(key => D.svcFile[key]));
const squareURL = 'https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P';
const formats = [
  ['Prints', 'Prints', '$24.99'],
  ['Digital', 'Digital', '$24.99'],
  ['Both', 'Prints + Digital', '$39.99']
];
const hubNames = {
  'passport-photos': 'Passport photos',
  digital: 'Digital passport photos',
  'visa-photos': 'Visa photos',
  'digital-id': 'Digital ID photos'
};
let selections = 0;
let documentsTested = 0;
let unchangedPages = 0;
let unchangedBookingPages = 0;

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function fixture(file) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(read(file), {
    url: 'https://www.passportphototoronto.com/' + file,
    runScripts: 'outside-only',
    virtualConsole
  });
  const w = dom.window;
  const d = w.document;
  const calls = [];
  const pending = new Map();
  let timerID = 0;
  let opens = 0;
  let bookingClicks = 0;
  let srcWrites = 0;
  const add = d.body.classList.add.bind(d.body.classList);
  d.body.classList.add = (...classes) => {
    if (classes.includes('book-open')) opens++;
    return add(...classes);
  };
  d.addEventListener('click', event => {
    if (event.target.closest('[data-book]')) bookingClicks++;
  }, true);
  w.setInterval = () => 0;
  w.setTimeout = (fn, delay) => { pending.set(++timerID, { fn, delay }); return timerID; };
  w.clearTimeout = id => pending.delete(id);
  w.fetch = async (url, options) => { calls.push(JSON.parse(options.body)); return { ok: true }; };
  w.navigator.sendBeacon = () => { throw new Error('Unexpected unstubbed analytics path'); };
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new w.Event('close'));
  };
  const frame = d.querySelector('.book-frame iframe');
  if (frame) {
    const descriptor = Object.getOwnPropertyDescriptor(w.HTMLIFrameElement.prototype, 'src');
    Object.defineProperty(frame, 'src', {
      get() { return descriptor.get.call(this); },
      set(value) { srcWrites++; descriptor.set.call(this, value); }
    });
    const setAttribute = frame.setAttribute.bind(frame);
    frame.setAttribute = (name, value) => {
      if (name === 'src') srcWrites++;
      return setAttribute(name, value);
    };
  }
  return {
    w, d, frame, calls, errors, pending,
    get opens() { return opens; },
    get bookingClicks() { return bookingClicks; },
    get srcWrites() { return srcWrites; },
    evaluate(file) { w.eval(read(file)); },
    async flushTracking(expectedTimers = 1) {
      const tracking = [...pending].filter(([, timer]) => timer.delay === 0);
      assert.equal(tracking.length, expectedTimers, file + ' one deferred tracking dispatch per open');
      for (const [id, timer] of tracking) { pending.delete(id); timer.fn(); }
      await new Promise(setImmediate);
    },
    finish() {
      assert.deepEqual(errors.map(error => error.message), [], file + ' no runtime errors');
      w.close();
    }
  };
}

function expectedService(page, selected) {
  if (!selected) return hubNames[page] || D.svcData[page].name;
  const name = selected === 'unlisted'
    ? page === 'visa-photos' ? 'Other visa application' : 'Other passport application'
    : D.svcData[selected].name;
  return /photos?$/i.test(name) ? name : name + ' photos';
}

function assertSummary(f, page, selected, format, label, price) {
  const { d } = f;
  assert.equal(d.querySelector('[data-booking-service]').textContent, expectedService(page, selected), page + ' correct application');
  assert.equal(d.querySelector('[data-booking-format]').textContent, label, page + ' correct format');
  assert.equal(d.querySelector('[data-booking-price]').textContent, price + ' CAD + tax', page + ' correct price');
  assert.equal(d.querySelectorAll('[data-format][aria-pressed="true"]').length, 1);
  assert.equal(d.querySelector('[data-format="' + format + '"]').getAttribute('aria-pressed'), 'true');
  assert.match(d.querySelector('.booking-selection').textContent, /Your selection isn’t pre-filled/);
}

function assertClosed(f, returnTo) {
  assert(!f.d.body.classList.contains('book-open'));
  assert(!f.d.querySelector('#main').inert);
  if (returnTo) assert.equal(f.d.activeElement, returnTo, 'focus returns to the invoking control');
}

async function runPhotoPage(key) {
  const file = D.svcFile[key];
  const f = fixture(file);
  const { w, d, frame } = f;
  assert(d.querySelector('.arrival-rating').textContent.includes('400+'), file + ' static review count');
  assert(!d.body.classList.contains('book-open'), file + ' no static modal');
  assert(!frame.getAttribute('src'), file + ' Square is lazy before enhancement');
  for (const link of d.querySelectorAll('[data-book]')) {
    assert.equal(link.getAttribute('href'), 'scheduling.html', file + ' no-JavaScript booking fallback');
  }
  for (const name of ['catalog', 'choices', 'requirements', 'app', 'refinements']) {
    f.evaluate('js/landing-' + name + '.js');
  }
  f.evaluate('js/booking-feedback.js');
  f.evaluate('js/redesign.js');
  assert.deepEqual([...w.PHOTO_SERVICE_PAGES].sort(), expected.slice().sort(), file + ' exact 49-page scope');
  assert(!w.PHOTO_SERVICE_PAGES.includes('unlisted'));
  assert(!w.PHOTO_SERVICE_PAGES.includes('document-services'));
  assert(d.querySelector('.arrival-rating').textContent.includes('4.9'));
  assert(d.querySelector('.arrival-rating').textContent.includes('400+'));
  assert.equal(f.opens, 0, file + ' no initial modal');
  assert.equal(f.bookingClicks, 0, file + ' no initial booking dispatch');
  assert.equal(f.srcWrites, 0);
  assert.equal(f.calls.length, 0);
  assertClosed(f);
  await f.flushTracking(0);
  assert.equal(d.querySelectorAll('.booking-selection').length, 1);
  const overlay = d.querySelector('.book-overlay');
  assert.equal(overlay.getAttribute('aria-describedby'), 'booking-selection');
  assert.equal(d.querySelector('.booking-selection').getAttribute('aria-live'), 'polite');
  assert(d.querySelector('.booking-feedback').hidden);
  // The existing feedback initializer must be safe if loaded twice.
  f.evaluate('js/booking-feedback.js');
  assert.equal(d.querySelectorAll('.booking-selection,.booking-feedback').length, 2);

  const cta = d.querySelector('.selector [data-book]');
  const documentControl = d.querySelector('#document');
  const buttons = [...d.querySelectorAll('[data-format]')];
  assert.equal(buttons.length, 3);
  for (const button of buttons) assert.equal(button.getAttribute('aria-haspopup'), 'dialog');
  if (documentControl.tagName === 'SELECT') {
    assert.equal(documentControl.value, '');
    for (const button of buttons) {
      button.click();
      assertClosed(f);
      assert.equal(f.opens, 0, file + ' hub format waits for a document');
      assert.equal(f.bookingClicks, 0);
      assert.equal(f.srcWrites, 0);
    }
  }
  const documents = documentControl.tagName === 'SELECT'
    ? [...documentControl.options].map(option => option.value).filter(Boolean)
    : [key];
  documentsTested += documents.length;
  let testedInterruptedLoad = false;
  for (const selected of documents) {
    const beforeChange = f.opens;
    documentControl.value = selected;
    documentControl.dispatchEvent(new w.Event('change'));
    assertClosed(f);
    assert.equal(f.opens, beforeChange, file + ' document change alone never opens booking');
    await f.flushTracking(0);
    for (const [format, label, price] of formats) {
      const button = d.querySelector('[data-format="' + format + '"]');
      const before = f.opens;
      const beforeClick = f.bookingClicks;
      button.click();
      selections++;
      assert(d.body.classList.contains('book-open'));
      assert.equal(f.opens, before + 1, file + ' one modal open per format selection');
      assert.equal(f.bookingClicks, beforeClick + 1, file + ' one existing CTA dispatch per format selection');
      assertSummary(f, key, selected, format, label, price);
      assert.equal(d.activeElement, d.querySelector('.book-close'));
      assert(d.querySelector('#main').inert);
      assert.equal(frame.src, squareURL);
      assert.equal(f.srcWrites, 1, file + ' retain the same Square session');
      await f.flushTracking();

      if (!testedInterruptedLoad) {
        testedInterruptedLoad = true;
        const feedback = d.querySelector('.booking-feedback');
        assert.equal(frame.loading, 'eager');
        assert.equal(frame.getAttribute('aria-busy'), 'true');
        assert(!feedback.hidden);
        assert.match(feedback.textContent, /Loading available appointments/);
        assert(feedback.classList.contains('is-loading'));
        assert.equal(feedback.querySelectorAll('button,a').length, 0);
        // Dismiss and reopen before Square finishes without starting a second iframe.
        d.querySelector('.book-close').click();
        assertClosed(f, button);
        const beforeReopen = f.opens;
        button.click();
        assert.equal(f.opens, beforeReopen + 1);
        assert.equal(f.srcWrites, 1);
        assertSummary(f, key, selected, format, label, price);
        await f.flushTracking();
        const slow = [...f.pending.values()].filter(timer => timer.delay === 8000);
        assert.equal(slow.length, 1);
        slow[0].fn();
        assert.match(feedback.textContent, /Still loading available appointments/);
        frame.dispatchEvent(new w.Event('load'));
        assert(feedback.hidden);
        assert(!feedback.classList.contains('is-loading'));
        assert(!frame.hasAttribute('aria-busy'));
        assert.equal([...f.pending.values()].filter(timer => timer.delay === 8000).length, 0);
      }
      if (format === 'Digital') {
        d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      } else {
        d.querySelector(format === 'Both' ? '.book-backdrop' : '.book-close').click();
      }
      assertClosed(f, button);
    }
  }

  // Explicit repeat, original CTA, and mobile-menu fallback remain available.
  const both = d.querySelector('[data-format="Both"]');
  both.click();
  assertSummary(f, key, documentControl.value, 'Both', 'Prints + Digital', '$39.99');
  await f.flushTracking();
  d.querySelector('.book-close').click();
  assertClosed(f, both);
  cta.focus();
  cta.click();
  await f.flushTracking();
  d.querySelector('.book-close').click();
  assertClosed(f, cta);
  const menu = d.querySelector('#mobile-menu');
  const toggle = d.querySelector('.menu-toggle');
  toggle.click();
  assert(menu.open);
  const mobile = menu.querySelector('[data-book]');
  mobile.focus();
  mobile.click();
  assert(!menu.open);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  await f.flushTracking();
  d.querySelector('.book-close').click();
  assertClosed(f, toggle);
  if (documentControl.tagName === 'SELECT') {
    const beforeClear = f.opens;
    documentControl.value = '';
    documentControl.dispatchEvent(new w.Event('change'));
    for (const button of buttons) button.click();
    assert.equal(f.opens, beforeClear, file + ' cleared hub document gates subsequent format clicks');
    assertClosed(f);
    cta.focus();
    cta.click();
    assertSummary(f, key, '', 'Both', 'Prints + Digital', '$39.99');
    await f.flushTracking();
    d.querySelector('.book-close').click();
    assertClosed(f, cta);
  }
  assert.equal(f.srcWrites, 1);
  assert(d.querySelector('.booking-feedback').hidden);
  assert.equal(d.querySelectorAll('link[data-square-preconnect]').length, 2);
  assert.equal(f.calls.filter(call => call.event === 'square_booking_page_view').length, 1);
  assert.equal(f.calls.filter(call => call.event === 'square_booking_widget_interaction').length, 1);
  assert.equal(f.calls.length, 2, file + ' only existing deduplicated analytics');
  assert.equal(d.querySelectorAll('.booking-selection').length, 1);
  f.finish();
}

async function auditNonPhotoPages() {
  const baseline = process.env.PHOTO_BOOKING_BASELINE || 'HEAD';
  const files = cp.execFileSync('git', ['ls-tree', '-r', '--name-only', baseline], { cwd: root, encoding: 'utf8' })
    .trim().split('\n').filter(file => file.endsWith('.html') && !photoFiles.has(file));
  assert(files.includes('document-services.html'), 'printing/scanning page explicitly audited');
  assert(files.includes('passport-photos-annex.html'), 'neighbourhood page explicitly audited');
  for (const file of files) {
    const original = cp.execFileSync('git', ['show', baseline + ':' + file], { cwd: root, encoding: 'utf8' });
    assert.equal(read(file), original, file + ' outside rollout remains byte-for-byte unchanged');
    unchangedPages++;
    const f = fixture(file);
    const { d } = f;
    assert(!expected.includes(d.body.dataset.photoService), file + ' not in photo-page scope');
    if (f.frame && d.querySelector('[data-book]')) {
      f.evaluate('js/booking-feedback.js');
      f.evaluate('js/redesign.js');
      assert(!d.querySelector('.booking-selection'), file + ' no photo-format booking summary added');
      assert(!d.body.classList.contains('book-open'), file + ' no initial booking');
      const cta = d.querySelector('[data-book]');
      cta.focus();
      cta.click();
      assert(d.body.classList.contains('book-open'), file + ' original CTA still opens');
      assert.equal(f.frame.src, squareURL);
      await f.flushTracking();
      d.querySelector('.book-close').click();
      assert(!d.body.classList.contains('book-open'));
      assert.equal(d.activeElement, cta);
      unchangedBookingPages++;
    }
    f.finish();
  }
}

(async () => {
  assert.equal(expected.length, 49, 'approved service-page rollout count');
  for (const key of expected) await runPhotoPage(key);
  await auditNonPhotoPages();
  console.log(`PASS: ${expected.length} photo-service pages; ${documentsTested} documents × 3 formats = ${selections} bookings; ${unchangedPages} non-target HTML pages byte-for-byte unchanged, including ${unchangedBookingPages} original booking flows.`);
  console.log('PASS: exact scope, static/runtime review counts, application/format/price summaries, visa/passport unlisted and hub fallbacks, initial/change-only gating, single dispatch, interrupted/slow loading, iframe/session reuse, close/Escape/backdrop/reopen, focus return, CTA/mobile menu and no-JavaScript fallback. No network calls or appointments submitted.');
})().catch(error => { console.error(error); process.exitCode = 1; });
