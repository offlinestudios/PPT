const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process'),{JSDOM}=require('jsdom'),D=require('./data');
const root=path.join(__dirname,'..');let count=0;
for(const key of Object.keys(D.svcData).filter(k=>k!=='document-services')){
 const file=D.svcFile[key],html=fs.readFileSync(path.join(root,file),'utf8');
 const dom=new JSDOM(html,{url:'https://www.passportphototoronto.com/'+file,runScripts:'outside-only'}),w=dom.window,d=w.document;
 const old=new JSDOM(cp.execFileSync('git',['show','HEAD:'+file],{cwd:root,encoding:'utf8'})).window;
 assert.equal(d.title,old.document.title,file+' title');
 assert.equal(d.querySelector('link[rel=canonical]')?.href,old.document.querySelector('link[rel=canonical]')?.href,file+' canonical');
 assert.equal(d.querySelector('meta[name=description]')?.content,old.document.querySelector('meta[name=description]')?.content,file+' description');
 assert(!/noindex|Prototype preview|Design B/.test(html),file+' production content');
 assert.equal(d.querySelectorAll('h1').length,1,file+' static h1');
 const options=[...d.querySelectorAll('#document option:not([value=""])')].map(o=>o.value);
 if(['digital','passport-photos'].includes(key)){
   const countries=['canadian-passport','us-passport','uk-passport','indian-passport','chinese-passport','french-passport','german-passport','unlisted'];
   assert.deepEqual([...options].sort(),countries.sort(),file+' seven countries and unlisted option');
 }else if(['visa-photos','digital-id'].includes(key)) assert.equal(options.length,3,file+' focused shortlist');
 else {assert.equal(options.length,0);assert.equal(d.querySelector('#document').type,'hidden');assert.equal(d.querySelector('#document').value,key);}
 assert(d.querySelector('.book-overlay'));assert(d.querySelector('script[src="js/redesign.js"]'));
 for(const n of d.querySelectorAll('img[src],script[src],link[rel=stylesheet]')){const url=n.getAttribute('src')||n.getAttribute('href');if(!/^(https?:|\/\/|data:)/.test(url))assert(fs.existsSync(path.join(root,url.split('?')[0])),file+' '+url)}
 const links=[...d.querySelectorAll('.service-links a')].map(a=>a.href);assert.equal(new Set(links).size,5);assert(!links.some(a=>a.endsWith('/'+file)));
 for(const name of ['catalog','choices','requirements','app','refinements'])w.eval(fs.readFileSync(path.join(root,'js/landing-'+name+'.js'),'utf8'));
 assert.equal(d.querySelectorAll('#sample-dialog').length,1);
 const choice=d.querySelector('#document');if(choice.tagName==='SELECT'){choice.value=[...choice.options].find(o=>o.value).value;choice.dispatchEvent(new w.Event('change'));}assert.equal(d.querySelectorAll('.footer-studio').length,1);
 d.querySelector('[data-format=Both]').click();assert.equal(d.querySelector('[data-format=Both]').getAttribute('aria-pressed'),'true');assert(/DIGITAL|STUDIO PRINT SAMPLE/.test(d.querySelector('#sample-format').textContent));if(options.includes('unlisted')){choice.value='unlisted';choice.dispatchEvent(new w.Event('change'));assert(!d.querySelector('#requirements').innerHTML.includes('undefined'));assert(d.querySelector('#requirements').textContent.includes('Photos for your application'));}assert(!d.body.textContent.includes('↗'));assert(d.querySelector('.ui-icon'));assert(!d.querySelector('#spec').textContent.includes('$'));
 assert(d.querySelector('[data-book]').getAttribute('href')==='scheduling.html');
 w.close();old.close();count++;
}
console.log('PASS: '+count+' static pages, preserved SEO, local assets, unique links, selectors, sample updates and booking destinations.');
// Exercise the existing booking handler with all network calls stubbed.
{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'uk-passport-photos.html'),'utf8'),{url:'https://www.passportphototoronto.com/uk-passport-photos.html',runScripts:'outside-only'}),w=dom.window,d=w.document;
 w.fetch=async()=>({ok:true,json:async()=>({})});w.navigator.sendBeacon=()=>true;
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
 for(const name of ['catalog','choices','requirements','app','refinements'])w.eval(fs.readFileSync(path.join(root,'js/landing-'+name+'.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'js/redesign.js'),'utf8'));
 d.querySelector('[data-book]').click();assert(d.body.classList.contains('book-open'));assert(d.querySelector('.book-frame iframe').src.includes('square.site/appointments/buyer/widget/'));
 d.querySelector('.book-close').click();assert(!d.body.classList.contains('book-open'));setImmediate(()=>w.close());console.log('PASS: real Square booking handler opens and closes; no network or booking submitted.');
}
// Loading feedback stays useful during slow iframe responses; reopening retains the session.
{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'canadian-passport-photos.html'),'utf8'),{url:'https://www.passportphototoronto.com/canadian-passport-photos.html',runScripts:'outside-only'}),w=dom.window,d=w.document;
 const timers=[];w.setTimeout=(fn,delay)=>{timers.push({fn,delay});return timers.length};w.clearTimeout=()=>{};w.setInterval=()=>{};w.fetch=async()=>({ok:true,json:async()=>({})});
 w.eval(fs.readFileSync(path.join(root,'js/booking-feedback.js'),'utf8'));w.eval(fs.readFileSync(path.join(root,'js/redesign.js'),'utf8'));
 const button=d.querySelector('.selector [data-book]'),frame=d.querySelector('.book-frame iframe');button.focus();button.click();
 assert(d.body.classList.contains('book-open'));assert.match(d.querySelector('.booking-feedback').textContent,/Loading available appointments/);assert.equal(frame.loading,'eager');assert.equal(frame.getAttribute('aria-busy'),'true');
 timers.find(x=>x.delay===8000).fn();assert.match(d.querySelector('.booking-feedback').textContent,/Still loading/);assert.equal(d.querySelectorAll('.booking-feedback button,.booking-feedback a').length,0);
 frame.dispatchEvent(new w.Event('load'));assert(!frame.hasAttribute('aria-busy'));assert(d.querySelector('.booking-feedback').hidden);const src=frame.src;
 d.querySelector('.book-close').click();assert.equal(d.activeElement,button);button.click();assert.equal(frame.src,src);assert(!d.querySelector('.booking-feedback').classList.contains('is-loading'));
 assert.equal(d.querySelectorAll('link[data-square-preconnect]').length,2);w.close();console.log('PASS: immediate loading, slow loading status, iframe load state, warm connections, retained session and focus return.');
}
