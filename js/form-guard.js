/**
 * form-guard.js
 * Submission protection for the contact and lead forms.
 *
 * Four layers, all client side and all free:
 *   1. Honeypot field that only a bot fills in
 *   2. Dwell timer that rejects submits faster than a human can type
 *   3. Local rate limit so one browser cannot hammer the endpoint
 *   4. Input sanitizing and field length caps before anything leaves the page
 *
 * Client side checks stop noise, not a determined attacker. Anything that
 * actually matters gets validated again on the server or in the form provider.
 *
 * Usage:
 *   import { guardForm } from './form-guard.js';
 *   guardForm('form[name="contact"]', { minSeconds: 3, maxPerHour: 5 });
 */

const DEFAULTS = {
  honeypotName: 'bot-field',
  minSeconds: 3,          // faster than this is a script, not a person
  maxPerHour: 5,          // submissions allowed per browser per hour
  maxFieldLength: 2000,
  blockUrlsInMessage: true,
  onReject: null          // optional (reason) => {}
};

export function guardForm(selector, options = {}) {
  const form = document.querySelector(selector);
  if (!form) return null;

  const cfg = { ...DEFAULTS, ...options };
  const loadedAt = Date.now();

  ensureHoneypot(form, cfg.honeypotName);

  form.addEventListener('submit', (e) => {
    const reason = check(form, cfg, loadedAt);
    if (reason) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof cfg.onReject === 'function') cfg.onReject(reason);
      else showMessage(form, humanize(reason));
      return false;
    }
    sanitizeAll(form, cfg);
    stamp(cfg);
  });

  return { check: () => check(form, cfg, loadedAt) };
}

/* ---------------- checks ---------------- */

function check(form, cfg, loadedAt) {
  const pot = form.querySelector(`[name="${cfg.honeypotName}"]`);
  if (pot && pot.value.trim() !== '') return 'honeypot';

  const seconds = (Date.now() - loadedAt) / 1000;
  if (seconds < cfg.minSeconds) return 'too-fast';

  if (overLimit(cfg)) return 'rate-limit';

  const message = form.querySelector('[name="message"]');
  if (message && cfg.blockUrlsInMessage && countLinks(message.value) > 2) return 'link-spam';

  const email = form.querySelector('[name="email"]');
  if (email && email.value && !validEmail(email.value)) return 'bad-email';

  return null;
}

function countLinks(text) {
  const m = String(text || '').match(/https?:\/\/|www\.|\[url|<a\s/gi);
  return m ? m.length : 0;
}

function validEmail(v) {
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(v).trim());
}

/* ---------------- rate limit ---------------- */

const KEY = 'fg:submits';

function history() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function overLimit(cfg) {
  const cutoff = Date.now() - 3600 * 1000;
  const recent = history().filter((t) => t > cutoff);
  return recent.length >= cfg.maxPerHour;
}

function stamp() {
  try {
    const cutoff = Date.now() - 3600 * 1000;
    const recent = history().filter((t) => t > cutoff);
    recent.push(Date.now());
    sessionStorage.setItem(KEY, JSON.stringify(recent));
  } catch { /* storage blocked, checks still run on the provider side */ }
}

/* ---------------- sanitizing ---------------- */

export function sanitize(value, maxLength = 2000) {
  return String(value || '')
    .slice(0, maxLength)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')  // control chars
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function sanitizeAll(form, cfg) {
  form.querySelectorAll('input, textarea').forEach((el) => {
    if (el.type === 'hidden' || el.type === 'submit') return;
    el.value = sanitize(el.value, cfg.maxFieldLength);
  });
}

/* ---------------- helpers ---------------- */

function ensureHoneypot(form, name) {
  if (form.querySelector(`[name="${name}"]`)) return;
  const wrap = document.createElement('p');
  wrap.setAttribute('hidden', '');
  wrap.innerHTML = `<label>Leave this field empty
    <input name="${name}" tabindex="-1" autocomplete="off" /></label>`;
  form.appendChild(wrap);
  form.setAttribute('netlify-honeypot', name);
}

function showMessage(form, text) {
  let el = form.querySelector('.fg-message');
  if (!el) {
    el = document.createElement('p');
    el.className = 'fg-message';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'color:#E06B5F;font-size:13px;margin-top:.8rem;';
    form.appendChild(el);
  }
  el.textContent = text;
}

function humanize(reason) {
  const map = {
    'honeypot': 'That submission could not be verified. Refresh the page and try again.',
    'too-fast': 'Take another second to review your details, then send.',
    'rate-limit': 'You have sent several requests already. Email us directly and we will pick it up there.',
    'link-spam': 'Remove the extra links from your message and send again.',
    'bad-email': 'Enter a valid email address so we can reply.'
  };
  return map[reason] || 'That did not go through. Try again.';
}

if (typeof window !== 'undefined') window.guardForm = guardForm;
