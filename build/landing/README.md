# Guided photo-service pages

Run `npm ci`, then `npm run build` and `npm test` from the repository root.
The build replaces the 49 photo-service URLs from build/data.js. Printing/scanning,
the homepage, area pages, payment and other core pages retain their existing layouts.

The template is statically rendered with jsdom so page copy and links exist without
JavaScript. Runtime selectors update the sample and requirements. The original
page title, description, canonical, structured data and tracking head are preserved.
Booking uses the existing js/redesign.js Square overlay and attribution flow.
Selection does not pre-fill Square; customers choose their service in its scheduler.
No prototype booking dialog or noindex directive is shipped on service pages.

Edit app.js, page.html, style.css, choices.js and requirements.js here, then build.
Choices are three-item campaign lists, except the digital passport and passport hub pages, which show all passport countries (Canada, US and UK first; others alphabetically). Related links use the existing five-page
rotation from build/data.js. Requirement fallback data is the existing site's copy;
it is not a new independent audit of every country's specifications. Rating/review
count is the observed September 21, 2026 snapshot (4.9 / 372).

The main legacy build also invokes this generator last. The focused npm build
avoids rewriting unrelated core pages.
