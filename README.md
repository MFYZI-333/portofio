# MAFIOUZI — Morocco & Algeria, up close

An English-language editorial journal about travel, food and local culture in Morocco and Algeria. Built with plain HTML, CSS and JavaScript; there is no build step.

## Run locally

Open `index.html` in a browser, or open the project in VS Code and use Live Server. Images and web fonts are served remotely, so an internet connection is needed for the full visual experience.

## Add a story

Add a uniquely identified object to `window.MAFIOUZI_ARTICLES` in `data/articles.js`. Each entry has `type` and `category` (`travel`, `food` or `culture`), `subcategory`, `country`, `countryCode`, `city`, `region`, `title`, `excerpt`, `author`, `date`, `dateLabel`, `readTime`, `image`, `alt`, `intro`, `sections`, `highlights`, `origin`, `takeaway`, `tags` and `related`. Set `featured`, `trending` or `hiddenGem` to control editorial placement.

Food stories can also include `ingredients`, `preparation` and `history`; destination guides can include `bestTime` and `budget`. The article page renders these fields automatically. Related stories are referenced by their IDs. Keep `date` in ISO `YYYY-MM-DD` format for latest-story sorting.

Content remains separate from templates, making the collection easy to scale and ready for future language-specific fields such as `title.en`, `title.ar` and `title.fr`.

## Features and integrations

- Search, topic/country/subcategory filters, dark mode and sharing work in the browser.
- Destination and story cards use image-led page transitions, with reduced-motion support.
- Newsletter and contact forms provide a local confirmation only. Connect a backend or email provider to receive submissions.
- Put downloaded images in `images/` and update their article `image` URLs for offline use.
- The shared author profile image is `images/mafiouzi-profile.png`; replace it there to update profile avatars across article cards and story pages.
- The production canonical domain is `https://mfyzi.com`; `vercel.json` redirects `www.mfyzi.com` to the canonical domain. Add both domains in Vercel project settings and configure the DNS records shown there at your domain registrar before publishing.

## Analytics and advertising setup

1. Create a GA4 web data stream for `https://mfyzi.com` in Google Analytics and copy its real Measurement ID (`G-...`) into `ga4MeasurementId` in `js/config.js`.
2. Apply for AdSense and wait for site approval. After approval, copy the real publisher ID (`ca-pub-...`) and the numeric ad unit IDs from AdSense into `adsensePublisherId` and the matching `adSlots` entries in `js/config.js`. Empty settings are intentionally left disabled; do not enter example IDs.
3. If AdSense requests an `ads.txt` file, use the exact line supplied by your AdSense account at the site root. Do not copy a sample publisher value.
4. Deploy the site to Vercel. Analytics and ads load only after a visitor accepts optional cookies; the visitor can change this choice from the footer. The privacy notice is in `privacy.html`; review it for your jurisdiction, hosting, consent rules, and final service setup. This lightweight consent UI is not a Google-certified CMP; Google requires a certified CMP for personalized ads served to users in the EEA, UK, and Switzerland.
5. In Google Search Console, verify `https://mfyzi.com` and submit `https://mfyzi.com/sitemap.xml`. `robots.txt` already points crawlers to the sitemap.
6. When adding or removing article IDs, update `sitemap.xml` so search engines can discover the current story URLs.

Ad placements are reserved on the home page, journal, and article pages and remain invisible unless both a real approved publisher ID and that placement's real ad unit ID are set. No GA4 or AdSense identifiers are included in this project. GA4 reports traffic sources, pages, engagement, and approximate geography/device details; real-time reporting is available in its Realtime report. Clicks, outbound links, file downloads, search submits, and form submits are tracked only with consent. Current forms do not actually transmit or store form submissions.

`meta keywords` is intentionally omitted: major search engines do not use it as a ranking signal. Each page has a title, description, canonical URL, Open Graph/Twitter metadata, and appropriate structured data.
