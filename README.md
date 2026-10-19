# xSafehouse

Home base for **Safehouse**, an international creator collective. This repo holds the landing
page, brand assets, and (soon) the agentic tools that help members create.

```
web/      Landing page (static HTML/CSS/JS, no build step)
brand/    Logo, silhouette emblem, banner template + rendered banners
docs/     Product notes, e.g. the Live Clipper spec
```

## Landing page

A single hero screen with a glass header, Discord and YouTube buttons, a live Discord
announcements embed, and a button that leads to the Studio (the agentic product).
Tapping anywhere on the background sends out an ember "vibration wave", and it buzzes on
phones that support it.

### Configure

Edit `web/config.js`:

| Key | What |
| --- | --- |
| `discordInvite` | Discord invite link |
| `youtubeUrl` | YouTube channel |
| `studioUrl` / `studioLabel` | Where the agentic product lives, and the button text |
| `discordServerId` / `discordAnnouncementsChannelId` | Turns on the announcements embed |

Any link left empty shows a small "soon" tag instead of a broken link.

**Announcements embed:** Discord's own widget can't show channel messages, so the page uses
[WidgetBot](https://widgetbot.io). Invite the WidgetBot bot to the server, turn on Developer
Mode in Discord, then right-click the server and the `#announcements` channel → **Copy ID**,
and paste both IDs into the config.

### Run locally

```sh
npx serve web    # or: python3 -m http.server -d web
```

### Deploy

`.github/workflows/pages.yml` publishes `web/` to GitHub Pages on every push to `main`.
Turn it on under **Settings → Pages → Source: GitHub Actions**. The folder also works as-is
on Vercel, Netlify or Cloudflare Pages.

## Brand

- `brand/safehouse-logo.png`: the full logo
- `brand/emblem.svg`: single-colour silhouette emblem (uses `currentColor`, so it takes on
  whatever colour it's placed in). It's also the page watermark.
- `brand/banner-*.png`: X/Twitter (1500×500), YouTube (2560×1440, safe area respected),
  Discord (960×540), wide (1920×640)

Re-render the banners after editing `brand/banner.html`:

```sh
npm i playwright && node brand/render-banners.mjs
```

## Roadmap

- **Studio:** agentic tools for creators (see [`docs/live-clipper.md`](docs/live-clipper.md)
  for the first one: real-time stream clipping with a ready-to-post queue)
