# Replace Similar Text

Browser extension that replaces names, titles, and other phrases on a page—including close spellings—without using AI translation.

## Why it exists

Auto-translated books (especially from Chinese) often render the same name several different ways. This extension lets you pin the wording you want.

## Load unpacked (development)

1. Open `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select this folder

## Publish to Chrome Web Store

1. Zip **this folder** (the directory that contains `manifest.json`). Include `_locales`, `icons`, scripts, and `popup.*`. You may omit `store/` from the zip if you want a smaller package; listing copy lives there for you, not for Chrome.
2. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time developer fee if needed
4. New item → upload the zip
5. Paste text from `store/STORE_LISTING.md`
6. Upload screenshots from `store/screenshots/` (1280×800, RGB PNG, no alpha). Also upload `promo-small-440x280.png` and `promo-marquee-1400x560.png`.
7. Host `store/privacy.html` somewhere public and add the URL as the privacy policy
8. Submit for review

Do not pack secrets. This project has none.
