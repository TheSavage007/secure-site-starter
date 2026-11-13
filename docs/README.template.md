# Project Name

One sentence on what this is and who it serves. Live at **https://example.netlify.app**

![Status](https://img.shields.io/badge/status-live-5FBFB5) ![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-1C1C1E)

---

## What it does

Two or three sentences of plain language. What problem the client had, what the site does about it, and what happens when a visitor lands on it. No buzzwords.

## Stack

| Layer | Tool |
|---|---|
| Markup | Semantic HTML5, single file or Vite build |
| Styling | Hand written CSS with custom properties, no framework |
| Type | Cormorant Garamond display, Inter body |
| Forms | Netlify Forms with a Formspree fallback |
| Hosting | Netlify, drag and drop or Git deploy |
| Data | Base44 entities where a backend is needed |

## Features

- Sticky navigation with a mobile menu
- Single page routing through `sp()`, no router dependency
- Three step lead capture with client side validation
- Rules based site concierge, no API key exposed to the browser
- LocalBusiness JSON-LD schema for search and the map pack
- Responsive to 360px, visible keyboard focus, reduced motion respected

## Run it locally

```bash
git clone https://github.com/TheSavage007/REPO-NAME.git
cd REPO-NAME

# Single file build
open index.html

# Vite build
npm install
npm run dev
```

## Deploy

```bash
npm run build          # skip for single file builds
```

Then drag the folder onto Netlify Drop, or connect the repo and let `netlify.toml` handle it.

## Configuration

All business details live in `site.config.js`. Change the phone number, the services, or the pricing there and it updates everywhere.

## Structure

```
.
├── index.html
├── site.config.js
├── spa-router.js
├── lead-capture.js
├── concierge.js
├── netlify.toml
└── README.md
```

## Notes

Anything a hiring manager should know. Decisions you made and why. Tradeoffs you took. This section is where the engineering judgment shows.

---

Built by Randy O. Powell
