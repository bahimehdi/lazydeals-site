# LazyDeals landing site

Static HTML/CSS for the product homepage and help page. No app backend, analytics, live offer calls, or build dependency is required.

Preview from the repository root with `python -m http.server 4178 --directory site`, then open `http://localhost:4178/`. Do not open the HTML directly from disk; relative links are meant for an HTTP host.

## Publication gates

- Edge Add-ons is the only active store CTA until the Chrome listing is publicly accessible and independently verified. Replace both non-clickable Chrome status labels with the verified listing URL only then.
- The production hostname is `https://lazydeals.tech/`. Keep the self-canonical URLs, Open Graph image URLs, `robots.txt`, and sitemap aligned with that hostname; do not index temporary previews.
- Test the deployed homepage, `/help/`, store destination, privacy policy, support email and mobile layouts. Submit the production hostname to Google Search Console; indexing and ranking are not guaranteed.
- Screenshots are real extension UI captures with sample content. Refresh them when the store-shipped UI materially changes, and check them for personal data or Share-link tokens.
- The public privacy policy currently lives at `https://bahimehdi.github.io/lazydeals-privacy/`. Keep its disclosures aligned with the extension before linking it from a production site.

The extension runtime, permissions and storage are not modified by this site.
