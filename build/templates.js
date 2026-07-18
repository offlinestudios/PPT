/* Page templates for the redesign build. Renders the approved prototype as
   plain static HTML — one file per production URL. */

const D = require('./data');

const PHONE = '(416) 986-2677';
const TEL = 'tel:4169862677';
const EMAIL = 'info@passportphototoronto.com';
const IG = 'https://instagram.com/passportphototoronto';
const SQUARE_CHECKOUT =
  'https://checkout.square.site/merchant/MLZHP4C4D1VRR/checkout/LBL5U33JWMKUN7NCOWWADCEQ';
const MAP_EMBED =
  'https://www.google.com/maps?q=63+McCaul+St,+Toronto,+ON+M5T+2W7&amp;output=embed';
const MAP_DIR =
  'https://www.google.com/maps/dir/?api=1&amp;destination=63+McCaul+St,+Toronto,+ON+M5T+2W7';
const TRANSIT = 'St Patrick station · 505 Dundas &amp; 501 Queen streetcars · Green P on McCaul';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const bookBtn = (label, cls) =>
  `<button type="button" class="btn ${cls || 'btn-gold'}" data-book>${label}</button>`;

/* ---------- chrome ---------- */

function header(active) {
  const links = D.nav
    .map(
      (n) =>
        `<a href="${n.href}"${n.href === active ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`
    )
    .join('\n        ');
  return `<header class="site-header">
  <div class="shell">
    <a class="brand" href="index.html">
      <img src="images/logo.png" alt="Passport Photo Toronto">
      <span>PASSPORT PHOTO</span>
    </a>
    <nav class="nav-links" aria-label="Main">
        ${links}
    </nav>
    <div class="header-right">
      <a class="header-phone" href="${TEL}">${PHONE}</a>
      ${bookBtn('Book Appointment')}
      <button type="button" class="hamburger" aria-label="Open menu">&#9776;</button>
    </div>
  </div>
</header>
<div class="drawer-backdrop"></div>
<nav class="drawer" aria-label="Mobile">
  <div class="drawer-head">
    <span class="label">MENU</span>
    <button type="button" class="drawer-close" aria-label="Close menu">&#10005;</button>
  </div>
  ${D.nav
    .map(
      (n) =>
        `<a class="drawer-link${n.href === active ? ' active' : ''}" href="${n.href}">${n.label}</a>`
    )
    .join('\n  ')}
  <div class="drawer-foot">
    ${bookBtn('Book Appointment', 'btn-gold btn-block')}
    <div class="drawer-contact">
      <a href="${TEL}">${PHONE}</a>
      <a href="mailto:${EMAIL}">${EMAIL}</a>
      <span>Mon–Fri 9–6 · Sat–Sun 12–6</span>
    </div>
  </div>
</nav>`;
}

const footQuick = [
  ['Home', 'index.html'], ['All services', 'services.html'], ['Pricing', 'pricing.html'],
  ['Sample photos', 'samples.html'], ['Reviews', 'reviews.html'], ['FAQ', 'faq.html'],
  ['Location', 'location.html'], ['About us', 'about.html'], ['Blog', 'blog.html'],
  ['Contact', 'contact.html'], ['Careers', 'jobs.html'], ['Trusted vendors', 'trusted-vendors.html'],
  ['Refund policy', 'refund-policy.html'], ['Digital photo payment', 'digital-photo-payment.html'],
  ['Service areas', 'passport-photos-chinatown.html'], ['Sitemap', 'sitemap.html'],
];

const footSvcKeys = [
  'passport-photos', 'visa-photos', 'canadian-passport', 'us-visa', 'us-passport', 'uk-passport',
  'indian-passport', 'chinese-passport', 'schengen-visa', 'chinese-visa', 'indian-visa', 'pr-card',
  'citizenship', 'study-permit', 'work-permit', 'oci', 'digital', 'document-services',
];

function footer() {
  const quick = footQuick.map(([l, h]) => `<a href="${h}">${l}</a>`).join('\n        ');
  const svcs = footSvcKeys
    .map((k) => `<a href="${D.svcFile[k]}">${esc(D.svcData[k].name)}</a>`)
    .join('\n        ');
  return `<footer class="site-footer">
  <div class="shell">
    <div class="col brand-col">
      <img class="flogo" src="images/logo-white-transparent.png" alt="Passport Photo Toronto">
      <span class="blurb">Professional passport and ID photo services in downtown Toronto. We guarantee compliance with all official requirements.</span>
      <a class="ig" href="${IG}" target="_blank" rel="noopener noreferrer">Follow us on Instagram</a>
    </div>
    <div class="col">
      <h3>Quick links</h3>
      <div class="links">
        ${quick}
      </div>
    </div>
    <div class="col">
      <h3>Our services</h3>
      <div class="links">
        ${svcs}
      </div>
    </div>
    <div class="col">
      <h3>Contact</h3>
      <span class="contact-line">63 McCaul St<br>Toronto, ON M5T 2W7</span>
      <a href="${TEL}">${PHONE}</a>
      <a href="mailto:${EMAIL}">${EMAIL}</a>
      <span class="contact-line">Mon–Fri: 9 AM – 6 PM<br>Sat–Sun: 12 PM – 6 PM</span>
    </div>
  </div>
  <div class="bottom">© 2026 Passport Photo Toronto. All Rights Reserved.</div>
</footer>`;
}

function bookingModal() {
  return `<div class="book-overlay" role="dialog" aria-modal="true" aria-label="Book an appointment">
  <div class="book-backdrop"></div>
  <div class="book-modal">
    <div class="book-head">
      <div>
        <div class="kicker">Square Appointments</div>
        <div class="t">Book an appointment</div>
      </div>
      <button type="button" class="book-close" aria-label="Close">&#10005;</button>
    </div>
    <div class="book-frame">
      <iframe title="Book an appointment — Square" loading="lazy"></iframe>
    </div>
  </div>
</div>`;
}

function stickyBar() {
  return `<div class="sticky-bar">
  <div class="info">
    <b>From $24.99</b>
    <span>Ready in 10 minutes · Walk-ins OK</span>
  </div>
  ${bookBtn('Book now')}
</div>`;
}

/* ---------- shared blocks ---------- */

const stars = (s) => `<span class="stars">${s || '★★★★★'}</span>`;

function reviewCard(r) {
  return `<div class="review">
  ${stars(r.stars)}
  <span class="txt">${esc(r.text)}</span>
  <span class="who">${esc(r.name)} · ${esc(r.date)}</span>
</div>`;
}

function tiersBlock() {
  return `<div class="tiers">
  ${D.tierCards
    .map(
      (t) => `<div class="tier${t.popular ? ' popular' : ''}">
    ${t.popular ? '<span class="tag">Most popular</span>' : ''}
    <span class="tname">${esc(t.name)}</span>
    <span class="price">${t.price}</span>
    <span class="desc">${esc(t.desc)}</span>
    ${bookBtn('Book now', t.popular ? 'btn-gold btn-block' : 'btn-navy btn-block')}
  </div>`
    )
    .join('\n  ')}
</div>`;
}

function ctaBand() {
  return `<div class="cta-band">
  <div class="shell">
    <div>
      <div class="t">Get your photos today.</div>
      <div class="s">Walk in or book online. Ready in 10 minutes.</div>
    </div>
    ${bookBtn('Book Appointment', 'btn-gold btn-lg')}
  </div>
</div>`;
}

function mapCard(extra) {
  return `<div class="map-card ${extra || ''}">
  <div class="frame"><iframe src="${MAP_EMBED}" loading="lazy" title="Map — 63 McCaul St"></iframe></div>
  <div class="body">
    <div>
      <div class="addr">63 McCaul St, Toronto</div>
      <div class="transit">${TRANSIT}</div>
    </div>
    <a class="btn btn-outline" href="${MAP_DIR}" target="_blank" rel="noopener noreferrer">Get directions</a>
  </div>
</div>`;
}

/* ---------- page bodies ---------- */

function home() {
  const svcs = D.homeSvcKeys
    .map(
      (k) => `<a class="card" href="${D.svcFile[k]}">
      <span class="name">${esc(D.svcData[k].name)}</span>
      <span class="sub">${esc(D.svcData[k].sub)}</span>
    </a>`
    )
    .join('\n    ');
  const chips = D.homeChips
    .map((c) => `<a class="chip" href="${D.svcFile[c.key]}">${esc(c.label)}</a>`)
    .join('\n      ');
  const areaCards = D.homeAreaNames
    .map(
      (n) => `<a class="area-tile" href="${D.areaFile(n)}">
      <img src="${D.areaImg(n)}" alt="Passport photos near ${esc(n)}, Toronto" loading="lazy">
      <span>${esc(n)}</span>
    </a>`
    )
    .join('\n    ');
  const steps = D.photoSteps
    .map(
      (s) => `<div class="step">
      <div class="n">${s.n}</div>
      <div class="step-txt">
        <span class="t">${esc(s.title)}</span>
        <span class="b">${esc(s.body)}</span>
      </div>
    </div>`
    )
    .join('\n    ');
  const priceRows = D.tierRows
    .map(
      (t) => `<div class="price-line${t.popular ? ' popular' : ''}">
      <span class="l">
        <span class="n">${esc(t.name)}${t.popular ? '<em class="tag">Best value</em>' : ''}</span>
        <span class="s">${esc(t.sub)}</span>
      </span>
      <span class="p">${t.price}</span>
    </div>`
    )
    .join('\n    ');
  const reviews = D.topReviews
    .slice(0, 3)
    .map((r, i) => `<div class="review${i > 0 ? ' d-only' : ''}">
      ${stars(r.stars)}
      <span class="txt">${esc(r.text)}</span>
      <span class="who">${esc(r.name)}${i === 0 ? ' · <a href="reviews.html">Read more reviews</a>' : ''}</span>
    </div>`)
    .join('\n    ');

  return `<section class="hero">
  <div class="shell">
    <div class="hero-col">
      <span class="hero-badge"><i></i>Open now · 63 McCaul St, Downtown Toronto</span>
      <h1>Passport photos, done right in 10 minutes.</h1>
      <p>Guaranteed acceptance for Canadian passports, visas and IDs — or we retake them free.</p>
      <div class="hero-actions">
        ${bookBtn('Book Appointment', 'btn-gold btn-lg')}
        <a class="btn btn-outline-light d-only" href="services.html">Browse Services</a>
        <a class="btn btn-outline-light m-only" href="${TEL}">Call ${PHONE}</a>
      </div>
      <div class="trust m-only">
        <span class="rate">★ 4.9 on Google</span><i></i><span>Walk-ins welcome</span><i></i><span>Same-day</span>
      </div>
    </div>
    <div class="d-only">
      <div class="hero-art">
        <img class="back" src="images/passport-sample-back.png" alt="Stamped back of a passport photo from our studio">
        <img class="front" src="images/passport-sample-front.png" alt="Real passport photo sample from our studio">
      </div>
      <div class="hero-caption">Real sample from our 63 McCaul St studio — front and stamped back</div>
    </div>
  </div>
</section>

<div class="band-b d-only">
  <div class="shell stats">
    <div class="stat"><b>10 min</b><span>in and out,<br>prints in hand</span></div>
    <div class="stat"><b>100%</b><span>acceptance guaranteed<br>or free retake</span></div>
    <div class="stat"><b>4.9 ★</b><span>on Google<br>reviews</span></div>
    <div class="stat"><b>7 days</b><span>walk-ins welcome<br>every day</span></div>
  </div>
</div>

<div class="shell section">
  <div class="section-head">
    <div>
      <h2 class="d-only">Photos for every document</h2>
      <h2 class="m-only">Which document do you need?</h2>
      <span class="sub d-only">Passports, visas, permits and IDs — 40+ document types, all to exact spec.</span>
    </div>
    <a class="btn btn-outline d-only" href="services.html">All services →</a>
  </div>
  <div class="grid-3 d-only">
    ${svcs}
  </div>
  <div class="chiplist m-only">
      ${chips}
      <a class="chip chip-more" href="services.html">All 30+ documents →</a>
  </div>
</div>

<div class="shell section pricing-home">
  <h2 class="center d-only">Simple pricing</h2>
  <h2 class="m-only">Simple, transparent pricing</h2>
  <div class="d-only">${tiersBlock()}</div>
  <div class="m-only">
    <div class="price-list">
    ${priceRows}
    </div>
    <p class="fineprint">All prices include guaranteed compliance. <a href="pricing.html">Full pricing →</a></p>
  </div>
</div>

<div class="shell section m-only sample-block">
  <h2>Real photos taken here</h2>
  <img src="images/passport-scan-sample-square.jpg" alt="Real passport photo sample from our studio">
  <p class="cap">Actual photo from our studio — professional lighting, white background, accepted every time.</p>
  <a class="btn btn-outline btn-block" href="samples.html">See more samples</a>
</div>

<div class="band-b how">
  <div class="shell section">
    <h2 class="center">How it works</h2>
    <div class="steps">
    ${steps}
    </div>
  </div>
</div>

<div class="band studio-band">
  <div class="shell section">
    <div class="split">
      <img src="images/offline-website-5.jpg" alt="Studio setup at 63 McCaul St" loading="lazy">
      <div class="hero-col">
        <h2>Real studio. Real results.</h2>
        <p>Inside Offline Studios at 63 McCaul St — professional-grade lighting and a calibrated camera. No phone cameras. No drugstore booths.</p>
        <p class="d-only">Every photo is checked against the issuing authority's spec before you leave, and you approve your shot before we print.</p>
        <a class="btn btn-outline d-only" href="samples.html">See sample photos →</a>
      </div>
    </div>
  </div>
</div>

<div class="shell section reviews-home">
  <div class="section-head">
    <div>
      <h2 class="d-only">What customers say</h2>
      <h2 class="m-only">What people say</h2>
      <div class="rating-line d-only">${stars()}<span class="sub">4.9 on Google reviews</span></div>
    </div>
    <a class="btn btn-outline d-only" href="reviews.html">Read all reviews →</a>
  </div>
  <div class="press">
    <div class="press-top">
      <img src="images/blogto-logo.png" alt="blogTO" loading="lazy">
      <span>As featured in</span>
    </div>
    <q>“If you want to visit a local business… Passport Photo Toronto.”</q>
  </div>
  <div class="grid-3">
    ${reviews}
  </div>
</div>

<div class="shell section areas-home">
  <div class="section-head">
    <div>
      <h2 class="d-only">Serving all of downtown Toronto</h2>
      <h2 class="m-only">Serving all of Toronto</h2>
      <p class="sub m-only">From the Annex to Yorkville, Kensington Market to the Financial District — clients across the city's neighbourhoods trust us with their photos.</p>
    </div>
    <a class="btn btn-outline d-only" href="sitemap.html">All service areas →</a>
  </div>
  <div class="area-tiles">
    ${areaCards}
  </div>
  <a class="btn btn-outline btn-block m-only" href="sitemap.html">View service areas</a>
</div>

${ctaBand()}`;
}

function servicesHub() {
  const cats = D.catDefs
    .map(
      ([label, keys]) => `<div class="cat">
    <h2>${esc(label)}</h2>
    <div class="cat-items">
      ${keys
        .map(
          (k) => `<a class="svc-card" href="${D.svcFile[k]}">
        <span class="n">${esc(D.svcData[k].name)}</span>
        <span class="s">${esc(D.svcData[k].sub)}</span>
      </a>`
        )
        .join('\n      ')}
    </div>
  </div>`
    )
    .join('\n  ');
  return `<div class="page">
  <div>
    <h1>All services</h1>
    <p class="lede">Photos for 40+ document types — every one to the issuing authority's exact specification, guaranteed accepted or retaken free.</p>
  </div>
  ${cats}
</div>`;
}

function servicePage(key) {
  const s = D.svcData[key];
  const isDoc = key === 'document-services';
  const title = D.svcTitle(key);
  const reqs = D.reqRows(key)
    .map((r) => `<div class="req">${esc(r)}</div>`)
    .join('\n      ');

  const pricing = isDoc
    ? `<div class="panel s-price">
      <span class="ptitle">Simple, transparent pricing</span>
      ${D.docPriceRows
        .map(
          (t) => `<div class="doc-row">
        <span class="l"><b>${esc(t.label)}</b><i>${esc(t.sub)}</i></span>
        <span class="p">${esc(t.price)}</span>
      </div>`
        )
        .join('\n      ')}
      <span class="sub" style="font-size:12px;color:#888">Large or complex jobs? Contact us for volume pricing.</span>
    </div>`
    : `<div class="panel s-price">
      <span class="ptitle">Pricing</span>
      <div class="price-row"><span>Printed photos (×2)</span><span>$24.99</span></div>
      <div class="price-row"><span>Digital copy</span><span>$24.99</span></div>
      <div class="price-row total"><span>Prints + digital</span><span>$39.99</span></div>
    </div>`;

  const reviews = D.svcReviews(key)
    .map(
      (r) => `<div class="card">
        ${stars(r.stars)}
        <span class="txt" style="font-size:13.5px;line-height:1.6;color:#444">${esc(r.text)}</span>
        <span class="who" style="font-size:12.5px;font-weight:700;color:#888">${esc(r.name)} · ${esc(r.date)}</span>
      </div>`
    )
    .join('\n      ');

  const related = D.relatedKeys(key)
    .map((k) => `<a class="chip" href="${D.svcFile[k]}">${esc(D.svcData[k].name)} →</a>`)
    .join('\n      ');

  return `<div class="page detail-page">
  <div class="breadcrumb"><a href="index.html">Home</a> / <a href="services.html">Services</a> / ${esc(s.name)}</div>
  <div class="detail">
    <div class="detail-main">
      <div class="hero-col s-hero" style="gap:12px">
        <h1>${esc(title)}</h1>
        <p class="lede">${isDoc ? esc(D.docHeroSub) : esc(D.photoHeroSub)}</p>
        ${bookBtn('Book Appointment', 'btn-gold')}
      </div>

      <div class="panel s-req">
        <span class="ptitle">${isDoc ? 'What we offer' : 'Photo requirements'}</span>
        <div class="req-grid">
      ${reqs}
        </div>
      </div>

      ${pricing}

      <div class="panel studio-panel s-studio">
        <img src="images/offline-website-5.jpg" alt="Passport Photo Toronto studio setup at 63 McCaul St" loading="lazy">
        <div>
          <span class="t">Professional studio setup</span>
          <p>Located inside Offline Studios at 63 McCaul St in downtown Toronto, our dedicated photo station uses professional-grade lighting and a calibrated camera to ensure your ${esc(s.name)} photo meets every technical requirement — correct size, white background, no shadows, accurate colour rendering.</p>
          <p>No phone cameras. No drugstore booths. A real photographer who gets it right the first time.</p>
        </div>
      </div>

      <div class="s-reviews">
        <span class="ptitle">What customers say</span>
        <div class="grid-2" style="margin-top:12px">
      ${reviews}
        </div>
      </div>
    </div>

    <aside class="detail-side">
      <div class="sample-card s-sample">
        <img src="images/passport-scan-sample-square.jpg" alt="Real ${esc(s.name)} photo taken here">
        <div class="cap">Actual photo from our studio — accepted every time</div>
      </div>
      <div class="side-cta s-cta">
        <span class="t">Need your ${esc(s.name)} photo today?</span>
        <span class="s">Walk in or book online — ready in 10 minutes, guaranteed accepted.</span>
        ${bookBtn('Book Appointment', 'btn-gold btn-block')}
      </div>
      <div class="s-related">
        <span class="ptitle">Related services</span>
        <div class="chiplist" style="margin-top:12px">
      ${related}
        </div>
      </div>
      ${mapCard('s-map')}
    </aside>
  </div>
</div>`;
}

function areaPage(name) {
  return `<div class="page">
  <div class="breadcrumb"><a href="index.html">Home</a> / <a href="sitemap.html">Service Areas</a> / ${esc(name)}</div>
  <div class="split">
    <div class="hero-col" style="gap:14px">
      <h1>Passport Photos in ${esc(name)}</h1>
      <p class="lede">Professional passport, visa and ID photos serving ${esc(name)} and surrounding neighbourhoods — government-compliant, ready in 10 minutes at our 63 McCaul St studio.</p>
      ${bookBtn('Book Appointment', 'btn-gold')}
    </div>
    <img src="${D.areaImg(name)}" alt="Passport photos near ${esc(name)}, Toronto" loading="lazy">
  </div>
  <div class="split" style="align-items:start">
    <div>
      <p>Whether you're renewing your Canadian passport, applying for a U.S. visa, or submitting documents for permanent residency, we offer professionally taken, government-compliant ID photos — right in the heart of the city. Conveniently located inside Offline Studios, we serve clients from ${esc(name)} and downtown Toronto with fast, high-quality service that exceeds government standards.</p>
      <p>Your photo matters. From the lighting to your posture and expression, our experienced photographer ensures you look your best — even on official documents you'll see for the next 10 years.</p>
    </div>
    <div class="info-card">
      <span class="ptitle">Getting here from ${esc(name)}</span>
      <span class="field txt">Our studio at 63 McCaul St is a short trip by TTC, car or foot. St Patrick station (Line 1) and the 505 Dundas and 501 Queen streetcars stop nearby; Green P parking is on McCaul.</span>
      <span class="field txt">Walk-ins welcome 7 days a week — most visits take about 10 minutes.</span>
    </div>
  </div>
  <div class="map-box" style="height:340px"><iframe src="${MAP_EMBED}" loading="lazy" title="Map — 63 McCaul St"></iframe></div>
</div>

${ctaBand()}`;
}

function pricing() {
  return `<div class="page">
  <div class="center">
    <h1>Pricing</h1>
    <p class="lede" style="max-width:560px;margin:8px auto 0">One flat price for any document type. Every session includes retakes — and a free redo if any agency rejects your photo.</p>
  </div>
  <div style="max-width:1000px;margin:0 auto;width:100%">
    ${tiersBlock()}
  </div>
  <div class="note" style="max-width:1000px;margin:0 auto;width:100%">All prices in CAD, taxes extra.</div>
</div>`;
}

function reviews() {
  const cards = D.topReviews
    .map(
      (r) => `<div class="rcard">
    ${stars(r.stars)}
    <span class="txt">${esc(r.text)}</span>
    <div style="display:flex;align-items:center;gap:10px">
      <div class="avatar">${esc(r.initials)}</div>
      <div style="display:flex;flex-direction:column">
        <span style="font-size:13.5px;font-weight:700;color:#333">${esc(r.name)}</span>
        <span style="font-size:12px;color:#888">${esc(r.date)}</span>
      </div>
    </div>
  </div>`
    )
    .join('\n  ');
  return `<div class="page">
  <div class="section-head">
    <div>
      <h1>Customer reviews</h1>
      <div class="rating-big">
        <span class="num">4.9</span>
        <div style="display:flex;flex-direction:column;gap:2px">
          ${stars()}
          <span style="font-size:13px;color:#888">Based on Google reviews</span>
        </div>
      </div>
    </div>
  </div>
  <div class="review-masonry">
  ${cards}
  </div>
</div>`;
}

function faq() {
  const items = D.faqData
    .map(
      (f) => `<div class="faq-item">
    <button type="button" class="faq-q" aria-expanded="false">
      <span>${esc(f.q)}</span><span class="icon">+</span>
    </button>
    <div class="faq-a">${esc(f.a)}</div>
  </div>`
    )
    .join('\n  ');
  return `<div class="page page-narrow">
  <h1>Frequently asked questions</h1>
  <div class="faq">
  ${items}
  </div>
</div>`;
}

function location() {
  return `<div class="page">
  <h1>Find our studio</h1>
  <div class="split split-wide">
    <div class="map-box" style="min-height:440px"><iframe src="${MAP_EMBED}" loading="lazy" title="Map — 63 McCaul St"></iframe></div>
    <div class="hero-col" style="gap:16px">
      <div class="info-card" style="flex:1">
        <div class="field"><span class="lbl">Address</span><span class="val">63 McCaul St, Toronto, ON M5T 2W7</span><span class="txt">Steps from OCAD U and the AGO</span></div>
        <div class="field"><span class="lbl">Phone</span><a class="val" href="${TEL}">${PHONE}</a></div>
        <div class="field"><span class="lbl">Hours</span><span class="txt">Mon–Fri: 9:00 AM – 6:00 PM<br>Sat–Sun: 12:00 PM – 6:00 PM</span></div>
        <div class="field"><span class="lbl">Getting here</span><span class="txt">St Patrick station (Line 1) · 505 Dundas &amp; 501 Queen streetcars · Green P parking on McCaul</span></div>
      </div>
      ${bookBtn('Book Appointment', 'btn-gold btn-block')}
    </div>
  </div>
</div>`;
}

function about() {
  return `<div class="page">
  <div class="split">
    <div class="hero-col" style="gap:16px">
      <h1>About Passport Photo Toronto</h1>
      <p>We're a dedicated passport photo studio in downtown Toronto — not a pharmacy kiosk. Real studio lighting, professional cameras, and staff who know the exact photo specifications for over 40 document types across dozens of countries.</p>
      <p>Every photo is reviewed against the issuing authority's requirements before you leave, and we guarantee acceptance: if any official agency rejects your photo for non-compliance, we retake it free.</p>
    </div>
    <div class="sample-card" style="transform:rotate(-1.5deg)">
      <img src="images/passport-scan-sample-square.jpg" alt="Sample from our studio">
      <div class="cap">Taken at 63 McCaul St</div>
    </div>
  </div>
  <div class="grid-3">
    <div class="card"><span class="name" style="color:#2b4b8c">Compliance first</span><span class="txt" style="font-size:14px;color:#555;line-height:1.6">We track spec changes — like India's 2025 ICAO rules — so your photos are right the first time.</span></div>
    <div class="card"><span class="name" style="color:#2b4b8c">You approve first</span><span class="txt" style="font-size:14px;color:#555;line-height:1.6">You review and approve your photo before we print. Not happy? We retake it on the spot.</span></div>
    <div class="card"><span class="name" style="color:#2b4b8c">Prints + digital</span><span class="txt" style="font-size:14px;color:#555;line-height:1.6">Every session includes properly formatted digital files, emailed immediately.</span></div>
  </div>
</div>`;
}

function blogIndex() {
  const cards = D.blogDefs
    .map(
      (b) => `<a class="post-card" href="${b.file}">
    <div class="thumb"><img src="${b.img}" alt="${esc(b.title)}" loading="lazy"></div>
    <div class="body">
      <div class="post-meta"><span class="badge">${esc(b.badge)}</span><span>${esc(b.date)}</span><span>·</span><span>${esc(b.read)}</span></div>
      <span class="title">${esc(b.title)}</span>
      <span class="excerpt">${esc(b.excerpt)}</span>
    </div>
  </a>`
    )
    .join('\n  ');
  return `<div class="page">
  <h1>Blog &amp; travel document news</h1>
  <div class="grid-2">
  ${cards}
  </div>
</div>`;
}

function blogPost(key) {
  const def = D.blogDefs.find((b) => b.key === key);
  const post = D.blogPosts[key];
  const blocks = post.blocks
    .map((b) => {
      switch (b.t) {
        case 'h2':
          return `<h2>${esc(b.text)}</h2>`;
        case 'p':
          return `<p>${esc(b.text)}</p>`;
        case 'alert':
          return `<div class="alert alert-${b.tone || 'info'}">${esc(b.text)}</div>`;
        case 'ul':
          return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
        case 'ol':
          return `<ol>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
        case 'table':
          return `<div class="article-table"><table>
      <thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${b.rows
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody>
    </table></div>`;
        default:
          return '';
      }
    })
    .join('\n      ');

  return `<div class="page page-article" style="gap:18px">
  <div class="breadcrumb"><a href="index.html">Home</a> / <a href="blog.html">Blog</a> / Article</div>
  <span class="article-badge">${esc(post.badge)}</span>
  <h1 style="font-size:34px;line-height:1.2">${esc(post.title)}</h1>
  <span style="font-size:13px;color:#888">${esc(post.date)} · ${esc(post.read)}</span>
  <div class="article-hero"><img src="${def.img}" alt="${esc(post.title)}"></div>
  <div class="article-body">
      ${blocks}
  </div>
  <div class="article-cta">
    <div>
      <div class="t">${esc(post.ctaTitle)}</div>
      <div class="s">${esc(post.ctaSub)}</div>
    </div>
    <a class="btn btn-gold" href="${D.svcFile[post.ctaSvc] || 'services.html'}">${esc(post.ctaLabel)}</a>
  </div>
</div>`;
}

function booking() {
  return `<div class="page">
  <div>
    <h1>Book your appointment</h1>
    <p class="lede">Pick a time below, or just walk in — we take walk-ins 7 days a week and most visits take about 10 minutes.</p>
  </div>
  <div class="split split-wide">
    <div class="booker">
      <iframe src="https://square.site/appointments/buyer/widget/5fkwsauqjb7usp/L7T8SMADNB80P" loading="lazy" title="Book an appointment — Square"></iframe>
    </div>
    <div class="hero-col" style="gap:16px">
      <div class="info-card" style="flex:1">
        <div class="field"><span class="lbl">Walk in instead</span><span class="txt">No appointment needed. Mon–Fri 9:00 AM – 6:00 PM, Sat–Sun 12:00 PM – 6:00 PM.</span></div>
        <div class="field"><span class="lbl">Address</span><span class="val">63 McCaul St, Toronto, ON M5T 2W7</span><span class="txt">Steps from OCAD U and the AGO</span></div>
        <div class="field"><span class="lbl">Call or text</span><a class="val" href="${TEL}">${PHONE}</a></div>
        <div class="field"><span class="lbl">Getting here</span><span class="txt">${TRANSIT}</span></div>
      </div>
      <a class="btn btn-outline" href="${MAP_DIR}" target="_blank" rel="noopener noreferrer">Get directions</a>
    </div>
  </div>
</div>`;
}

function contact() {
  return `<div class="page">
  <h1>Contact us</h1>
  <div class="split" style="align-items:stretch">
    <div class="info-card" style="gap:18px;padding:28px">
      <div class="field"><span class="lbl">Call or text</span><a href="${TEL}" style="font-family:Montserrat,sans-serif;font-size:20px;font-weight:800">${PHONE}</a></div>
      <div class="field"><span class="lbl">Email</span><a href="mailto:${EMAIL}" style="font-size:15px;font-weight:700">${EMAIL}</a></div>
      <div class="field"><span class="lbl">Visit</span><span class="txt" style="font-size:15px">63 McCaul St, Toronto, ON M5T 2W7</span></div>
      <div class="field"><span class="lbl">Hours</span><span class="txt">Mon–Fri: 9:00 AM – 6:00 PM<br>Sat–Sun: 12:00 PM – 6:00 PM</span></div>
      ${bookBtn('Book Appointment', 'btn-gold btn-block')}
    </div>
    <div class="map-box" style="min-height:380px"><iframe src="${MAP_EMBED}" loading="lazy" title="Map — 63 McCaul St"></iframe></div>
  </div>
</div>`;
}

function samples() {
  const tiles = D.sampleRows
    .map(
      (s) => `<div class="sample-tile">
    <img src="${s.img}" alt="${esc(s.caption)}" loading="lazy">
    <div class="cap">${esc(s.caption)}</div>
  </div>`
    )
    .join('\n  ');
  return `<div class="page">
  <div>
    <h1>Sample photos</h1>
    <p class="lede">Every sample shown was taken at our 63 McCaul St studio and accepted by the issuing authority.</p>
  </div>
  <div class="sample-grid">
  ${tiles}
  </div>
</div>`;
}

function jobs() {
  return `<div class="page page-narrow">
  <h1>Careers</h1>
  <div class="info-card" style="padding:28px;gap:10px">
    <span style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:700;color:#333">Front Desk Associate</span>
    <span style="font-size:13px;color:#888">Part-time · 63 McCaul St</span>
    <span class="txt" style="font-size:14.5px;line-height:1.65">Greet clients, manage bookings and payments, and help with printing and digital delivery. Weekend availability an asset.</span>
    <a class="btn btn-navy" href="mailto:${EMAIL}" style="align-self:flex-start;margin-top:6px">Apply by email</a>
  </div>
</div>`;
}

function vendors() {
  const cards = D.vendorRows
    .map(
      (v) => `<div class="info-card" style="padding:26px;gap:8px">
    <span style="font-size:11.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888">${esc(v.cat)}</span>
    <span style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:700;color:#2b4b8c">${esc(v.name)}</span>
    <span class="txt" style="font-size:14px;line-height:1.6">${esc(v.desc)}</span>
  </div>`
    )
    .join('\n  ');
  return `<div class="page">
  <div>
    <h1>Trusted vendors</h1>
    <p class="lede">Partners we recommend for services beyond photos.</p>
  </div>
  <div class="grid-2">
  ${cards}
  </div>
</div>`;
}

function refund() {
  return `<div class="page page-narrow">
  <h1>Refund policy</h1>
  <div class="policy">
    <span><strong>Acceptance guarantee.</strong> If your photos are rejected by any official agency due to non-compliance with their photo requirements, we retake them at no additional cost.</span>
    <span><strong>Before you leave the studio.</strong> You review and approve your photo before we print. If you're not happy with how you look, we retake it on the spot at no charge.</span>
    <span><strong>Digital deliveries.</strong> Digital files are emailed immediately after your session. If a file doesn't meet the destination portal's technical requirements, we reformat it free.</span>
  </div>
</div>`;
}

function payment() {
  return `<div class="page" style="max-width:640px">
  <h1>Digital photo payment</h1>
  <div class="pay-card">
    <span style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:700;color:#333">Digital Passport Photo</span>
    <span class="big">$24.99</span>
    <span style="font-size:14px;color:#666;line-height:1.6;max-width:380px">High-resolution file formatted for online applications, delivered by email after payment.</span>
    <a class="btn btn-gold" href="${SQUARE_CHECKOUT}" target="_blank" rel="noopener noreferrer">Pay $24.99 securely by Square</a>
    <span style="font-size:12.5px;color:#888">🔒 Secure checkout opens through Square.</span>
  </div>
</div>`;
}

function sitemapPage() {
  const core = [
    ['Home', 'index.html'], ['All services', 'services.html'], ['Pricing', 'pricing.html'],
    ['Sample photos', 'samples.html'], ['Reviews', 'reviews.html'], ['FAQ', 'faq.html'],
    ['Location', 'location.html'], ['About us', 'about.html'], ['Blog', 'blog.html'],
    ['Contact', 'contact.html'], ['Careers', 'jobs.html'], ['Trusted vendors', 'trusted-vendors.html'],
    ['Refund policy', 'refund-policy.html'], ['Digital photo payment', 'digital-photo-payment.html'],
  ];
  const cols = [
    ['Main pages', core.map(([l, h]) => `<a href="${h}">${l}</a>`)],
    ['Services', Object.keys(D.svcData).map((k) => `<a href="${D.svcFile[k]}">${esc(D.svcData[k].name)}</a>`)],
    ['Service areas', D.areas.map((a) => `<a href="${D.areaFile(a)}">${esc(a)}</a>`)],
  ];
  return `<div class="page">
  <h1>Sitemap</h1>
  <div class="sitemap-cols">
  ${cols
    .map(
      ([label, links]) => `<div class="sitemap-col">
    <span class="h">${label}</span>
    ${links.join('\n    ')}
  </div>`
    )
    .join('\n  ')}
  </div>
</div>`;
}

module.exports = {
  esc, header, footer, bookingModal, stickyBar,
  home, servicesHub, servicePage, areaPage, pricing, reviews, faq, location,
  about, blogIndex, blogPost, contact, samples, jobs, vendors, refund, payment, booking,
  sitemapPage,
};
