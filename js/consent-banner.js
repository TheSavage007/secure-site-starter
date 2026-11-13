/**
 * consent-banner.js
 * Blocks non essential third parties until the visitor allows them.
 *
 * The pattern that matters: a Google Maps iframe or an analytics script
 * contacts a third party the second the page loads, consent or not.
 * This file keeps those in a holding pattern and only lets them run
 * after a yes.
 *
 * Markup contract for a gated embed:
 *   <div data-consent="maps"
 *        data-src="https://www.google.com/maps/embed?pb=..."
 *        class="consent-block">Map loads after you allow it.</div>
 *
 * Usage:
 *   import { mountConsent } from './consent-banner.js';
 *   mountConsent({ accent: '#5FBFB5' });
 */

import { CONSENT, getConsent, setConsent, allowed } from './privacy.config.js';

export function mountConsent(options = {}) {
  const accent = options.accent || '#5FBFB5';
  injectStyles(accent);

  const existing = getConsent();
  if (existing) {
    releaseGated();
    return { open };
  }

  if (!CONSENT.required) {
    setConsent({ analytics: false, maps: false });
    return { open };
  }

  render();
  return { open };

  function render() {
    const bar = document.createElement('div');
    bar.className = 'cb';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Privacy choices');
    bar.innerHTML = `
      <div class="cb-body">
        <p><b>Your choices.</b> Essential features always run. Maps and anonymous
        page counts stay off until you allow them. Nothing is sold, ever.</p>
        <div class="cb-opts">
          <label><input type="checkbox" data-cat="maps" /> Maps</label>
          <label><input type="checkbox" data-cat="analytics" /> Analytics</label>
        </div>
      </div>
      <div class="cb-actions">
        <button class="cb-btn cb-ghost" data-act="essential">Essential only</button>
        <button class="cb-btn cb-solid" data-act="save">Save choices</button>
        <button class="cb-btn cb-solid" data-act="all">Allow all</button>
      </div>`;
    document.body.appendChild(bar);

    bar.querySelectorAll('[data-act]').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.dataset.act;
        let choices = { maps: false, analytics: false };

        if (act === 'all') choices = { maps: true, analytics: true };
        if (act === 'save') {
          bar.querySelectorAll('[data-cat]').forEach((cb) => { choices[cb.dataset.cat] = cb.checked; });
        }

        setConsent(choices);
        bar.remove();
        releaseGated();
      });
    });
  }

  function open() {
    const old = document.querySelector('.cb');
    if (old) old.remove();
    render();
  }
}

/** Swaps every gated placeholder for the real embed, but only where consent exists. */
export function releaseGated() {
  document.querySelectorAll('[data-consent]').forEach((el) => {
    const category = el.dataset.consent;
    if (!allowed(category)) return;

    const src = el.dataset.src;
    if (!src) return;

    const frame = document.createElement('iframe');
    frame.src = src;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.setAttribute('title', category + ' embed');
    frame.style.cssText = 'width:100%;height:100%;min-height:320px;border:0;border-radius:10px;';
    el.replaceWith(frame);
  });

  document.querySelectorAll('script[type="text/plain"][data-consent]').forEach((tag) => {
    if (!allowed(tag.dataset.consent)) return;
    const live = document.createElement('script');
    if (tag.dataset.src) live.src = tag.dataset.src;
    else live.textContent = tag.textContent;
    document.head.appendChild(live);
    tag.remove();
  });
}

function injectStyles(accent) {
  if (document.getElementById('cb-styles')) return;
  const css = `
  .cb{position:fixed;left:16px;right:16px;bottom:16px;z-index:400;max-width:760px;margin:0 auto;
    background:#232326;border:1px solid #3A3A3F;border-radius:12px;padding:18px 20px;
    font-family:Inter,system-ui,sans-serif;color:#F1EFEB;display:flex;gap:18px;
    align-items:center;flex-wrap:wrap;}
  .cb-body{flex:1;min-width:240px;}
  .cb p{font-size:13px;line-height:1.6;margin:0 0 10px;}
  .cb-opts{display:flex;gap:16px;font-size:12px;color:#A5A5AC;}
  .cb-opts label{display:flex;align-items:center;gap:6px;cursor:pointer;}
  .cb-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .cb-btn{border:1px solid transparent;border-radius:6px;padding:9px 16px;font-size:11.5px;
    font-weight:600;letter-spacing:.6px;text-transform:uppercase;cursor:pointer;font-family:inherit;}
  .cb-btn:focus-visible{outline:2px solid ${accent};outline-offset:2px;}
  .cb-solid{background:${accent};color:#1C1C1E;}
  .cb-ghost{background:transparent;color:#A5A5AC;border-color:#3A3A3F;}
  .cb-ghost:hover{color:${accent};border-color:${accent};}
  .consent-block{background:#232326;border:1px dashed #3A3A3F;border-radius:10px;
    min-height:320px;display:flex;align-items:center;justify-content:center;
    color:#A5A5AC;font-size:13px;text-align:center;padding:20px;}
  @media(max-width:620px){.cb{flex-direction:column;align-items:stretch;}}`;
  const tag = document.createElement('style');
  tag.id = 'cb-styles';
  tag.textContent = css;
  document.head.appendChild(tag);
}

if (typeof window !== 'undefined') window.mountConsent = mountConsent;
