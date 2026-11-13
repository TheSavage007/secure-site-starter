# Security Policy

How this project is protected and how to report something that is not.

---

## Reporting a vulnerability

Email **security@example.com** with the word "security" in the subject.

- Acknowledgement within **72 hours**
- Assessment within **7 days**
- Fix or a written plan within **30 days**

Do not open a public issue for a vulnerability. Do not test against live customer data.
Report it, give us the window, and you get credit in the fix notes if you want it.

---

## What ships in every build

### Transport
- HTTPS enforced on every route, HTTP redirected
- HSTS with `max-age=31536000; includeSubDomains; preload`
- `upgrade-insecure-requests` set in the content security policy

### Browser hardening
| Header | Value | What it stops |
|---|---|---|
| `Content-Security-Policy` | Allowlist per site | Injected scripts and unknown origins |
| `X-Content-Type-Options` | `nosniff` | MIME confusion attacks |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking through an iframe |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | URL leakage to third parties |
| `Permissions-Policy` | Camera, mic, payment off | Silent hardware access |
| `Cross-Origin-Opener-Policy` | `same-origin` | Cross window tampering |

### Secrets
- **No API keys in client code.** Anything that needs a key runs behind a serverless function.
- The site concierge is rules based on purpose, so there is nothing to steal from the browser.
- `.env` files are gitignored and never committed. Keys live in the host environment settings.
- If a key ever lands in a commit, rotate it first and scrub the history second. Rotation is the fix, deletion is cleanup.

### Forms
- Honeypot field that only automation fills
- Dwell timer that rejects submissions faster than a human can type
- Per browser rate limit
- Input sanitizing and length caps before submission
- Server side validation at the form provider, because client checks are a filter, not a wall

### Data minimization
- The form only accepts fields listed in `privacy.config.js`. Everything else is stripped.
- No payment data, government ID, health information, or date of birth is collected anywhere on the site.
- Admin and lead pages carry `noindex` plus `no-store` so they stay out of search and out of cache.

### Dependencies
- Framework free where possible. Fewer packages means fewer things to patch.
- `npm audit` before every release on the builds that use a bundler.
- Dependabot alerts enabled on the repo.

---

## Threat model in plain terms

This is a marketing and lead capture site. The realistic threats are:

1. **Form spam and abuse.** Handled by the four guard layers above.
2. **Credential exposure through committed keys.** Handled by keeping keys server side and rotating on any exposure.
3. **Injected third party script.** Handled by the content security policy allowlist.
4. **Lead data sitting around too long.** Handled by the retention schedule in `privacy.config.js`.

What this is not built to defend: a determined attacker with access to the hosting account. That is protected by two factor authentication on the host, the domain registrar, and the email account. Turn all three on. Losing the registrar loses everything downstream of it.

---

## Pre launch checklist

- [ ] `_headers` deployed and verified at securityheaders.com
- [ ] No keys, tokens, or `.env` values anywhere in the repo history
- [ ] Two factor authentication on host, registrar, and email
- [ ] Forms tested with the honeypot filled to confirm the reject fires
- [ ] Privacy policy linked from the footer of every page
- [ ] Admin and lead routes return `noindex`
- [ ] Retention windows in `privacy.config.js` match actual practice
- [ ] Contact email for security reports is live and monitored

---

Maintained by Randy O. Powell
