(function(){
const headline=document.querySelector('.guided-intro h1');
headline.insertAdjacentHTML('afterend','<div class="arrival-info"><a class="arrival-rating" href="reviews.html"><span aria-hidden="true">★</span> <strong>4.9</strong> <span>Google · 372 reviews</span></a><div class="arrival-visit"><a class="arrival-address" href="#visit">63 McCaul St<span>Downtown Toronto</span></a><div class="arrival-availability"><strong>Walk-ins welcome</strong><span class="arrival-status" data-business-status><span data-business-status-text>Mon–Fri 9–7 · Sat–Sun 12–6</span></span></div></div></div>');
const key=document.body.dataset.photoService;
document.querySelector('.selector h2').textContent=!['digital','visa-photos','passport-photos','digital-id'].includes(key)?'Choose your photo option':key==='digital'?'Choose your digital photo':key==='visa-photos'?'Choose your visa photo':key==='digital-id'?'Choose your ID photo':'Choose your passport photo';
const arrow='<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
document.querySelector('.sticky').innerHTML='<a class="button outline" href="https://www.google.com/maps/dir/?api=1&destination=Passport+Photo+Toronto,+63+McCaul+St,+Toronto,+ON+M5T+2W7" target="_blank" rel="noopener">Directions '+arrow+'</a><a class="button" href="scheduling.html" data-book>Book now '+arrow+'</a>';


const other=document.querySelector('#document option[value="unlisted"]');if(other)other.textContent='Other';
const visitLink=document.querySelector('.walkin-option');
visitLink.innerHTML='Studio hours & directions '+arrow;
visitLink.setAttribute('aria-label','View studio hours and directions');
const repeatedRating=document.querySelector('.proof-metrics>div:first-child');
repeatedRating.innerHTML='<b>7 days</b><span>Open every day of the week</span>';
document.querySelector('.retake-proof').textContent='Accepted or retaken free';
document.querySelector('.arrival-rating').insertAdjacentHTML('afterend','<span class="arrival-speed">10 minutes or less</span>');
// A larger inline sample and an accessible zoom viewer with isolated controls.
const sampleStage=document.querySelector('.sample-stage');
const sampleImage=document.querySelector('#sample-image');
const zoomTrigger=document.createElement('button');zoomTrigger.type='button';zoomTrigger.className='sample-zoom-trigger';zoomTrigger.setAttribute('aria-label','Zoom in on photo sample');
sampleImage.before(zoomTrigger);zoomTrigger.append(sampleImage);
document.querySelector('#expand-sample').remove();
sampleStage.insertAdjacentHTML('afterend','<p class="zoom-hint">Tap the photo to zoom in</p>');
const sampleModal=document.querySelector('#sample-dialog');
sampleModal.innerHTML='<div class="zoom-toolbar"><h2>Photo sample</h2><button type="button" class="zoom-close" aria-label="Close photo sample">×</button></div><div class="zoom-controls"><button type="button" data-zoom="out" aria-label="Zoom out">−</button><output aria-live="polite">100%</output><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="reset">Reset</button></div><div class="zoom-viewport" tabindex="0" aria-label="Photo sample. Scroll to explore when zoomed."><img id="large-sample" alt=""></div><p class="zoom-caption">Use + to enlarge, then scroll to explore the photo.</p>';
let sampleZoom=1;const largeSample=sampleModal.querySelector('img'),zoomOutput=sampleModal.querySelector('output');
function setSampleZoom(value){sampleZoom=Math.max(1,Math.min(3,value));largeSample.style.width=(sampleZoom*100)+'%';zoomOutput.textContent=Math.round(sampleZoom*100)+'%';sampleModal.querySelector('[data-zoom="out"]').disabled=sampleZoom===1;sampleModal.querySelector('[data-zoom="in"]').disabled=sampleZoom===3;}
zoomTrigger.onclick=()=>{largeSample.src=sampleImage.src;largeSample.alt=sampleImage.alt;setSampleZoom(1);sampleModal.showModal();sampleModal.querySelector('.zoom-close').focus();};
sampleModal.querySelector('.zoom-close').onclick=()=>sampleModal.close();
sampleModal.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>setSampleZoom(b.dataset.zoom==='reset'?1:sampleZoom+(b.dataset.zoom==='in'?.5:-.5)));
sampleModal.addEventListener('close',()=>zoomTrigger.focus());
// Requirements already explain what to bring; avoid repeating the generic paragraph.
document.querySelector('.sample-module > .micro')?.remove();
function showCountryBackground(){
 document.querySelector('.country-background-note')?.remove();
 const country=document.querySelector('#document')?.value;
 if(!['french-passport','german-passport'].includes(country))return;
 const requirements=document.querySelector('#requirements');
 requirements.querySelector('h3')?.insertAdjacentHTML('afterend','<p class="country-background-note">We use a light-grey background for your '+(country==='french-passport'?'French':'German')+' passport photo.</p>');
}
document.querySelector('#document').addEventListener('change',showCountryBackground);
document.querySelectorAll('[data-format]').forEach(b=>b.addEventListener('click',showCountryBackground));
showCountryBackground();
const sampleModule=document.querySelector('.sample-module');
const sampleCopy=document.createElement('div');sampleCopy.className='sample-copy';
const sampleVisual=document.createElement('div');sampleVisual.className='sample-visual';
for(const el of [...sampleModule.children]){if(el.matches('.sample-stage,.zoom-hint,#sample-caption'))sampleVisual.append(el);else sampleCopy.append(el)}
sampleModule.append(sampleCopy,sampleVisual);
// Footer directories precede studio details. Keep this idempotent after static generation.
const footerShell=document.querySelector('.site-footer > .shell');
if(!footerShell.querySelector('.footer-studio')){
const footerContact=footerShell.querySelector('.col:last-child');
footerShell.querySelectorAll('.col:not(.brand-col)').forEach(el=>el.classList.add('footer-directory'));
footerContact.className='footer-studio';
footerContact.innerHTML='<div class="footer-address"><h3>Visit the studio</h3><a href="location.html">63 McCaul St<br>Toronto, ON M5T 2W7</a></div><div class="footer-hours"><h3>Opening hours</h3><p>Mon–Fri <span>9 AM – 7 PM</span><br>Sat–Sun <span>12 PM – 6 PM</span></p></div><div class="footer-reach"><h3>Get in touch</h3><a href="tel:4169862677">(416) 986-2677</a><a href="mailto:info@passportphototoronto.com">info@passportphototoronto.com</a></div>';
footerShell.append(footerContact);
const reach=footerContact.querySelector('.footer-reach');
const address=footerContact.querySelector('.footer-address');
reach.querySelectorAll('a').forEach(link=>address.append(link));
reach.remove();

}

})();
