window.PHOTO_CATALOG.unlisted={name:'Other'};
// Campaign-specific shortlist; edit these groups as ad landing pages are rolled out.
// Broad passport landing pages offer seven countries and an unlisted-document option.
window.PHOTO_CHOICE_GROUPS = {
  'visa-photos': ['us-visa', 'schengen-visa', 'chinese-visa', 'indian-visa', 'japanese-visa', 'korean-visa', 'vietnam-visa', 'unlisted'],
  'digital-id': ['school-id', 'university-id', 'licenses'],
  oci: ['oci', 'indian-passport', 'indian-visa'],
  'indian-pcc': ['indian-pcc', 'indian-passport', 'oci']
};
window.getLandingChoices = function(key) {
  if (key === 'passport-photos' || key === 'digital') {
    return ['canadian-passport','us-passport','uk-passport','indian-passport','chinese-passport','french-passport','german-passport','unlisted'];
  }
  if (window.PHOTO_CHOICE_GROUPS[key]) return window.PHOTO_CHOICE_GROUPS[key];
  const related = key.includes('passport') ? ['canadian-passport', 'us-passport', 'uk-passport']
    : /visa|immigration|green-card/.test(key) ? ['us-visa', 'schengen-visa', 'chinese-visa']
    : /permit|pr-card|citizenship|refugee/.test(key) ? ['pr-card', 'citizenship', 'study-permit']
    : ['school-id', 'university-id', 'licenses'];
  return [...new Set([key, ...related])].filter(k => window.PHOTO_CATALOG[k]).slice(0, 3);
};
