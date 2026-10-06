# LazyDeals landing site

Static HTML/CSS/JavaScript for the product homepage and help page. There is no LazyDeals backend, analytics, or visitor-side call to the offer provider. The 100%-off rail loads a same-origin `offers.json` snapshot built by GitHub Actions.

The site repository's `.github/workflows/refresh-offers.yml` runs on pushes, manual dispatch, and a three-hour schedule. It requests the Epic PC, Steam and GOG feeds once each, applies the same paid-PC-game filters as the extension, and deploys a Pages artifact. A failed feed request fails that run; the previous deployment remains, and the website stops displaying it as current after six hours. GitHub scheduled runs can be delayed or disabled after prolonged repository inactivity, so check Actions if the rail says its reports are unavailable.

To preview locally, generate `offers.json` into a separate temporary copy of the site with `node scripts/build-offers.mjs <artifact-directory>/offers.json`, then serve that directory over HTTP. The browser requests only `offers.json` from its own origin; offer artwork is loaded from the HTTPS image URL in the report, with no referrer. Selecting an offer opens its FreeToKeep report page, where the visitor can continue to the store. No site-specific user data is saved.

## Publication gates

- The Chrome Web Store and Edge Add-ons CTAs point to verified public listings. The Chrome badge is Google's official dark-background variant, resized without modification.
- The production hostname is `https://lazydeals.tech/`. Keep the self-canonical URLs, Open Graph image URLs, `robots.txt`, and sitemap aligned with that hostname; do not index temporary previews.
- Test the deployed homepage, `/help/`, store destination, privacy policy, support email and mobile layouts. Submit the production hostname to Google Search Console; indexing and ranking are not guaranteed.
- The hero image is a crop of the real 1.1.0 extension UI in an isolated demo profile. It shows staged $10 Deaths Door and Silksong targets. Deaths Door's Steam ($1.99), Fanatical and Gamesplanet ($3.99), and Humble Store and GOG ($4.99) discounted offers were checked against the CheapShark batch response on October 6, 2026, then staged in the profile for a reproducible screenshot. This is a dated example, not a live quote. Refresh screenshots when the shipped UI materially changes, and check them for personal data or Share-link tokens.
- The budget-bundle image is another isolated 1.1.0 UI capture: a staged $50 "Metroidvanias" bundle with Blasphemous, Hollow Knight, Hollow Knight: Silksong, Nine Sols, and Death's Door. Its expanded price breakdown and $49.45 total are illustrative fixture values, not current provider quotes.
- In Settings → Pages, set the publishing Source to **GitHub Actions**. Branch-source Pages builds are not triggered by `GITHUB_TOKEN` workflow commits; this site deploys an artifact directly. Keep the existing `lazydeals.tech` custom domain and Enforce HTTPS setting.
- The public privacy policy currently lives at `https://bahimehdi.github.io/lazydeals-privacy/`. Keep its disclosures aligned with the extension before linking it from a production site.

The extension runtime, permissions and storage are not modified by this site.
