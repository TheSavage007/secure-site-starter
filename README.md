# Secure Site Starter

A framework free starter kit for small business websites that need to look professional, capture leads safely, and respect visitor privacy. It packages the patterns I use across client builds: two page templates, a guarded form pipeline, a consent gate for third party embeds, a privacy config that drives the policy page, and a hardened security header set.

> The demo brand is **LTD Diesel**, used with permission. Every phone number and street address in this repo is a placeholder in the fictional 555 range, and emails use the reserved example.com domain. No client or personal contact data is included.

## What's Inside

| Path | What it is |
|---|---|
| [templates/dark-landing.html](templates/dark-landing.html) | Single page landing template: sticky nav, hero, service cards, stat strip, Netlify form, toast |
| [templates/light-spa.html](templates/light-spa.html) | Multi page single page app template with `sp()` routing and deep link support |
| [templates/privacy.html](templates/privacy.html) | Plain language privacy policy page that matches the privacy config |
| [templates/seo-head.html](templates/seo-head.html) | Head block with meta tags, Open Graph, LocalBusiness JSON-LD, robots.txt, and sitemap.xml |
| [js/form-guard.js](js/form-guard.js) | Four layer form protection: honeypot, dwell timer, rate limit, sanitizing |
| [js/privacy.config.js](js/privacy.config.js) | Single source of truth for what the site collects, why, who processes it, and how long it stays |
| [js/consent-banner.js](js/consent-banner.js) | Holds maps and analytics until the visitor opts in |
| [security/_headers](security/_headers) | Netlify headers: CSP, HSTS, frame, referrer, and permissions policies, plus noindex on admin routes |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting, threat model, and pre launch checklist |
| [docs/README.template.md](docs/README.template.md) | README template for each client repo |

## Design Principles

1. **No framework, no build step.** Every file drops into a static site. Fewer dependencies means fewer things to patch.
2. **Privacy by configuration.** If a field is not listed in `privacy.config.js`, the form does not collect it. `minimize()` strips anything extra before submission.
3. **Consent before contact.** A Google Maps iframe phones home the moment it loads. The consent banner keeps it as a placeholder until the visitor says yes.
4. **Client checks filter, servers decide.** The form guard stops noise. Real validation happens again at the form provider.
5. **No secrets in the browser.** Anything that needs a key runs behind a serverless function.

## Quick Start

```html
<!-- In any template -->
<script type="module">
  import { guardForm } from './js/form-guard.js';
  import { mountConsent } from './js/consent-banner.js';

  guardForm('form[name="contact"]', { minSeconds: 3, maxPerHour: 5 });
  mountConsent({ accent: '#5FBFB5' });
</script>
```

Gate a map embed behind consent:

```html
<div data-consent="maps"
     data-src="https://www.google.com/maps/embed?pb=YOUR_EMBED"
     class="consent-block">Map loads after you allow it.</div>
```

Deploy by dragging the folder onto Netlify Drop, and move `security/_headers` to the publish root.

## Related

The navigation router, three step lead capture, rules based chat assistant, and site config modules live in [applied-projects/web-modules](https://github.com/TheSavage007/applied-projects/tree/main/web-modules).

## Tech Stack

HTML5, CSS custom properties, JavaScript ES modules, Netlify Forms, Formspree, JSON-LD

## Author

Randy O. Powell | [GitHub](https://github.com/TheSavage007) | [LinkedIn](https://www.linkedin.com/in/randy-powell-224a92bb)
