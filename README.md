# zellij.online

Landing page. Hugo, deployed to GitHub Pages on push to `main`.

## Develop

Needs Hugo extended (CI uses 0.148.2).

```
hugo server
```

Production build:

```
hugo --minify --gc --cleanDestinationDir
```

## Deploy

Push to `main`. See `.github/workflows/hugo.yml`. PRs build but don't deploy.

Custom domain comes from `static/CNAME` plus `baseURL` in `hugo.toml`. Change
both together.

## Layout

- `hugo.toml` — title, taglines, description
- `content/` — home page front matter, legal notice, privacy policy
- `layouts/index.html` — the page
- `layouts/_default/baseof.html` — head, meta tags, footer, analytics
- `static/css/style.css` — all styling
- `static/js/` — terminal animation (GSAP), waitlist form

## Waitlist

Posts to a hosted Keila form with hCaptcha. `static/js/waitlist.js` loads the
captcha on first interaction and swaps in a confirmation message on submit.
Keila handles double opt-in.

Changing provider means updating the form action and field names in
`layouts/index.html`, and section 4 of `content/privacy.md`.

## Third parties

Keila, hCaptcha, GoatCounter. All disclosed in the privacy policy.

## Notes

- Iosevka is self-hosted; no external font requests.
- The terminal demo is an inline SVG animated with GSAP.
