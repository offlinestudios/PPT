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

function page({ file, active, body, sticky }) {
  const entry = HEADS[file];
  if (!entry) throw new Error(`no head captured for ${file} — run build/extract-heads.js`);
  const { head, tail } = entry;
  const bodyClass = sticky ? ' class="has-sticky-bar"' : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
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
build('index.html', { active: 'index.html', body: T.home() });
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
