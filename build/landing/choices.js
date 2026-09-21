// Campaign-specific shortlist; edit these groups as ad landing pages are rolled out.
// The preview toolbar remains the full catalog, separate from the customer chooser.
window.PHOTO_CHOICE_GROUPS = {
  'passport-photos': ['canadian-passport', 'us-passport', 'uk-passport'],
  digital: ['uk-passport', 'us-visa', 'indian-visa'],
  'visa-photos': ['us-visa', 'schengen-visa', 'chinese-visa'],
  'digital-id': ['school-id', 'university-id', 'licenses'],
  oci: ['oci', 'indian-passport', 'indian-visa'],
  'indian-pcc': ['indian-pcc', 'indian-passport', 'oci']
};
window.getLandingChoices = function(key) {
  if (window.PHOTO_CHOICE_GROUPS[key]) return window.PHOTO_CHOICE_GROUPS[key];
  const related = key.includes('passport') ? ['canadian-passport', 'us-passport', 'uk-passport']
    : /visa|immigration|green-card/.test(key) ? ['us-visa', 'schengen-visa', 'chinese-visa']
    : /permit|pr-card|citizenship|refugee/.test(key) ? ['pr-card', 'citizenship', 'study-permit']
    : ['school-id', 'university-id', 'licenses'];
  return [...new Set([key, ...related])].filter(k => window.PHOTO_CATALOG[k]).slice(0, 3);
};
