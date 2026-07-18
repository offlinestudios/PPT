#!/usr/bin/env node
/* One-time extraction of every page's <head> (SEO + analytics) into
   build/heads.json, read from a git ref rather than the working tree — the
   generator overwrites the same files it reads, so sourcing from disk would
   degrade pages on a second run.

   Run: node build/extract-heads.js [ref]   (default ref: the pre-redesign commit)

   Only re-run this when a page's SEO metadata legitimately changes upstream. */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const D = require('./data');

const ROOT = path.join(__dirname, '..');
const REF = process.argv[2] || 'main';

const files = [
  'index.html', 'services.html', 'pricing.html', 'reviews.html', 'samples.html',
  'faq.html', 'location.html', 'about.html', 'blog.html', 'contact.html',
  'jobs.html', 'trusted-vendors.html', 'refund-policy.html',
  'digital-photo-payment.html', 'sitemap.html', 'scheduling.html',
  'test-breadcrumb-chinese-visa.html',
  ...D.blogDefs.map((b) => b.file),
  ...Object.keys(D.svcData).map((k) => D.svcFile[k]),
  ...D.areas.map((a) => D.areaFile(a)),
];

const out = {};
const missing = [];

for (const file of files) {
  let src;
  try {
    src = cp.execSync(`git show ${REF}:${file}`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
  } catch {
    missing.push(file);
    continue;
  }

  const m = src.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!m) {
    missing.push(file);
    continue;
  }

  let head = m[1]
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]+href="css\/styles\.css"[^>]*>/gi, '<link href="css/redesign.css" rel="stylesheet"/>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!/redesign\.css/.test(head)) head += '\n<link href="css/redesign.css" rel="stylesheet"/>';

  // Analytics that some pages carry at the end of <body> instead of <head>.
  const tail = [];
  if (src.includes('js/attribution.js') && !head.includes('js/attribution.js')) {
    tail.push('<script defer src="js/attribution.js"></script>');
  }
  for (const id of ['AW-11397258552', 'G-EFSCQB4RF3']) {
    if (src.includes(id) && !head.includes(id)) {
      tail.push(
        `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>\n` +
          '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}\n' +
          `gtag('js', new Date());gtag('config', '${id}');</script>`
      );
    }
  }

  out[file] = { head, tail: tail.join('\n') };
}

fs.writeFileSync(path.join(__dirname, 'heads.json'), JSON.stringify(out, null, 2));
console.log(`extracted ${Object.keys(out).length} heads from ${REF}`);
if (missing.length) {
  console.error(`\nWARNING — not found at ${REF}:\n  ${missing.join('\n  ')}`);
  process.exitCode = 1;
}
