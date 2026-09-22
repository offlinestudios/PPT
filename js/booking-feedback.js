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
  var style = document.createElement('style');
  style.textContent = '.booking-feedback[hidden]{display:none}.booking-feedback{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:12px 18px;background:#fff;border-bottom:1px solid #dce1e8;font:14px/1.5 sans-serif;color:#2b4b8c;flex-shrink:0}.booking-feedback a{color:#2b4b8c;text-decoration:underline}.booking-feedback [role=status]{flex:1;min-width:160px}.booking-feedback button{padding:5px 10px;background:white;border:1px solid #2b4b8c;border-radius:5px;color:#2b4b8c;cursor:pointer}.booking-feedback.is-loading [role=status]:before{content:"";display:inline-block;width:12px;height:12px;border:2px solid #dce1e8;border-top-color:#2b4b8c;border-radius:50%;margin-right:8px;vertical-align:-2px;animation:booking-spin .8s linear infinite}@keyframes booking-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.booking-feedback.is-loading [role=status]:before{animation:none}}.book-frame{min-height:0}.booking-feedback [hidden]{display:none}';
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
    e.preventDefault();opener=document.activeElement;overlay._bookingOpener=opener;warmConnection();
    document.body.classList.add('book-open');
    if(!frame.getAttribute('src')){startLoading();frame.loading='eager';frame.src=src;}
    overlay.querySelector('.book-close')?.focus();
  }
  function close(){document.body.classList.remove('book-open');if(opener)opener.focus();}
  document.addEventListener('click',open,true);
  document.addEventListener('pointerover',function(e){if(e.target.closest('[data-book]'))warmConnection();},{passive:true});
  document.addEventListener('focusin',function(e){if(e.target.closest('[data-book]'))warmConnection();});
  document.addEventListener('click',function(e){if(e.target.closest('.book-close,.book-backdrop')){e.preventDefault();close();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('book-open'))close();});
})();
