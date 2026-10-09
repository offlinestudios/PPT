const assert=require('node:assert/strict'),fs=require('fs'),{JSDOM}=require('jsdom'),D=require('./data');
const expected=Object.keys(D.svcData).filter(k=>k.endsWith('-passport')||['digital','passport-photos'].includes(k));
let selections=0,unaffected=0;
async function run(key){
 const file=D.svcFile[key],enabled=expected.includes(key),dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://www.passportphototoronto.com/'+file,runScripts:'outside-only'}),w=dom.window,d=w.document;
 assert(d.querySelector('.arrival-rating').textContent.includes(enabled?'400+':'372'),file+' static count');
 const calls=[],pending=[];w.setInterval=()=>{};w.setTimeout=(fn,ms)=>{pending.push({fn,ms});return pending.length};w.clearTimeout=()=>{};
 w.fetch=async(url,opts)=>{calls.push(JSON.parse(opts.body));return {ok:true}};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
 for(const n of ['catalog','choices','requirements','app','refinements'])w.eval(fs.readFileSync('js/landing-'+n+'.js','utf8'));
 w.eval(fs.readFileSync('js/booking-feedback.js','utf8'));w.eval(fs.readFileSync('js/redesign.js','utf8'));
 assert.deepEqual([...w.PASSPORT_PHOTO_PAGES].sort(),expected.slice().sort());assert(d.querySelector('.arrival-rating').textContent.includes('4.9'));assert(d.querySelector('.arrival-rating').textContent.includes(enabled?'400+':'372'));
 const frame=d.querySelector('.book-frame iframe'),cta=d.querySelector('.selector [data-book]'),doc=d.querySelector('#document');
 let opens=0;const add=d.body.classList.add.bind(d.body.classList);d.body.classList.add=(...xs)=>{if(xs.includes('book-open'))opens++;return add(...xs)};
 if(!enabled){for(const b of d.querySelectorAll('[data-format]')){b.click();assert(!d.body.classList.contains('book-open'))}assert(!d.querySelector('.booking-selection'));unaffected++;w.close();return;}
 let srcWrites=0;const desc=Object.getOwnPropertyDescriptor(w.HTMLIFrameElement.prototype,'src');Object.defineProperty(frame,'src',{get(){return desc.get.call(this)},set(v){srcWrites++;desc.set.call(this,v)}});
 if(doc.tagName==='SELECT'){
  assert.equal(doc.value,'');for(const b of d.querySelectorAll('[data-format]'))b.click();assert.equal(opens,0,'hub must wait for document');assert(!frame.getAttribute('src'));
 }
 const documents=doc.tagName==='SELECT'?[...doc.options].map(o=>o.value).filter(Boolean):[key];
 for(const selected of documents){
  doc.value=selected;doc.dispatchEvent(new w.Event('change'));assert(!d.body.classList.contains('book-open'),'document change alone stays on page');
  for(const [format,label,price] of [['Prints','Prints','$24.99'],['Digital','Digital','$24.99'],['Both','Prints + Digital','$39.99']]){
   const b=d.querySelector('[data-format='+format+']'),before=opens;b.click();selections++;
   assert.equal(b.getAttribute('aria-pressed'),'true');assert(d.body.classList.contains('book-open'));assert.equal(opens,before+1);
   assert.equal(d.querySelector('[data-booking-format]').textContent,label);assert.equal(d.querySelector('[data-booking-price]').textContent,price+' CAD + tax');
   const name=selected==='unlisted'?'Other passport application':w.PHOTO_CATALOG[selected].name;assert.equal(d.querySelector('[data-booking-service]').textContent,/photos?$/i.test(name)?name:name+' photos');
   assert.equal(d.activeElement,d.querySelector('.book-close'));assert(d.querySelector('#main').inert);assert.equal(frame.src,'https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P');
   if(srcWrites===1&&frame.hasAttribute('aria-busy')){assert.equal(frame.loading,'eager');pending.find(x=>x.ms===8000).fn();assert.match(d.querySelector('.booking-feedback').textContent,/Still loading/);frame.dispatchEvent(new w.Event('load'));assert(d.querySelector('.booking-feedback').hidden)}
   const tracks=pending.filter(x=>x.ms===0);pending.splice(0);assert.equal(tracks.length,1);tracks[0].fn();await new Promise(setImmediate);
   if(format==='Digital')d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));else d.querySelector(format==='Both'?'.book-backdrop':'.book-close').click();
   assert(!d.body.classList.contains('book-open'));assert.equal(d.activeElement,b);assert(!d.querySelector('#main').inert);
  }
 }
 assert.equal(srcWrites,1);assert.equal(calls.filter(x=>x.event==='square_booking_page_view').length,1);assert.equal(calls.filter(x=>x.event==='square_booking_widget_interaction').length,1);
 const both=d.querySelector('[data-format=Both]');both.click();assert.equal(d.querySelector('[data-booking-format]').textContent,'Prints + Digital');d.querySelector('.book-close').click();assert.equal(d.activeElement,both);
 cta.focus();cta.click();d.querySelector('.book-close').click();assert.equal(d.activeElement,cta);
 const menu=d.querySelector('#mobile-menu');menu.setAttribute('open','');const mobile=menu.querySelector('[data-book]');mobile.focus();mobile.click();assert(!menu.open);d.querySelector('.book-close').click();assert.equal(d.activeElement,d.querySelector('.menu-toggle'));
 if(doc.tagName==='SELECT'){doc.value='';cta.click();assert.equal(d.querySelector('[data-booking-service]').textContent,key==='digital'?'Digital passport photos':'Passport photos');d.querySelector('.book-close').click();}
 assert.equal(d.querySelectorAll('.booking-selection').length,1);w.close();
}
(async()=>{for(const key of Object.keys(D.svcData).filter(k=>k!=='document-services'))await run(key);console.log(`PASS: ${expected.length} passport pages, ${selections} document/format bookings, ${unaffected} unrelated pages unchanged; summary/counts, ordering, single dispatch, focus, dismiss/reopen, mobile-menu, hub gating, and loading.`)})().catch(e=>{console.error(e);process.exitCode=1});
