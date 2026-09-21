// Static, indexable service pages with the approved guided layout.
const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const D=require('./data'),T=require('./templates');
const root=path.join(__dirname,'..'),source=path.join(__dirname,'landing');
const read=f=>fs.readFileSync(path.join(source,f),'utf8');
const catalog={},related={};
for(const [key,s] of Object.entries(D.svcData)){
 related[key]=D.relatedKeys(key).filter(k=>k!==key).map(k=>({name:D.svcData[k].name,file:D.svcFile[k]}));
 if(key==='document-services')continue;
 catalog[key]={name:s.name,title:/Toronto/i.test(D.svcTitle(key))?D.svcTitle(key):D.svcTitle(key)+' in Toronto',file:D.svcFile[key],size:s.size,face:s.face,sample:s.sample&&fs.existsSync(path.join(root,s.sample))?s.sample:null};
}
const scripts={catalog:'window.PHOTO_CATALOG='+JSON.stringify(catalog)+';\nwindow.PHOTO_RELATED='+JSON.stringify(related)+';',choices:read('choices.js'),requirements:read('requirements.js'),app:read('app.js')};
let css=read('style.css');const siteCss=fs.readFileSync(path.join(root,'css/redesign.css'),'utf8');
css+='\n'+siteCss.slice(siteCss.indexOf('.book-overlay {'),siteCss.indexOf('.book-frame iframe {'))+'.book-frame iframe{border:0;width:100%;height:100%;background:white;display:block}\n.book-modal{width:min(560px,96vw)}.book-close{width:44px;height:44px}.choice:focus-visible{outline:3px solid var(--navy);outline-offset:3px}\n';
fs.writeFileSync(path.join(root,'css/landing.css'),css);
for(const [name,code] of Object.entries(scripts))fs.writeFileSync(path.join(root,'js/landing-'+name+'.js'),code);
for(const [key,item] of Object.entries(catalog)){
 const existing=fs.readFileSync(path.join(root,item.file),'utf8');
 const head=existing.match(/<head[^>]*>([\s\S]*?)<\/head>/i)[1].replace(/<link[^>]+href=["']css\/(?:redesign|landing)\.css[^>]*>/g,'');
 const doc=new JSDOM(read('page.html'),{url:'https://www.passportphototoronto.com/'+item.file,runScripts:'outside-only'});
 const w=doc.window,d=w.document;
 d.head.innerHTML='<meta charset="utf-8">'+head+'<link rel="stylesheet" href="css/landing.css?v=3">';
 d.body.dataset.photoService=key;
 d.querySelectorAll('script').forEach(n=>{if(n.closest('body'))n.remove()});
 d.querySelector('#booking').remove();
 d.querySelectorAll('[src^="../"]').forEach(n=>n.setAttribute('src',n.getAttribute('src').slice(3)));
 d.querySelectorAll('[data-book]').forEach(n=>{const a=d.createElement('a');a.className=n.className;a.innerHTML=n.innerHTML;a.href='scheduling.html';a.setAttribute('data-book','');n.replaceWith(a)});
 for(const code of Object.values(scripts))w.eval(code);
 d.querySelector('.map-loading').hidden=true;
 d.querySelectorAll('[data-book]').forEach(n=>{n.setAttribute('href','scheduling.html')});
 d.body.insertAdjacentHTML('afterbegin','<noscript><iframe height="0" src="https://www.googletagmanager.com/ns.html?id=GTM-55RV84CT" style="display:none;visibility:hidden" width="0"></iframe></noscript>');
 d.body.insertAdjacentHTML('beforeend',T.bookingModal());
 // Keep production tail tracking tags from the existing page.
 const tail=existing.slice(existing.lastIndexOf('<script src="js/redesign.js"></script>')+ '<script src="js/redesign.js"></script>'.length).replace(/<\/body>[\s\S]*$/i,'');
 for(const name of Object.keys(scripts))d.body.insertAdjacentHTML('beforeend','<script charset="utf-8" src="js/landing-'+name+'.js?v=6"></script>');
 d.body.insertAdjacentHTML('beforeend','<script src="js/redesign.js"></script>'+tail);
 fs.writeFileSync(path.join(root,item.file),doc.serialize());w.close();
}
console.log('Generated '+Object.keys(catalog).length+' guided photo pages.');
