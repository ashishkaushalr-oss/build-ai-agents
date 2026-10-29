/* Web-app behaviour for the static site only (build.py --site inlines this after sync.js; the Claude artifacts never get it).
   1. Registers the service worker that keeps every page available offline.
   2. On the hub, on a phone or tablet that has not installed the course yet, shows a small card explaining how to add it
      to the home screen (one tap where the browser offers an install prompt, two taps in Safari). Dismissal is remembered
      on this device only. */
(function(){
  'use strict';
  var site = window.COURSE_SITE, Course = window.Course;
  if (!site || !Course) return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }
  if (site.page !== 'hub') return;

  var KEY = 'aiagents-ui:installhint';          /* outside the aiagents: prefix, so account sync leaves it alone */
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}
  var ua = navigator.userAgent || '';
  var handheld = (window.matchMedia && matchMedia('(max-width: 900px)').matches) || /iphone|ipad|ipod|android/i.test(ua);
  if (standalone || dismissed || !handheld) return;
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  var deferred = null, card = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; render(); });
  window.addEventListener('appinstalled', function(){ remember(); remove(); });

  function remember(){ try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  function remove(){ if (card && card.parentNode) card.parentNode.removeChild(card); card = null; }

  function render(){
    var main = document.querySelector('main.wrap') || document.querySelector('main');
    if (!main) return;
    remove();
    var how = isIOS
      ? 'In Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>. It opens full screen and every week works offline.'
      : deferred
        ? 'One tap installs it. It then opens like an app and every week works offline.'
        : 'In your browser menu, choose <b>Install app</b> or <b>Add to Home screen</b>. It then works offline.';
    card = document.createElement('aside');
    card.className = 'install'; card.id = 'installHint'; card.setAttribute('role', 'note');
    card.innerHTML = '<img src="icon-192.png" alt="" width="44" height="44">'
      + '<div class="install__text"><b>Keep the course on your phone</b><span>' + how + '</span></div>'
      + (deferred ? '<button class="btn btn--small" type="button" data-install>Install</button>' : '')
      + '<button class="install__x" type="button" aria-label="Dismiss">&times;</button>';
    main.insertBefore(card, main.firstChild);
    var go = card.querySelector('[data-install]');
    if (go) go.addEventListener('click', function(){
      var p = deferred; deferred = null;
      if (!p) return;
      p.prompt();
      p.userChoice.then(function(c){ if (c && c.outcome === 'accepted') { remember(); remove(); } else render(); });
    });
    card.querySelector('.install__x').addEventListener('click', function(){ remember(); remove(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
