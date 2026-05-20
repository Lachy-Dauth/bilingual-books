(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';
  var BANNER_ID = 'cookie-consent-banner';
  var SETTINGS_ID = 'cookie-consent-settings';
  var STYLE_ID = 'cookie-consent-styles';

  var config = window.__cookieConfig || {};
  var hasAds = config.hasAds === true;

  function read() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function write(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  function fireEvent(name) {
    var ev;
    try {
      ev = new CustomEvent(name);
    } catch (e) {
      ev = document.createEvent('Event');
      ev.initEvent(name, true, true);
    }
    document.dispatchEvent(ev);
  }

  function grant() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
    }
    fireEvent('cookie-consent-granted');
  }

  function deny() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
    }
    fireEvent('cookie-consent-denied');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#', BANNER_ID, '{position:fixed;left:0;right:0;bottom:0;z-index:2147483646;',
      'padding:14px 18px;background:#1f1f1f;color:#f0f0f0;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
      'font-size:14px;line-height:1.5;box-shadow:0 -2px 10px rgba(0,0,0,.3);',
      'display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}',
      '#', BANNER_ID, ' .ccb-message{flex:1 1 320px;min-width:0;margin:0;color:#f0f0f0}',
      '#', BANNER_ID, ' .ccb-message a{color:#88b4ff;text-decoration:underline}',
      '#', BANNER_ID, ' .ccb-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '#', BANNER_ID, ' button{font:inherit;font-weight:600;padding:8px 16px;',
      'border-radius:4px;cursor:pointer;border:1px solid transparent;line-height:1.2;',
      'min-height:36px;box-shadow:none;text-transform:none}',
      '#', BANNER_ID, ' .ccb-accept{background:#2da14a;color:#fff;border-color:#2da14a}',
      '#', BANNER_ID, ' .ccb-accept:hover{background:#258a3e;border-color:#258a3e}',
      '#', BANNER_ID, ' .ccb-reject{background:transparent;color:#f0f0f0;border-color:#999}',
      '#', BANNER_ID, ' .ccb-reject:hover{background:rgba(255,255,255,.08)}',
      '#', BANNER_ID, '.cc-hidden{display:none}',
      '#', SETTINGS_ID, '{position:fixed;left:12px;bottom:12px;z-index:2147483645;',
      'padding:6px 12px;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
      'background:rgba(31,31,31,.85);color:#f0f0f0;border:1px solid #555;border-radius:4px;',
      'cursor:pointer;min-height:auto;text-transform:none}',
      '#', SETTINGS_ID, ':hover{background:rgba(31,31,31,1)}',
      '@media (max-width:520px){',
      '#', BANNER_ID, '{font-size:13px;padding:12px}',
      '#', BANNER_ID, ' .ccb-actions{width:100%}',
      '#', BANNER_ID, ' .ccb-actions button{flex:1}}'
    ].join('');
    document.head.appendChild(s);
  }

  function buildBanner() {
    injectStyles();
    if (document.getElementById(BANNER_ID)) {
      showBanner();
      return;
    }
    var banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('aria-live', 'polite');

    var msg = document.createElement('p');
    msg.className = 'ccb-message';
    if (hasAds) {
      msg.textContent = 'This site uses cookies for analytics (Google Analytics) and advertising (Google AdSense) to understand how the site is used and to fund hosting. No tracking or ad cookies are set until you choose.';
    } else {
      msg.textContent = 'This site uses Google Analytics cookies to understand how the site is used. No analytics cookies are set until you choose.';
    }
    banner.appendChild(msg);

    var actions = document.createElement('div');
    actions.className = 'ccb-actions';

    var rejectBtn = document.createElement('button');
    rejectBtn.type = 'button';
    rejectBtn.className = 'ccb-reject';
    rejectBtn.textContent = 'Reject';
    rejectBtn.addEventListener('click', function () {
      write('rejected');
      deny();
      hideBanner();
      addSettingsButton();
    });
    actions.appendChild(rejectBtn);

    var acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'ccb-accept';
    acceptBtn.textContent = 'Accept';
    acceptBtn.addEventListener('click', function () {
      write('accepted');
      grant();
      hideBanner();
      addSettingsButton();
    });
    actions.appendChild(acceptBtn);

    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function hideBanner() {
    var b = document.getElementById(BANNER_ID);
    if (b) b.classList.add('cc-hidden');
  }

  function showBanner() {
    var b = document.getElementById(BANNER_ID);
    if (b) {
      b.classList.remove('cc-hidden');
    } else {
      buildBanner();
    }
  }

  function addSettingsButton() {
    if (document.getElementById(SETTINGS_ID)) return;
    var btn = document.createElement('button');
    btn.id = SETTINGS_ID;
    btn.type = 'button';
    btn.textContent = 'Cookie settings';
    btn.addEventListener('click', function () {
      btn.parentNode && btn.parentNode.removeChild(btn);
      showBanner();
    });
    document.body.appendChild(btn);
  }

  function init() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    var state = read();
    if (state === 'accepted') {
      grant();
      addSettingsButton();
    } else if (state === 'rejected') {
      deny();
      addSettingsButton();
    } else {
      buildBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
