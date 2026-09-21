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
 }else assert.equal(options.length,3,file+' focused shortlist');
 assert(d.querySelector('.book-overlay'));assert(d.querySelector('script[src="js/redesign.js"]'));
 for(const n of d.querySelectorAll('img[src],script[src],link[rel=stylesheet]')){const url=n.getAttribute('src')||n.getAttribute('href');if(!/^(https?:|\/\/|data:)/.test(url))assert(fs.existsSync(path.join(root,url.split('?')[0])),file+' '+url)}
 const links=[...d.querySelectorAll('.service-links a')].map(a=>a.href);assert.equal(new Set(links).size,5);assert(!links.some(a=>a.endsWith('/'+file)));
 for(const name of ['catalog','choices','requirements','app'])w.eval(fs.readFileSync(path.join(root,'js/landing-'+name+'.js'),'utf8'));
 assert.equal(d.querySelectorAll('#sample-dialog').length,1);
 const choice=d.querySelector('#document');choice.value=[...choice.options].find(o=>o.value).value;choice.dispatchEvent(new w.Event('change'));
 d.querySelector('[data-format=Both]').click();assert.equal(d.querySelector('[data-format=Both]').getAttribute('aria-pressed'),'true');assert(d.querySelector('#sample-format').textContent.includes('DIGITAL'));if(options.includes('unlisted')){choice.value='unlisted';choice.dispatchEvent(new w.Event('change'));assert(!d.querySelector('#requirements').innerHTML.includes('undefined'));assert(d.querySelector('#requirements').textContent.includes('Photos for your application'));}assert(!d.body.textContent.includes('↗'));assert(d.querySelector('.ui-icon'));assert(!d.querySelector('#spec').textContent.includes('$'));
 assert(d.querySelector('[data-book]').getAttribute('href')==='scheduling.html');
 w.close();old.close();count++;
}
console.log('PASS: '+count+' static pages, preserved SEO, local assets, unique links, selectors, sample updates and booking destinations.');
// Exercise the existing booking handler with all network calls stubbed.
{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'uk-passport-photos.html'),'utf8'),{url:'https://www.passportphototoronto.com/uk-passport-photos.html',runScripts:'outside-only'}),w=dom.window,d=w.document;
 w.fetch=async()=>({ok:true,json:async()=>({})});w.navigator.sendBeacon=()=>true;
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
 for(const name of ['catalog','choices','requirements','app'])w.eval(fs.readFileSync(path.join(root,'js/landing-'+name+'.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'js/redesign.js'),'utf8'));
 d.querySelector('[data-book]').click();assert(d.body.classList.contains('book-open'));assert(d.querySelector('.book-frame iframe').src.includes('square.site/appointments/buyer/widget/'));
 d.querySelector('.book-close').click();assert(!d.body.classList.contains('book-open'));setImmediate(()=>w.close());console.log('PASS: real Square booking handler opens and closes; no network or booking submitted.');
}
