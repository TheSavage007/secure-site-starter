/**
 * privacy.config.js
 * Single source of truth for what the site collects, why, where it goes,
 * and how long it stays. Every privacy claim on the site reads from here,
 * so the policy page cannot drift away from what the code actually does.
 *
 * Rule that governs this file: if a field is not listed here, the site
 * does not collect it. Add the field here first, then to the form.
 */

export const PRIVACY = {
  effectiveDate: '2026-07-24',
  controller: 'LTD Diesel',
  contactEmail: 'privacy@example.com',
  jurisdiction: 'Arizona, United States'
};

/**
 * Everything the site takes from a visitor.
 * purpose is why it exists. Anything without a purpose gets deleted from the form.
 */
export const DATA_COLLECTED = [
  { field: 'name',    required: true,  purpose: 'Reply to the request',            sensitive: false },
  { field: 'email',   required: true,  purpose: 'Reply to the request',            sensitive: false },
  { field: 'phone',   required: false, purpose: 'Reply faster when asked to call', sensitive: false },
  { field: 'service', required: true,  purpose: 'Route the request correctly',     sensitive: false },
  { field: 'address', required: false, purpose: 'Confirm the job is in range',     sensitive: true  },
  { field: 'message', required: true,  purpose: 'Understand the job',              sensitive: false }
];

/** Fields the site refuses to collect through any form, ever. */
export const NEVER_COLLECT = [
  'social security number',
  'driver license number',
  'date of birth',
  'card number, CVV, or expiration',
  'bank account or routing number',
  'health information',
  'government ID images',
  'precise device location'
];

/** Third parties that touch visitor data. Keep this list honest and short. */
export const PROCESSORS = [
  { name: 'Netlify',   role: 'Hosting and form delivery',  data: 'Form submissions, server logs, IP address' },
  { name: 'Formspree', role: 'Backup form delivery',       data: 'Form submissions', optional: true },
  { name: 'Google Fonts', role: 'Typeface delivery',       data: 'IP address at font request time' },
  { name: 'Google Maps',  role: 'Map embed',               data: 'IP address, entered address', optional: true },
  { name: 'Base44',    role: 'Lead storage and auth',      data: 'Lead records', optional: true }
];

export const RETENTION = {
  leads: '24 months from last contact, then deleted',
  serverLogs: '30 days, handled by the host',
  emailThreads: '36 months, then archived or deleted',
  deletionRequestSla: '30 days from a verified request'
};

/**
 * Consent gate. Nothing non essential loads until the visitor says yes.
 * Set analytics to false and the tracker never fires, consent or not.
 */
export const CONSENT = {
  required: true,
  categories: {
    essential: { label: 'Essential', always: true,  description: 'Page delivery, form security, and fraud prevention.' },
    analytics: { label: 'Analytics', always: false, description: 'Anonymous page counts. Off until you allow it.' },
    maps:      { label: 'Maps',      always: false, description: 'Google Maps embed. Loads only if you allow it.' }
  },
  storageKey: 'consent:v1',
  expiryDays: 180
};

/** Visitor rights the site honors regardless of which state law applies. */
export const RIGHTS = [
  'Ask what is stored about you',
  'Get a copy of it',
  'Correct anything wrong',
  'Have it deleted',
  'Opt out of any marketing message',
  'Get a straight answer within 30 days'
];

/** True if the field is allowed. Wire this into the form builder. */
export function isAllowedField(name) {
  return DATA_COLLECTED.some((d) => d.field === name.toLowerCase());
}

/** Strips any field that is not on the approved list before submission. */
export function minimize(payload) {
  const clean = {};
  Object.keys(payload || {}).forEach((k) => {
    if (isAllowedField(k) || ['submitted_at', 'source', 'form-name'].includes(k)) clean[k] = payload[k];
  });
  return clean;
}

/** Consent state helpers. */
export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT.storageKey);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const age = (Date.now() - saved.at) / 86400000;
    if (age > CONSENT.expiryDays) return null;
    return saved.choices;
  } catch { return null; }
}

export function setConsent(choices) {
  try {
    localStorage.setItem(CONSENT.storageKey, JSON.stringify({ at: Date.now(), choices }));
  } catch { /* storage blocked, treat as essential only */ }
}

export function allowed(category) {
  if (CONSENT.categories[category] && CONSENT.categories[category].always) return true;
  const c = getConsent();
  return !!(c && c[category]);
}
