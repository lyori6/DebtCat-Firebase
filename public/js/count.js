// Counts one page view with no personal data: event, page path and a tester flag (D21, D22).
// Open any page with ?tester=on once in each browser you test with, and ?tester=off to undo.
// Until debtcat.com moves to the debtcat Worker (phase 4b), other hosts call it by full URL.
window.DC_API = location.hostname.endsWith('.workers.dev') ? '' : 'https://debtcat.debtcatai.workers.dev';
(function () {
  var tester = false;
  try {
    var flag = new URLSearchParams(location.search).get('tester');
    if (flag === 'on') localStorage.setItem('dc_tester', '1');
    if (flag === 'off') localStorage.removeItem('dc_tester');
    tester = localStorage.getItem('dc_tester') === '1';
  } catch (e) {}
  var body = JSON.stringify({ event: 'page_view', page: location.pathname, tester: tester });
  try {
    // text/plain needs no CORS preflight.
    navigator.sendBeacon(window.DC_API + '/api/count', new Blob([body], { type: 'text/plain' }));
  } catch (e) {}
})();
