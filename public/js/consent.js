// Cookie consent for DebtCat.
// Analytics (Google Analytics, Microsoft Clarity) and, on pages that opt in, ad measurement
// pixels (Meta, Taboola) load only after the visitor accepts.
// Load this file in <head> without async/defer so the gtag stub exists before other scripts use it.
(function () {
  var STORAGE_KEY = 'dcCookieConsent';
  var GA_ID = 'G-DMRMQNLTBZ';
  var CLARITY_ID = 'oc17kv2js6';
  var META_PIXEL_ID = '1138330744518964';
  var TABOOLA_ID = 1796097;

  // Pages opt in to ad pixels with data-meta-pixel / data-taboola-pixel on this script tag.
  var self = document.currentScript;
  var wantsMeta = !!(self && self.hasAttribute('data-meta-pixel'));
  var wantsTaboola = !!(self && self.hasAttribute('data-taboola-pixel'));

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    try { localStorage.removeItem('cookiesAccepted'); } catch (e) {}
  }

  var analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(ga);
    window.gtag('js', new Date());
    window.gtag('set', 'developer_id.dZGVlNj', true);
    window.gtag('config', GA_ID);

    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);

    if (wantsMeta) {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', META_PIXEL_ID);
      window.fbq('track', 'PageView');
    }

    if (wantsTaboola) {
      window._tfa = window._tfa || [];
      window._tfa.push({ notify: 'event', name: 'page_view', id: TABOOLA_ID });
      var tb = document.createElement('script');
      tb.async = true; tb.id = 'tb_tfa_script';
      tb.src = 'https://cdn.taboola.com/libtrc/unip/' + TABOOLA_ID + '/tfa.js';
      document.head.appendChild(tb);
    }

    document.dispatchEvent(new CustomEvent('dc:analytics-consent'));
  }

  // Lets page scripts check consent before sending optional analytics.
  window.dcConsent = {
    analyticsAllowed: function () { return readChoice() === 'accepted'; },
    open: function () { showBanner(); }
  };

  var STYLE = '' +
    '#dc-consent{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:10px 16px;' +
    'box-shadow:0 -1px 3px rgba(0,0,0,0.1);display:flex;justify-content:space-between;align-items:center;' +
    'gap:12px;z-index:9999;font-family:Arial,sans-serif;font-size:13px;line-height:1.4;color:#333}' +
    '#dc-consent p{margin:0;flex:1}' +
    '#dc-consent a{color:#3358EF;text-decoration:underline}' +
    '#dc-consent .dc-consent-actions{display:flex;gap:8px;flex-shrink:0}' +
    '#dc-consent button{font:inherit;padding:6px 14px;border-radius:4px;cursor:pointer;white-space:nowrap;' +
    'border:1px solid #3358EF;transition:background .2s ease}' +
    '#dc-consent .dc-decline{background:#fff;color:#3358EF}' +
    '#dc-consent .dc-decline:hover{background:#f0f3fe}' +
    '#dc-consent .dc-accept{background:#3358EF;color:#fff}' +
    '#dc-consent .dc-accept:hover{background:#254eda}' +
    '#dc-consent button:focus-visible{outline:2px solid #254eda;outline-offset:2px}' +
    '@media (max-width:600px){#dc-consent{flex-direction:column;align-items:stretch;padding:10px 12px;font-size:12px}' +
    '#dc-consent .dc-consent-actions{justify-content:flex-end}}';

  function showBanner() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', showBanner);
      return;
    }
    // Remove the older banner some pages still include.
    var legacy = document.getElementById('cookies-banner');
    if (legacy) legacy.parentNode.removeChild(legacy);
    if (document.getElementById('dc-consent')) return;

    if (!document.getElementById('dc-consent-style')) {
      var style = document.createElement('style');
      style.id = 'dc-consent-style';
      style.textContent = STYLE;
      document.head.appendChild(style);
    }

    var banner = document.createElement('div');
    banner.id = 'dc-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML =
      '<p>We use optional cookies for analytics and ad measurement to understand how the site is used. ' +
      'They stay off unless you accept. See our <a href="/s/privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="dc-consent-actions">' +
      '<button type="button" class="dc-decline">Decline</button>' +
      '<button type="button" class="dc-accept">Accept</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelector('.dc-accept').addEventListener('click', function () {
      saveChoice('accepted');
      banner.parentNode.removeChild(banner);
      loadAnalytics();
    });
    banner.querySelector('.dc-decline').addEventListener('click', function () {
      var wasAccepted = readChoice() === 'accepted';
      saveChoice('declined');
      banner.parentNode.removeChild(banner);
      // Scripts already running on this page cannot be unloaded, so reload to stop them.
      if (wasAccepted) window.location.reload();
    });
  }

  // Any link to #cookie-settings reopens the banner.
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href="#cookie-settings"]');
    if (!link) return;
    event.preventDefault();
    showBanner();
  });

  var choice = readChoice();
  if (choice === 'accepted') {
    loadAnalytics();
  } else if (choice !== 'declined') {
    showBanner();
  }
  // Hide the older banner on pages that still include it.
  document.addEventListener('DOMContentLoaded', function () {
    var legacy = document.getElementById('cookies-banner');
    if (legacy) legacy.parentNode.removeChild(legacy);
  });
})();
