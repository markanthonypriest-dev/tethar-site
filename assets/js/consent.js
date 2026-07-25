/* Tethar cookie consent — self-contained, no third-party service.
 *
 * DORMANT BY DESIGN: while the site sets no optional cookies, this shows nothing.
 * It wakes up automatically the moment an analytics (or other optional) script is
 * present, and then blocks that script until the visitor agrees.
 *
 * ── How to add analytics later (e.g. Google Analytics) ──────────────────────────
 *   Paste the provider's snippet like this — note type="text/plain" and the data
 *   attribute. It will NOT run until the visitor clicks "Accept".
 *
 *     <script type="text/plain" data-consent="analytics">
 *       // ...analytics snippet here...
 *     </script>
 *
 *   (or, for an external file:)
 *     <script type="text/plain" data-consent="analytics" src="https://.../gtag.js"></script>
 *
 *   That's it — the banner appears on its own and handles Accept / Reject correctly.
 *   The visitor's choice is remembered in their browser (this is a strictly-necessary
 *   preference, so it needs no consent itself). Reject is exactly as easy as Accept.
 */
(function () {
  'use strict';
  var KEY = 'tethar.consent';          // 'accepted' | 'rejected'
  var CAT = 'analytics';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Anything optional to consent to on this page?
  function hasGated() {
    return !!document.querySelector('script[type="text/plain"][data-consent="' + CAT + '"]')
        || window.TETHAR_HAS_ANALYTICS === true;
  }

  // Turn gated <script type="text/plain"> nodes into live scripts.
  function activate() {
    var nodes = document.querySelectorAll('script[type="text/plain"][data-consent="' + CAT + '"]');
    nodes.forEach(function (old) {
      var s = document.createElement('script');
      for (var i = 0; i < old.attributes.length; i++) {
        var a = old.attributes[i];
        if (a.name === 'type' || a.name === 'data-consent') continue;
        s.setAttribute(a.name, a.value);
      }
      if (old.src) s.src = old.src; else s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  function hide() { var b = document.getElementById('cookieBar'); if (b) b.remove(); }

  function build() {
    if (document.getElementById('cookieBar')) return;
    var bar = document.createElement('div');
    bar.id = 'cookieBar';
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Cookie choices');
    bar.innerHTML =
      '<div class="cookie-inner">' +
        '<p class="cookie-text">We’d like to set a few optional cookies to understand how the site is used. ' +
        'You can accept them, or carry on with only the essential ones. See our <a href="cookies.html">Cookie Policy</a>.</p>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="cookie-btn cookie-reject" id="ckReject">Reject optional</button>' +
          '<button type="button" class="cookie-btn cookie-accept" id="ckAccept">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    document.getElementById('ckAccept').addEventListener('click', function () { set('accepted'); activate(); hide(); });
    document.getElementById('ckReject').addEventListener('click', function () { set('rejected'); hide(); });
  }

  // Public API — e.g. a "Cookie settings" link can call window.tetharConsent.open()
  window.tetharConsent = {
    has: function () { return get() === 'accepted'; },
    open: function () { build(); },
    reset: function () { set('rejected'); }   // note: already-loaded scripts need a page reload to fully clear
  };

  function injectFooterLink() {
    document.querySelectorAll('.footer-col ul').forEach(function (ul) {
      if (ul.querySelector('a[href*="cookies"]') && !ul.querySelector('.cookie-settings-link')) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#'; a.className = 'cookie-settings-link'; a.textContent = 'Cookie settings';
        a.addEventListener('click', function (e) { e.preventDefault(); build(); });
        li.appendChild(a); ul.appendChild(li);
      }
    });
  }

  function init() {
    if (!hasGated()) return;            // nothing optional -> stay dormant, no banner
    var choice = get();
    if (choice === 'accepted') activate();
    else if (choice !== 'rejected') build();
    injectFooterLink();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
