/* Account sync for the course when it runs outside Claude (GitHub Pages or any web host):
   Google sign-in plus one Firestore document per learner, through Firebase.
   Inside Claude the hub syncs through Claude's own database, so this file stays quiet there.
   It needs window.FIREBASE_CONFIG from shared/firebase-config.js; with no config, progress stays in the browser. */
(function(){
  'use strict';
  var Course = window.Course; if (!Course) return;
  var PREFIX = 'aiagents:', META = PREFIX + '_meta', SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  var insideClaude = !!(window.claude && typeof window.claude.use === 'function');
  var S = Course.sync = {enabled: false, status: 'off', detail: null, user: null, _listeners: []};
  var meta = {}, auth = null, db = null, ref = null, unsub = null, pushTimer = null, applying = false;
  try { meta = JSON.parse(localStorage.getItem(META) || '{}') || {}; } catch (e) { meta = {}; }
  function saveMeta(){ try { localStorage.setItem(META, JSON.stringify(meta)); } catch (e) {} }

  /* Every store write gets a timestamp, so two devices can be merged key by key, newest wins. */
  var origSet = Course.store.set;
  Course.store.set = function(k, v){
    origSet.call(Course.store, k, v);
    if (applying) return;
    meta[Course.store.key(k)] = Date.now(); saveMeta();
    if (ref) schedulePush();
  };

  function setStatus(s, extra){
    S.status = s; S.detail = extra || null;
    S._listeners.forEach(function(fn){ try { fn(s, extra); } catch (e) {} });
    Course.emit('syncstatus', s, extra);
    renderControl();
  }
  S.onStatus = function(fn){ S._listeners.push(fn); try { fn(S.status, S.detail); } catch (e) {} };
  S.describe = function(){
    return ({
      off: 'saved on this device only',
      loading: 'connecting to sign-in…',
      'signed-out': 'saved on this device · sign in with Google to keep it across devices',
      syncing: 'syncing with your Google account…',
      saved: 'saved to your Google account',
      error: 'saved on this device only (sync error)'
    })[S.status] || '';
  };

  /* Firestore field names cannot contain a dot, so keys are escaped on the way out and restored on the way in. */
  function enc(k){ return k.replace(/\./g, '%2E'); }
  function dec(k){ return k.replace(/%2E/g, '.'); }
  function localKeys(){
    var ks = [];
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0 && k !== META) ks.push(k); }
    return ks;
  }
  function snapshot(){
    var store = {}, ts = {};
    localKeys().forEach(function(k){ store[enc(k)] = localStorage.getItem(k); ts[enc(k)] = meta[k] || 0; });
    return {store: store, ts: ts, updated: Date.now()};
  }
  /* A value saved before sync existed has no stamp; if it is an object with its own `updated` time, use that. */
  function stampOf(raw, stamp){
    if (stamp) return stamp;
    try { var o = JSON.parse(raw); if (o && typeof o.updated === 'number') return o.updated; } catch (e) {}
    return 0;
  }
  /* Bring remote values in where they are newer. Returns the keys changed here and whether anything here is newer. */
  function merge(remote){
    var changed = [], newerHere = false, rs = (remote && remote.store) || {}, rt = (remote && remote.ts) || {};
    applying = true;
    Object.keys(rs).forEach(function(ek){
      var k = dec(ek), local = localStorage.getItem(k), has = local != null;
      var remoteTs = stampOf(rs[ek], rt[ek]), localTs = has ? stampOf(local, meta[k]) : 0;
      if (!has || remoteTs > localTs) { try { localStorage.setItem(k, rs[ek]); } catch (e) {} meta[k] = remoteTs; changed.push(k); }
      else if (localTs > remoteTs) newerHere = true;
    });
    applying = false;
    localKeys().forEach(function(k){ if (!(enc(k) in rs)) newerHere = true; });
    saveMeta();
    return {changed: changed, newerHere: newerHere};
  }
  S.snapshot = snapshot; S.merge = merge;

  function schedulePush(){ clearTimeout(pushTimer); pushTimer = setTimeout(push, 900); }
  function push(){
    if (!ref) return;
    ref.set(snapshot(), {merge: true}).then(function(){ setStatus('saved'); }).catch(function(e){ setStatus('error', e && e.code); });
  }
  function listen(){
    stop();
    unsub = ref.onSnapshot(function(snap){
      var r = merge(snap.exists ? snap.data() : null);
      if (!snap.exists || r.newerHere) schedulePush();
      if (r.changed.length) {
        Course.emit('sync', r.changed);
        if (!Course.syncHandled) { setTimeout(function(){ location.reload(); }, 60); return; }
      }
      setStatus('saved');
    }, function(e){ setStatus('error', e && e.code); });
  }
  function stop(){ if (unsub) { unsub(); unsub = null; } }

  function load(src){
    return new Promise(function(res, rej){
      var s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = function(){ rej(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  S.boot = function(cfg){
    if (!cfg || !cfg.apiKey || insideClaude || S.enabled) return Promise.resolve(false);
    S.enabled = true; setStatus('loading');
    return load(SDK + 'firebase-app-compat.js')
      .then(function(){ return load(SDK + 'firebase-auth-compat.js'); })
      .then(function(){ return load(SDK + 'firebase-firestore-compat.js'); })
      .then(function(){
        var fb = window.firebase;
        if (!(fb.apps && fb.apps.length)) fb.initializeApp(cfg);
        auth = fb.auth(); db = fb.firestore();
        auth.onAuthStateChanged(function(u){
          S.user = u ? {uid: u.uid, name: u.displayName || '', email: u.email || ''} : null;
          if (u) { ref = db.collection('users').doc(u.uid); setStatus('syncing'); listen(); }
          else { stop(); ref = null; setStatus('signed-out'); }
        });
        return true;
      })
      .catch(function(e){ S.enabled = false; setStatus('off', e && e.message); return false; });
  };
  S.signIn = function(){
    if (!auth) return Promise.resolve();
    var provider = new window.firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider).catch(function(e){
      var code = (e && e.code) || '';
      if (code === 'auth/popup-blocked') return auth.signInWithRedirect(provider);
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setStatus('error', code);
      if (Course.toast) Course.toast('Sign-in did not work (' + (code || 'unknown error') + '). Try again.');
    });
  };
  S.signOut = function(){ return auth ? auth.signOut() : Promise.resolve(); };

  /* The control in the page header: a sign-in button, or the first name and a sign-out button. */
  function renderControl(){
    var box = Course.$('.rail__links'); if (!box || !S.enabled) return;
    var el = Course.$('#syncControl', box);
    if (!el) { el = Course.el('span', {id: 'syncControl', class: 'sync-control'}); box.appendChild(el); }
    el.innerHTML = '';
    if (S.user) {
      var label = S.user.name ? S.user.name.split(' ')[0] : 'Signed in';
      el.appendChild(Course.el('span', {class: 'sync-user' + (S.status === 'error' ? ' is-error' : ''), title: S.describe(), text: (S.status === 'error' ? 'Not synced · ' : '') + label}));
      el.appendChild(Course.el('button', {type: 'button', onclick: function(){ S.signOut(); }, text: 'Sign out'}));
    } else {
      el.appendChild(Course.el('button', {type: 'button', disabled: S.status === 'loading', title: 'Keep your progress across devices', onclick: function(){ S.signIn(); }, text: S.status === 'loading' ? 'Loading…' : 'Sign in with Google'}));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderControl); else renderControl();
  if (window.FIREBASE_CONFIG) S.boot(window.FIREBASE_CONFIG);
})();
