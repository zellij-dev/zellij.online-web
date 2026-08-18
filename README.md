# Zellij.online — landing page (Hugo)

Static one-page site for zellij.online, built with Hugo and deployed to GitHub
Pages via GitHub Actions.

## Local development

1. Install Hugo **extended** (the CI pins `0.148.2`):
   - macOS: `brew install hugo`
   - Or download from https://github.com/gohugoio/hugo/releases

2. Start the dev server:
   ```
   hugo server
   ```
   Open http://localhost:1313 — it live-reloads as you edit.

3. Reproduce the production build locally:
   ```
   hugo --minify --gc --cleanDestinationDir
   ```
   Output goes to `public/`, which is git-ignored and never committed.

## Deployment

Pushing to `main` triggers `.github/workflows/hugo.yml`, which builds the site
and publishes it to GitHub Pages. Pull requests run the same build as a check
but do not deploy.

One-time repository setup:

- Settings → Pages → Source: **GitHub Actions**
- Settings → Pages → Custom domain: `zellij.online`, then enable
  **Enforce HTTPS** once the certificate is issued
- DNS for `zellij.online`: four apex `A` records to `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and the matching
  `AAAA` records), plus a `CNAME` for `www` pointing at
  `<owner>.github.io`

`static/CNAME` is committed so the custom domain survives every redeploy. The
canonical origin is set by `baseURL` in `hugo.toml`; change both together if
the domain ever changes.

## Where to edit things

| Path | Purpose |
| --- | --- |
| `hugo.toml` | `baseURL`, site title, taglines, meta description |
| `content/_index.md` | Home page title and SEO description |
| `content/legal.md`, `content/privacy.md` | Legal notice and privacy policy |
| `layouts/index.html` | Full home page markup |
| `layouts/_default/baseof.html` | `<head>`, meta/OG tags, footer, analytics |
| `layouts/_default/single.html` | Legal and privacy page shell |
| `layouts/404.html` | Not-found page |
| `static/css/style.css` | All styling |
| `static/js/` | Terminal animation, waitlist/hCaptcha wiring, GSAP |
| `static/robots.txt` | Crawler rules and sitemap pointer |

Keep the site title under ~60 characters and the meta description at 150–160
characters; both are what search engines display.

## Waitlist form

The form in `layouts/index.html` posts to a hosted Keila form
(`https://app.keila.io/forms/...`) and is protected by hCaptcha, loaded on
demand by `static/js/waitlist.js`. Keila's double opt-in confirms every
address. Changing the provider means updating the form `action` and the field
names, and updating section 4 of `content/privacy.md` accordingly.

## Third parties (all disclosed in the privacy policy)

- **Keila Cloud** — newsletter/waitlist processing
- **hCaptcha** — bot protection on the waitlist form
- **GoatCounter** — cookieless, aggregate analytics

## Design notes

- Single scrolling page, no top navigation.
- Iosevka Term is self-hosted from `static/fonts/`; no external font requests.
- The terminal demo is an inline SVG (`layouts/partials/termshare-svg.html`)
  animated with GSAP, so it stays sharp at any size with no video payload.
- Fully responsive — check narrow widths, where the waitlist form stacks and
  the hero and terminal panes reflow into a single column.
