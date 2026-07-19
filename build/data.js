/* Content data for the redesign build.
   `content.json` is extracted verbatim from the approved prototype's script
   block (svcData, areas, topReviews, faqData, blogPosts). Everything below is
   ported from the prototype's render() constants. Copy is final — do not edit
   without a new design sign-off. */

const content = require('./content.json');

const { areas, svcData, topReviews, faqData, blogPosts } = content;

/* svcData key -> existing production filename. These URLs are load-bearing for
   SEO and Google Ads; never rename one without a redirect. */
const svcFile = {
  'canadian-passport': 'canadian-passport-photos.html',
  'us-visa': 'us-visa-photos.html',
  'pr-card': 'pr-card-photos.html',
  citizenship: 'canadian-citizenship-photo.html',
  'us-passport': 'us-passport-photos.html',
  'uk-passport': 'uk-passport-photos.html',
  'irish-passport': 'irish-passport-photo.html',
  'indian-passport': 'indian-passport-photos.html',
  'chinese-passport': 'chinese-passport-photos.html',
  'schengen-visa': 'schengen-visa-photos.html',
  'chinese-visa': 'chinese-visa-photos.html',
  'indian-visa': 'indian-visa-photos.html',
  oci: 'oci-photo.html',
  'green-card': 'green-card-application-photo.html',
  'study-permit': 'study-permit-photos.html',
  'work-permit': 'work-permit-photo.html',
  'french-passport': 'french-passport-photo.html',
  'german-passport': 'german-passport-photo.html',
  'italian-passport': 'italian-passport-photo.html',
  'spanish-passport': 'spanish-passport-photo.html',
  'polish-passport': 'polish-passport-photo.html',
  'japanese-passport': 'japanese-passport-photo.html',
  'korean-passport': 'korean-passport-photo.html',
  'turkish-passport': 'turkish-passport-photo.html',
  'iranian-passport': 'iran-passport-photo.html',
  'nigerian-passport': 'nigerian-passport-photo.html',
  'brazilian-passport': 'brazilian-passport-photo.html',
  'hong-kong-passport': 'hong-kong-passport-photo.html',
  'us-immigration': 'us-immigration-photos.html',
  'us-travel-visa': 'us-travel-visa-photo.html',
  'japanese-visa': 'japanese-visa-photo.html',
  'korean-visa': 'korean-visa-photo.html',
  'egyptian-visa': 'egyptian-visa-photo.html',
  'vietnam-visa': 'vietnam-visa-photo.html',
  'hong-kong-visa': 'hong-kong-visa-photo.html',
  'student-visa': 'student-visa-photos.html',
  'indian-pcc': 'indian-police-clearance-photos.html',
  'refugee-travel': 'refugee-travel-document-photos.html',
  'immigration-medical': 'immigration-medical-photos.html',
  'school-id': 'school-id-photo.html',
  'university-id': 'university-application-photo.html',
  idp: 'international-drivers-permit-photos.html',
  'security-guard': 'security-guard-license-photo.html',
  'firearms-pal': 'firearms-pal-license-photos.html',
  licenses: 'professional-license-photos.html',
  digital: 'digital-passport-photos.html',
  'document-services': 'document-services.html',
  'passport-photos': 'passport-photos.html',
  'visa-photos': 'visa-photos.html',
  'digital-id': 'digital-id-photos.html',
};

/* Google Ads landing pages and document-services keep their own H1 wording;
   every other service page is "<Name> Photos". */
const svcTitleOverride = {
  'passport-photos': 'Passport Photos in Toronto',
  'visa-photos': 'Visa Photos in Toronto',
  'document-services': 'Printing, Scanning & Photocopying',
};

const areaSlug = (name) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/\./g, '').replace(/\s+/g, '-');

const areaFile = (name) => `passport-photos-${areaSlug(name)}.html`;
const areaImg = (name) => `images/${areaSlug(name)}-toronto.jpg`;

const nav = [
  { label: 'Home', href: 'index.html' },
  { label: 'Services', href: 'services.html' },
  { label: 'Pricing', href: 'pricing.html' },
  { label: 'Reviews', href: 'reviews.html' },
  { label: 'FAQ', href: 'faq.html' },
  { label: 'Location', href: 'location.html' },
  { label: 'About', href: 'about.html' },
  { label: 'Blog', href: 'blog.html' },
  { label: 'Contact', href: 'contact.html' },
];

const tierCards = [
  {
    name: 'Printed Photos (×2)',
    price: '$24.99',
    desc: 'Two identical prints on professional photo paper, cut to spec.',
    popular: false,
  },
  {
    name: 'Digital Copy',
    price: '$24.99',
    desc: 'High-resolution file formatted for online applications, sent by email.',
    popular: false,
  },
  {
    name: 'Prints + Digital',
    price: '$39.99',
    desc: 'Everything included — prints for the office, digital for online forms.',
    popular: true,
  },
];

const docPriceRows = [
  { label: 'Printing (B&W)', sub: '$5 minimum · letter size', price: '$0.50/page' },
  { label: 'Printing (Colour)', sub: '$5 minimum · letter size', price: '$1.00/page' },
  { label: 'Photocopying (B&W)', sub: '$5 minimum · while you wait', price: '$0.50/page' },
  { label: 'Photocopying (Colour)', sub: '$5 minimum · while you wait', price: '$1.00/page' },
  { label: 'Document scanning', sub: '$5 minimum · to PDF, JPG, email or USB', price: '$1.00/page' },
];

const photoSteps = [
  { n: 1, title: 'Book or walk in', body: 'Book online in seconds, or just show up — no appointment needed.' },
  { n: 2, title: 'We take your photo', body: 'Correct background, lighting and framing for your exact document type.' },
  { n: 3, title: 'Out in 10 minutes', body: 'Leave with prints and digital copy — accepted or retaken free.' },
];

const docHeroSub =
  'High-quality printing, secure high-resolution scanning, and fast photocopying — most jobs done while you wait.';
const photoHeroSub =
  'Government-compliant photos, ready in 10 minutes — guaranteed acceptance, walk-ins welcome.';

const catDefs = [
  ['Most requested', ['passport-photos', 'visa-photos', 'canadian-passport', 'us-visa', 'pr-card', 'citizenship']],
  [
    'Passports by country',
    ['us-passport', 'uk-passport', 'irish-passport', 'indian-passport', 'chinese-passport', 'french-passport',
      'german-passport', 'italian-passport', 'spanish-passport', 'polish-passport', 'japanese-passport',
      'korean-passport', 'turkish-passport', 'iranian-passport', 'nigerian-passport', 'brazilian-passport',
      'hong-kong-passport'],
  ],
  [
    'Visas by country',
    ['schengen-visa', 'chinese-visa', 'indian-visa', 'us-travel-visa', 'us-immigration', 'japanese-visa',
      'korean-visa', 'egyptian-visa', 'vietnam-visa', 'hong-kong-visa', 'student-visa'],
  ],
  [
    'Permits & immigration',
    ['study-permit', 'work-permit', 'oci', 'green-card', 'indian-pcc', 'refugee-travel', 'immigration-medical'],
  ],
  ['IDs & licenses', ['licenses', 'firearms-pal', 'security-guard', 'idp', 'school-id', 'university-id']],
  ['Other services', ['digital', 'digital-id', 'document-services']],
];

const homeSvcKeys = ['canadian-passport', 'us-visa', 'pr-card', 'citizenship', 'schengen-visa', 'digital'];

/* Mobile home shows "Which document do you need?" as chips — the prototype's
   `services` list (first 7), which is worded differently from svcData names. */
const homeChips = [
  { label: 'Canadian Passport', key: 'canadian-passport' },
  { label: 'US Visa (all types)', key: 'us-visa' },
  { label: 'PR Card', key: 'pr-card' },
  { label: 'Canadian Citizenship', key: 'citizenship' },
  { label: 'US Passport', key: 'us-passport' },
  { label: 'UK Passport', key: 'uk-passport' },
  { label: 'Schengen Visa', key: 'schengen-visa' },
];

/* Mobile pricing is a stacked row list rather than the desktop cards. */
const tierRows = [
  { name: 'Printed Photos (×2)', sub: '2 identical prints on photo paper', price: '$24.99', popular: false },
  { name: 'Digital Copy', sub: 'High-res file sent by email', price: '$24.99', popular: false },
  { name: 'Prints + Digital', sub: 'Everything included', price: '$39.99', popular: true },
];
const homeAreaNames = ['Kensington Market', 'Financial District', 'Chinatown', 'Yorkville', 'Annex', 'Harbourfront'];

const sampleRows = [
  { img: 'photos/passport-sample-8.jpg', caption: 'Canadian passport · 50×70mm' },
  ...[1, 10, 13, 15, 100, 101, 104, 106, 110, 111, 113, 116, 119, 121, 123, 125, 128].map((n) => ({
    img: `photos/gbp/passport-sample-${n}.jpg`,
    caption: 'Studio sample',
  })),
];

const blogDefs = [
  {
    key: 'uk',
    file: 'blog-uk-dual-citizenship-passport.html',
    badge: 'UK Travel',
    date: 'Feb 25, 2026',
    read: '6 min read',
    img: 'images/london-uk-passport-photo-dual-citizenship.jpg',
    title: 'British-Canadian Dual Citizens Must Now Use a UK Passport to Enter the UK',
    excerpt:
      'The UK now requires all British dual nationals — including Canadian-British citizens — to enter with a valid British passport or certificate of entitlement.',
  },
  {
    key: 'india',
    file: 'blog-india-icao-photo-changes.html',
    badge: 'India Travel',
    date: 'Sep 1, 2025',
    read: '8 min read',
    img: 'images/new-delhi-india-passport-photo-requirements.jpg',
    title: "India's New ICAO Passport Photo Rules: What Changed",
    excerpt:
      'India now mandates ICAO-compliant photographs for all passport-related applications — the old 51×51mm square format is no longer accepted.',
  },
];

const vendorRows = [
  { cat: 'Immigration', name: 'Licensed immigration consultants', desc: 'RCIC-registered consultants for permanent residence, work and study permit applications.' },
  { cat: 'Notary', name: 'Notary public & commissioner of oaths', desc: 'Document notarization, affidavits and certified true copies in downtown Toronto.' },
  { cat: 'Translation', name: 'Certified document translation', desc: 'Certified translations accepted by IRCC and foreign consulates.' },
  { cat: 'Courier', name: 'Secure document courier', desc: 'Tracked courier service for passport and visa applications.' },
];

/* Every service page links to the next 5 services in key order, so each page
   receives inbound links from 5 different pages. */
function relatedKeys(key) {
  const keys = Object.keys(svcData);
  const i = Math.max(0, keys.indexOf(key));
  return [1, 2, 3, 4, 5].map((n) => keys[(i + n) % keys.length]);
}

/* Index-based rotation through the 29-review pool, so no two adjacent service
   pages show the same pair. */
function svcReviews(key) {
  const i = Math.max(0, Object.keys(svcData).indexOf(key));
  return [topReviews[(i * 2) % topReviews.length], topReviews[(i * 2 + 1) % topReviews.length]];
}

function svcTitle(key) {
  return svcTitleOverride[key] || `${svcData[key].name} Photos`;
}

function reqRows(key) {
  if (key === 'document-services') {
    return [
      'Colour & B/W printing',
      'Scanning to PDF or email',
      'Photocopying while you wait',
      'Passport photo printing from digital files',
      'Document formatting & resizing',
      'USB and email file transfer',
    ];
  }
  const s = svcData[key];
  return [
    `Size: ${s.size}`,
    'Plain white or light background',
    'Full face view, facing camera',
    'Neutral facial expression',
    'Eyes open and clearly visible',
    'No shadows on face or background',
    s.face,
    'Recent photo (within 6 months)',
  ];
}

module.exports = {
  areas, svcData, topReviews, faqData, blogPosts,
  svcFile, svcTitleOverride, areaSlug, areaFile, areaImg,
  nav, tierCards, docPriceRows, photoSteps, docHeroSub, photoHeroSub,
  catDefs, homeSvcKeys, homeChips, tierRows, homeAreaNames, sampleRows, blogDefs, vendorRows,
  relatedKeys, svcReviews, svcTitle, reqRows,
};
