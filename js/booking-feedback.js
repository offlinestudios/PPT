/* Booking UI feedback only. No analytics, iframe-content inspection or appointment submission. */
(function () {
  'use strict';
  var overlay = document.querySelector('.book-overlay');
  if (!overlay || overlay.dataset.feedbackReady) return;
  overlay.dataset.feedbackReady = 'true';
  var frame = overlay.querySelector('iframe');
  var host = overlay.querySelector('.book-frame');
  var src = 'https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P';
  var opener, timer;
  var isPhotoServicePage = (window.PHOTO_SERVICE_PAGES || []).includes(document.body.dataset.photoService);
  var summary, background = [];
  if (isPhotoServicePage) {
    summary = document.createElement('div');
    summary.className = 'booking-selection';
    summary.id = 'booking-selection';
    summary.setAttribute('aria-live', 'polite');
    summary.innerHTML = '<div class="booking-selection-line"><strong data-booking-service></strong><span data-booking-format></span><b data-booking-price></b></div><p>Choose this service and format in Square below. Your selection isn’t pre-filled.</p>';
    host.before(summary);
    overlay.setAttribute('aria-describedby', summary.id);
  }
  function prepareSelection() {
    if (!isPhotoServicePage) return;
    var key = document.querySelector('#document')?.value || document.body.dataset.photoService;
    var item = window.PHOTO_CATALOG && window.PHOTO_CATALOG[key];
    var service = document.body.dataset.photoService;
    var hubNames = {'passport-photos':'Passport photos', digital:'Digital passport photos', 'visa-photos':'Visa photos', 'digital-id':'Digital ID photos'};
    var name = key === 'unlisted' ? (service === 'visa-photos' ? 'Other visa application' : 'Other passport application') : (hubNames[key] || item?.name || 'Document photos');
    summary.querySelector('[data-booking-service]').textContent = /photos?$/i.test(name) ? name : name + ' photos';
    var selected = document.querySelector('[data-format][aria-pressed="true"]');
    var format = selected ? selected.dataset.format : 'Prints';
    summary.querySelector('[data-booking-format]').textContent = format === 'Both' ? 'Prints + Digital' : format;
    summary.querySelector('[data-booking-price]').textContent = (format === 'Both' ? '$39.99' : '$24.99') + ' CAD + tax';
    // Keep the background out of keyboard navigation while the modal is open.
    if (!background.length) {
      background = Array.from(document.body.children).filter(function(el){return el !== overlay && !el.inert && !/^(SCRIPT|STYLE)$/.test(el.tagName);});
      background.forEach(function(el){el.inert=true;});
    }
  }
  var style = document.createElement('style');
  style.textContent = '.booking-selection{padding:14px 22px;background:#f7f8fa;border-top:1px solid #e2e6ee;border-bottom:1px solid #e2e6ee;flex-shrink:0;color:#2b4b8c}.booking-selection-line{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}.booking-selection strong{width:100%;font:700 15px/1.5 var(--heading,Montserrat,sans-serif)}.booking-selection span,.booking-selection b{font-size:14px}.booking-selection p{margin:7px 0 0;font:12px/1.5 var(--body,Open Sans,sans-serif);color:#555}@media(max-width:480px){.booking-selection{padding:10px 16px}.booking-selection p{font-size:12px}}'+'.booking-feedback[hidden]{display:none}.booking-feedback{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:12px 18px;background:#fff;border-bottom:1px solid #dce1e8;font:14px/1.5 sans-serif;color:#2b4b8c;flex-shrink:0}.booking-feedback a{color:#2b4b8c;text-decoration:underline}.booking-feedback [role=status]{flex:1;min-width:160px}.booking-feedback button{padding:5px 10px;background:white;border:1px solid #2b4b8c;border-radius:5px;color:#2b4b8c;cursor:pointer}.booking-feedback.is-loading [role=status]:before{content:"";display:inline-block;width:12px;height:12px;border:2px solid #dce1e8;border-top-color:#2b4b8c;border-radius:50%;margin-right:8px;vertical-align:-2px;animation:booking-spin .8s linear infinite}@keyframes booking-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.booking-feedback.is-loading [role=status]:before{animation:none}}.book-frame{min-height:0}.booking-feedback [hidden]{display:none}';
  document.head.append(style);
  var feedback = document.createElement('div');
  feedback.className = 'booking-feedback';feedback.hidden=true;
  feedback.innerHTML = '<span role="status" aria-live="polite">Choose your appointment in Square.</span>';
  host.before(feedback);
  var status = feedback.querySelector('[role=status]');
  function warmConnection() {
    if (document.querySelector('link[data-square-preconnect]')) return;
    ['https://square.site','https://book.squareup.com'].forEach(function(origin){var link=document.createElement('link');link.rel='preconnect';link.href=origin;link.dataset.squarePreconnect='';document.head.append(link);});
  }
  function startLoading() {
    clearTimeout(timer);feedback.classList.add('is-loading');status.textContent='Loading available appointments…';feedback.hidden=false;frame.setAttribute('aria-busy','true');
    timer=setTimeout(function(){status.textContent='Still loading available appointments…';},8000);
  }
  frame.addEventListener('load',function(){if(!frame.getAttribute('src'))return;clearTimeout(timer);feedback.classList.remove('is-loading');frame.removeAttribute('aria-busy');status.textContent='';feedback.hidden=true;});
  function open(e) {
    var trigger=e.target.closest('[data-book]');if(!trigger)return;
    e.preventDefault();opener=document.activeElement;
    if(isPhotoServicePage && opener?.closest('#mobile-menu'))opener=document.querySelector('.menu-toggle');
    overlay._bookingOpener=opener;warmConnection();prepareSelection();
    if(!isPhotoServicePage)document.body.classList.add('book-open');
    if(!frame.getAttribute('src')){startLoading();frame.loading='eager';frame.src=src;}
    if(!isPhotoServicePage)overlay.querySelector('.book-close')?.focus();
  }
  function close(){document.body.classList.remove('book-open');background.forEach(function(el){el.inert=false;});background=[];if(opener)opener.focus();}
  document.addEventListener('click',open,true);
  document.addEventListener('pointerover',function(e){if(e.target.closest('[data-book]'))warmConnection();},{passive:true});
  document.addEventListener('focusin',function(e){if(e.target.closest('[data-book]'))warmConnection();});
  document.addEventListener('click',function(e){if(e.target.closest('.book-close,.book-backdrop')){e.preventDefault();close();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('book-open'))close();});
})();
