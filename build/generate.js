#!/usr/bin/env node
/* Regenerates the templated + core pages from the approved design.
   Run: node build/generate.js  (from the repo root)

   The <head> of every page is carried over verbatim from the existing file —
   title, meta description, canonical, OG/Twitter, JSON-LD, favicon, GTM, gtag
   and attribution.js are all load-bearing for SEO and Google Ads. The only
   edits made to it are dropping the old page-scoped <style> blocks and
   swapping css/styles.css for css/redesign.css. */

const fs = require('fs');
const path = require('path');
const D = require('./data');
const T = require('./templates');

const ROOT = path.join(__dirname, '..');
const GTM_NOSCRIPT =
  '<noscript><iframe height="0" src="https://www.googletagmanager.com/ns.html?id=GTM-55RV84CT" style="display:none;visibility:hidden" width="0"></iframe></noscript>';

const HEADS = require('./heads.json');

/* Meta (Facebook) Pixel — tracks ad conversions site-wide. Injected at the top
   of every generated page's <head> per Meta's "as high as possible" guidance.
   Fires a single PageView; standard events can be layered on later. */
const META_PIXEL = `<!-- Meta Pixel Code -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1269166778491566');
fbq('track', 'PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1269166778491566&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->`;

function page({ file, active, body, sticky }) {
  const entry = HEADS[file];
  if (!entry) throw new Error(`no head captured for ${file} — run build/extract-heads.js`);
  const { head, tail } = entry;
  const bodyClass = sticky ? ' class="has-sticky-bar"' : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${META_PIXEL}
${head}
</head>
<body${bodyClass}>
${GTM_NOSCRIPT}
${T.header(active)}
<main>
${body}
</main>
${T.footer()}
${sticky ? T.stickyBar() : ''}
${T.bookingModal()}
<script src="js/redesign.js"></script>
${tail}
</body>
</html>
`;
}

function write(file, html) {
  fs.writeFileSync(path.join(ROOT, file), html);
}

let count = 0;
const missing = [];

function build(file, opts) {
  if (!HEADS[file]) {
    missing.push(file);
    return;
  }
  write(file, page({ file, ...opts }));
  count++;
}

/* ---- core pages ---- */
build('index.html', { active: 'index.html', body: T.home(), sticky: true });
build('services.html', { active: 'services.html', body: T.servicesHub() });
build('pricing.html', { active: 'pricing.html', body: T.pricing() });
build('reviews.html', { active: 'reviews.html', body: T.reviews() });
build('samples.html', { active: 'samples.html', body: T.samples() });
build('faq.html', { active: 'faq.html', body: T.faq() });
build('location.html', { active: 'location.html', body: T.location() });
build('about.html', { active: null, body: T.about() });
build('blog.html', { active: 'blog.html', body: T.blogIndex() });
build('contact.html', { active: 'contact.html', body: T.contact() });
build('jobs.html', { active: null, body: T.jobs() });
build('trusted-vendors.html', { active: null, body: T.vendors() });
build('refund-policy.html', { active: null, body: T.refund() });
build('digital-photo-payment.html', { active: null, body: T.payment() });
build('sitemap.html', { active: null, body: T.sitemapPage() });
build('scheduling.html', { active: null, body: T.booking() });

/* Pre-existing duplicate of the Chinese visa page; its <head> already
   canonicals to chinese-visa-photos.html, so that posture is preserved. */
build('test-breadcrumb-chinese-visa.html', {
  active: 'services.html',
  body: T.servicePage('chinese-visa'),
  sticky: true,
});

/* ---- blog articles ---- */
for (const b of D.blogDefs) {
  build(b.file, { active: 'blog.html', body: T.blogPost(b.key) });
}

/* ---- service detail pages (sticky mobile CTA bar) ---- */
for (const key of Object.keys(D.svcData)) {
  build(D.svcFile[key], { active: 'services.html', body: T.servicePage(key), sticky: true });
}

/* ---- service area pages ---- */
for (const area of D.areas) {
  build(D.areaFile(area), { active: null, body: T.areaPage(area), sticky: true });
}

console.log(`generated ${count} pages`);
if (missing.length) {
  console.error(`\nWARNING — expected files not found in repo (skipped):\n  ${missing.join('\n  ')}`);
  process.exitCode = 1;
}
