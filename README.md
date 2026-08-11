# Zellij.online — one-page site (Hugo)

## Run it locally

1. Install Hugo (extended not required — this site uses no Sass):
   - macOS: `brew install hugo`
   - Or download a binary for your OS from https://github.com/gohugoio/hugo/releases

2. From this folder, start the dev server:
   ```
   hugo server -D
   ```
   Then open http://localhost:1313 — it live-reloads as you edit files.

3. Build the static site for deployment:
   ```
   hugo --minify
   ```
   Output goes to `public/` — upload that folder's contents to any static
   host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3, etc).

## Where to edit things

- `hugo.toml` — site title, tagline text, meta description (params).
## Site title is what appears on the Google search. Meta description is what will appear in the body text for the page’s listing on search engines. keep at 150-160 characters.
- `content/_index.md` — page title/description used for SEO tags.
## Also meta desc and SEO tags
- `layouts/index.html` — the entire page markup (single template, no nav bar).
## Place of canonical URL 
- `static/css/style.css` — all styling (colors, type, layout, responsive rules).
- `static/img/demo-placeholder.svg` — swap this for your real demo asset.

## We're lacking: Sitemap, pagination, pagination meta-tags, 404 page.

## Swapping in the real product demo

The demo section currently shows a labeled placeholder SVG. Recommendation:
use a short, muted, autoplaying, looping `<video>` instead of a GIF — same
"always playing" feel, much smaller file size and sharper image at the same
quality. In `layouts/index.html`, replace the `<img>` line inside
`.demo-frame` with something like:

```html
<video src="/img/demo.mp4" autoplay loop muted playsinline></video>
```

Drop `demo.mp4` into `static/img/`. If you'd rather keep a GIF, just replace
`static/img/demo-placeholder.svg` and point the `<img src>` at it.

## Wiring up the waitlist form

The email form in the "waitlist" section is intentionally inert
(`action="#"`) so you can point it at whatever email service you use —
Mailchimp, ConvertKit, Buttondown, a Formspree endpoint, Netlify Forms, etc.
Most of these just need you to change the `<form>`'s `action` and `method`,
and possibly add a hidden field they require.

## Notes on the design

- No top navigation bar, per the brief — this is a single scrolling page.
- The bottom status bar is fixed and always visible (mirrors the reference
  image), with the keybinding hints hidden on narrow screens to save space.
- Font is JetBrains Mono throughout (loaded from Google Fonts), matching the
  terminal aesthetic of the reference.
- Fully responsive: test narrow widths — the waitlist form stacks, the demo
  frame scales down, and the status bar simplifies to mode + site name only.
