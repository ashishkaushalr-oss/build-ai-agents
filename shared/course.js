/* Course runtime shared by every module page. Exposes window.Course. */
(function(){
  'use strict';
  var Course = window.Course = {};
  var PREFIX = 'aiagents:';
  Course.urls = window.COURSE_URLS || {};
  Course.motionOK = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  Course.cfg = {week: 0, title: ''};
  Course.sample = null;
  var listeners = [];

  /* ---------- storage (per-browser convenience; never the record of truth) ---------- */
  Course.store = {
    key: function(k){ return PREFIX + (Course.cfg.week != null ? 'w' + Course.cfg.week + ':' : '') + k; },
    get: function(k, d){ try { var v = localStorage.getItem(this.key(k)); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function(k, v){ try { localStorage.setItem(this.key(k), JSON.stringify(v)); } catch (e) {} Course.emit('store', k, v); }
  };
  Course.on = function(fn){ listeners.push(fn); };
  Course.emit = function(){ var a = arguments; listeners.forEach(function(fn){ try { fn.apply(null, a); } catch (e) {} }); };

  /* ---------- tiny DOM helper ---------- */
  Course.el = function(tag, attrs, children){
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k){
      var v = attrs[k];
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0,2) === 'on') n.addEventListener(k.slice(2), v);
      else if (v === false || v == null) {}
      else n.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function(c){ if (c == null) return; n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  };
  Course.$ = function(s, root){ return (root || document).querySelector(s); };
  Course.$$ = function(s, root){ return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  Course.esc = function(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  Course.clamp = function(v, a, b){ return Math.max(a, Math.min(b, v)); };
  Course.lerp = function(a, b, t){ return a + (b - a) * t; };
  Course.ease = function(t){ return t < .5 ? 2*t*t : -1 + (4 - 2*t)*t; };
  Course.fmt = function(n){ return Number(n).toLocaleString('en-US'); };
  Course.cssVar = function(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); };

  /* ---------- init: rail, weeks strip, checklists, footer ---------- */
  Course.init = function(cfg){
    Course.cfg = Object.assign({week: 0, title: '', sections: null, live: null}, cfg || {});
    document.documentElement.classList.toggle('no-motion', !Course.motionOK);
    renderWeeks();
    wireRail();
    Course.checklists();
    Course.notes();
    Course.summary();
    Course.sampleReady();
    Course.on(function(){ Course.summary(); updateRailDots(); });
    updateRailDots();
  };

  function renderWeeks(){
    var u = Course.urls, cur = Course.cfg.week;
    Course.$$('.weeks[data-weeks]').forEach(function(box){
      box.innerHTML = '';
      for (var i = 1; i <= 10; i++) {
        var href = (u.weeks && u.weeks[i-1]) || '#';
        var a = Course.el('a', {href: href, title: 'Week ' + i, class: i === cur ? 'is-current' : ''}, [String(i)]);
        if (i === cur) a.setAttribute('aria-current', 'page');
        box.appendChild(a);
      }
    });
    Course.$$('[data-href]').forEach(function(a){
      var k = a.getAttribute('data-href'), href = '#';
      if (k === 'hub') href = u.hub || '#';
      else if (k === 'doc') href = u.doc || '#';
      else if (k === 'playground') href = u.playground || '#';
      else if (/^w\d+$/.test(k)) href = (u.weeks && u.weeks[parseInt(k.slice(1),10)-1]) || '#';
      else if (k === 'prev') href = (cur > 1 && u.weeks && u.weeks[cur-2]) || u.hub || '#';
      else if (k === 'next') href = (cur < 10 && u.weeks && u.weeks[cur]) || u.hub || '#';
      else if (k === 'track') href = (u.hub || '#') + (u.hub ? '#w' + cur : '');
      var hash = a.getAttribute('data-hash'); a.setAttribute('href', href + (hash && href !== '#' ? hash : ''));
      if (href === '#') a.classList.add('is-unlinked');
      if (/^https?:/.test(href)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    });
  }

  function wireRail(){
    var pills = Course.$$('.rail__pill');
    if (!pills.length) return;
    var secs = pills.map(function(p){ var id = (p.getAttribute('href') || '').slice(1); return document.getElementById(id); }).filter(Boolean);
    if ('IntersectionObserver' in window) {
      var seen = Course.store.get('seen', {});
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (e.isIntersecting) {
            pills.forEach(function(p){ p.classList.toggle('is-active', p.getAttribute('href') === '#' + e.target.id); });
            if (e.target.id === 'learn' && e.intersectionRatio > 0.05) { if (!seen.learn) { seen.learn = true; Course.store.set('seen', seen); } }
          }
        });
      }, {rootMargin: '-40% 0px -50% 0px', threshold: [0, .05, .2]});
      secs.forEach(function(s){ io.observe(s); });
    }
    pills.forEach(function(p){ p.addEventListener('click', function(ev){
      var id = (p.getAttribute('href') || '').slice(1), t = document.getElementById(id);
      if (t) { ev.preventDefault(); t.scrollIntoView({behavior: Course.motionOK ? 'smooth' : 'auto', block: 'start'}); }
    }); });
  }

  function updateRailDots(){
    var seen = Course.store.get('seen', {});
    Course.$$('.rail__pill').forEach(function(p){
      var id = (p.getAttribute('href') || '').slice(1), done = false;
      if (id === 'learn') done = !!seen.learn;
      else if (id === 'quiz') { var q = Course.store.get('quiz', null); done = !!(q && q.total && q.score / q.total >= 0.8); }
      else {
        var sec = document.getElementById(id);
        if (sec) { var boxes = Course.$$('input.check', sec); done = boxes.length > 0 && boxes.every(function(b){ return b.checked; }); }
      }
      p.classList.toggle('is-done', done);
    });
  }

  /* ---------- persisted checklists: any [data-persist] container with input.check[id] ---------- */
  Course.checklists = function(){
    Course.$$('[data-persist]').forEach(function(box){
      var key = 'ck:' + box.getAttribute('data-persist');
      var state = Course.store.get(key, {});
      Course.$$('input.check', box).forEach(function(cb){
        if (!cb.id) return;
        if (state[cb.id]) cb.checked = true;
        syncLi(cb);
        cb.addEventListener('change', function(){
          state[cb.id] = cb.checked; if (!cb.checked) delete state[cb.id];
          Course.store.set(key, state); syncLi(cb);
          var all = Course.$$('input.check', box);
          if (cb.checked && all.length > 1 && all.every(function(b){ return b.checked; })) { Course.toast('All done here. Nice work.'); Course.confetti(); }
        });
      });
      renderMeter(box);
      box.addEventListener('change', function(){ renderMeter(box); });
    });
    function syncLi(cb){ var li = cb.closest('li'); if (li) li.classList.toggle('done', cb.checked); }
    function renderMeter(box){
      var m = Course.$('[data-meter-for="' + box.getAttribute('data-persist') + '"]'); if (!m) return;
      var all = Course.$$('input.check', box), n = all.filter(function(b){ return b.checked; }).length;
      var bar = Course.$('.progress>i', m), lab = Course.$('[data-meter-label]', m);
      if (bar) bar.style.width = (all.length ? 100*n/all.length : 0) + '%';
      if (lab) lab.textContent = n + ' / ' + all.length;
    }
  };

  /* ---------- persisted notes: textarea[data-note] or input[data-note] ---------- */
  Course.notes = function(){
    Course.$$('[data-note]').forEach(function(t){
      var key = 'note:' + t.getAttribute('data-note');
      var v = Course.store.get(key, null); if (v != null) t.value = v;
      var timer;
      t.addEventListener('input', function(){ clearTimeout(timer); timer = setTimeout(function(){ Course.store.set(key, t.value); }, 350); });
    });
  };

  /* ---------- quiz ---------- */
  Course.quiz = function(sel, opts){
    var root = typeof sel === 'string' ? Course.$(sel) : sel; if (!root) return;
    var qs = opts.questions || [], key = opts.key || 'quiz', passPct = opts.passPct || 80;
    var answers = {}, result;
    root.classList.add('quiz'); root.innerHTML = '';
    qs.forEach(function(q, i){
      var card = Course.el('div', {class: 'q', id: 'q-' + i});
      card.appendChild(Course.el('div', {class: 'q__num', text: 'Question ' + (i+1) + ' of ' + qs.length}));
      card.appendChild(Course.el('div', {class: 'q__text', text: q.q}));
      var opts_ = Course.el('div', {class: 'opts', role: 'group', 'aria-label': 'Answers for question ' + (i+1)});
      q.options.forEach(function(o, j){
        var b = Course.el('button', {class: 'opt', type: 'button', id: 'q' + i + 'o' + j}, [Course.el('span', {class: 'opt__key', text: 'ABCD'[j]}), Course.el('span', {text: o})]);
        b.addEventListener('click', function(){ pick(i, j, card); });
        opts_.appendChild(b);
      });
      card.appendChild(opts_);
      root.appendChild(card);
    });
    result = Course.el('div', {class: 'quiz__result', hidden: true});
    root.appendChild(result);
    var best = Course.store.get(key, null);
    if (best && best.total) { var note = Course.el('p', {class: 'muted', text: 'Your best score so far: ' + best.score + ' of ' + best.total + '.'}); root.insertBefore(note, root.firstChild); }

    function pick(i, j, card){
      if (answers[i] != null) return;
      answers[i] = j;
      var q = qs[i], ok = j === q.answer;
      Course.$$('.opt', card).forEach(function(b, k){
        b.disabled = true;
        if (k === q.answer) b.classList.add('is-correct');
        if (k === j && !ok) b.classList.add('is-wrong');
      });
      var why = Course.el('div', {class: 'q__why' + (ok ? '' : ' is-bad')});
      why.innerHTML = '<b>' + (ok ? 'Correct.' : 'Not quite.') + '</b> ' + Course.esc(q.why);
      card.appendChild(why);
      if (Object.keys(answers).length === qs.length) finish();
    }
    function finish(){
      var score = qs.reduce(function(s, q, i){ return s + (answers[i] === q.answer ? 1 : 0); }, 0);
      var pct = Math.round(100 * score / qs.length), pass = pct >= passPct;
      var prev = Course.store.get(key, null);
      if (!prev || score > prev.score) Course.store.set(key, {score: score, total: qs.length, ts: Date.now()}); else Course.emit('store', key, prev);
      result.hidden = false; result.innerHTML = '';
      result.appendChild(Course.el('div', {class: 'quiz__score', html: score + '<small> / ' + qs.length + '</small>'}));
      var msg = pass ? (opts.passText || 'You passed this week\'s check. The tracker counts a score of ' + passPct + '% or more.') : (opts.failText || 'Read the explanations above, then reset and try again. You need ' + passPct + '% to pass.');
      var box = Course.el('div', {class: 'stack'});
      box.appendChild(Course.el('p', {html: '<strong>' + (pass ? 'Passed' : 'Keep going') + '</strong> · ' + Course.esc(msg)}));
      var reset = Course.el('button', {class: 'btn btn--small', type: 'button', text: 'Reset quiz'});
      reset.addEventListener('click', function(){ Course.quiz(root, opts); root.scrollIntoView({behavior: Course.motionOK ? 'smooth' : 'auto', block: 'start'}); });
      box.appendChild(reset);
      result.appendChild(box);
      result.scrollIntoView({behavior: Course.motionOK ? 'smooth' : 'auto', block: 'nearest'});
      if (pass) Course.confetti();
    }
  };

  /* ---------- summary footer ---------- */
  Course.summary = function(){
    var boxes = Course.$$('[data-persist]');
    var all = 0, done = 0;
    boxes.forEach(function(b){ Course.$$('input.check', b).forEach(function(c){ all++; if (c.checked) done++; }); });
    var q = Course.store.get('quiz', null);
    var set = function(name, v){ Course.$$('[data-stat="' + name + '"]').forEach(function(e){ e.textContent = v; }); };
    set('checks', done + '/' + all);
    set('checkspct', all ? Math.round(100*done/all) + '%' : '0%');
    set('quiz', q && q.total ? q.score + '/' + q.total : '–');
    var bar = Course.$('[data-stat-bar]'); if (bar) bar.style.width = (all ? 100*done/all : 0) + '%';
  };

  /* ---------- toast + confetti ---------- */
  var toastEl, toastT;
  Course.toast = function(msg, ms){
    if (!toastEl) { toastEl = Course.el('div', {class: 'toast', role: 'status'}); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('is-on'); }, ms || 2200);
  };
  Course.confetti = function(){
    if (!Course.motionOK) return;
    var c = Course.el('canvas', {class: 'confetti'}); document.body.appendChild(c);
    var ctx = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight;
    var cols = [Course.cssVar('--think'), Course.cssVar('--act'), Course.cssVar('--observe'), Course.cssVar('--warn')];
    var ps = []; for (var i = 0; i < 90; i++) ps.push({x: W/2 + (Math.random()-.5)*W*.4, y: H*.35, vx: (Math.random()-.5)*14, vy: -Math.random()*12-4, r: 4+Math.random()*5, c: cols[i%cols.length], a: Math.random()*6, s: (Math.random()-.5)*.3});
    var t0 = performance.now();
    (function f(now){
      var t = (now - t0)/1000; ctx.clearRect(0,0,W,H);
      ps.forEach(function(p){ p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.a += p.s; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - t/1.6); ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6); ctx.restore(); });
      if (t < 1.7) requestAnimationFrame(f); else c.remove();
    })(t0);
  };

  /* ---------- canvas loop with DPR + visibility handling ---------- */
  Course.canvas = function(canvas, draw, opts){
    opts = opts || {};
    var ctx = canvas.getContext('2d'), w = 0, h = 0, dpr = 1, running = false, visible = true, last = 0, raf = 0, t0 = performance.now(), paused = false;
    function resize(){
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
      api.once();
    }
    function frame(now){
      var dt = Math.min(.05, (now - last)/1000 || 0); last = now;
      try { draw(ctx, w, h, (now - t0)/1000, dt); } catch (e) { running = false; console.error(e); return; }
      if (running && visible && !document.hidden && !paused) raf = requestAnimationFrame(frame); else running = false;
    }
    var api = {
      start: function(){ paused = false; if (running || !Course.motionOK && !opts.force) { if (!running) api.once(); return; } running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop: function(){ running = false; paused = true; cancelAnimationFrame(raf); },
      once: function(){ try { draw(ctx, w, h, (performance.now()-t0)/1000, 0); } catch (e) { console.error(e); } },
      resetTime: function(){ t0 = performance.now(); },
      get w(){ return w; }, get h(){ return h; }, get ctx(){ return ctx; }, get running(){ return running; }
    };
    api.resize = resize; canvas.__course = api;   /* lets a page re-measure a canvas it has just un-hidden */
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if (visible && opts.auto !== false && !paused) api.start(); }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function(){ if (!document.hidden && visible && opts.auto !== false && !paused) api.start(); });
    resize();
    if (opts.auto !== false) api.start();
    return api;
  };
  Course.roundRect = function(ctx, x, y, w, h, r){ if (!(w > 0) || !(h > 0)) { ctx.beginPath(); return; } r = Math.max(0, Math.min(r, w/2, h/2)); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); };

  /* ---------- typewriter ---------- */
  Course.typewrite = function(el, text, cps){
    cps = cps || 40; el.textContent = '';
    if (!Course.motionOK) { el.textContent = text; return Promise.resolve(); }
    return new Promise(function(res){ var i = 0; (function step(){ el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(step, 1000/cps); else res(); })(); });
  };

  /* ---------- simple tabs: [data-tabs] > [role=tablist] button[data-tab] + [data-panel] ---------- */
  Course.tabs = function(){
    Course.$$('[data-tabs]').forEach(function(box){
      var btns = Course.$$('[data-tab]', box), panels = Course.$$('[data-panel]', box);
      function show(id){ btns.forEach(function(b){ b.classList.toggle('is-on', b.getAttribute('data-tab') === id); b.setAttribute('aria-selected', b.getAttribute('data-tab') === id); }); panels.forEach(function(p){ p.hidden = p.getAttribute('data-panel') !== id; }); }
      btns.forEach(function(b){ b.addEventListener('click', function(){ show(b.getAttribute('data-tab')); }); });
      var first = btns.filter(function(b){ return b.classList.contains('is-on'); })[0] || btns[0]; if (first) show(first.getAttribute('data-tab'));
    });
  };

  /* ---------- day tabs: #dayTabs .dayt buttons, section#dayN panels, rail pills #dayN, [data-go] buttons ---------- */
  Course.days = function(){
    var $ = Course.$, $$ = Course.$$;
    var DAYS = $$('section[id^="day"][role="tabpanel"]').length; if (!DAYS) return;
    var panels = {}, tabs = {}, pills = {}, cur = 0;
    for (var i = 1; i <= DAYS; i++) { panels[i] = $('#day' + i); tabs[i] = $('#dayt' + i); pills[i] = $('.rail__pill[href="#day' + i + '"]'); }
    function show(n, scroll){
      n = Course.clamp(n, 1, DAYS);
      if (n !== cur) {
        cur = n;
        for (var i = 1; i <= DAYS; i++) { panels[i].hidden = i !== n; if (tabs[i]) { tabs[i].classList.toggle('is-on', i === n); tabs[i].setAttribute('aria-selected', i === n ? 'true' : 'false'); } if (pills[i]) pills[i].classList.toggle('is-active', i === n); }
        Course.store.set('day', n);
        setTimeout(function(){ $$('canvas', panels[n]).forEach(function(c){ if (c.__course) c.__course.resize(); }); }, 0);
      }
      if (scroll) { var strip = $('#dayTabs'); (strip || panels[n]).scrollIntoView({behavior: Course.motionOK ? 'smooth' : 'auto', block: 'start'}); }
    }
    function dots(){ for (var i = 1; i <= DAYS; i++) { if (!tabs[i]) continue; var cks = $$('input.check', panels[i]); tabs[i].classList.toggle('is-done', cks.length > 0 && cks.every(function(c){ return c.checked; })); } }
    for (var i = 1; i <= DAYS; i++) (function(i){
      if (tabs[i]) tabs[i].addEventListener('click', function(){ show(i, true); });
      if (pills[i]) pills[i].addEventListener('click', function(ev){ ev.preventDefault(); show(i, true); });
    })(i);
    $$('[data-go]').forEach(function(b){ b.addEventListener('click', function(){ show(parseInt(b.getAttribute('data-go'), 10), true); }); });
    document.addEventListener('change', function(e){ if (e.target && e.target.classList && e.target.classList.contains('check')) dots(); });
    function fromHash(){ var m = /^#(?:day([1-9])|(lab|quiz|build))$/.exec(location.hash || ''); if (!m) return 0; return m[1] ? parseInt(m[1], 10) : DAYS; }
    function innerTarget(){ return /^#(lab|quiz|build)$/.test(location.hash || '') ? $(location.hash) : null; }
    show(fromHash() || Course.store.get('day', 1), false);
    var t0 = innerTarget(); if (t0) setTimeout(function(){ t0.scrollIntoView({block: 'start'}); }, 60);
    window.addEventListener('hashchange', function(){ var n = fromHash(); if (!n) return; show(n, !innerTarget()); var t = innerTarget(); if (t) setTimeout(function(){ t.scrollIntoView({behavior: Course.motionOK ? 'smooth' : 'auto', block: 'start'}); }, 80); });
    dots();
    Course.showDay = show;
  };

  /* ---------- live Claude (sample capability) ---------- */
  var sampleP = null;
  /* Live Claude is opt-in: a page passes Course.init({live: 'sample'}) when it declares that capability. Other pages never probe it. */
  Course.sampleReady = function(){
    if (!sampleP) {
      var cap = Course.cfg.live;
      sampleP = (cap && window.claude && typeof window.claude.use === 'function') ? window.claude.use(cap).catch(function(){ return null; }) : Promise.resolve(null);
      sampleP.then(function(s){
        Course.sample = s;
        document.documentElement.classList.toggle('has-live', !!s);
        Course.$$('[data-live-btn]').forEach(function(b){ b.disabled = !s; if (b.getAttribute('data-live-label')) b.textContent = b.getAttribute('data-live-label'); });
        Course.$$('[data-live-missing]').forEach(function(el){ el.hidden = !!s; });
        Course.$$('[data-live-only]').forEach(function(el){ el.hidden = !s; });
      });
    }
    return sampleP;
  };
  Course.friendly = function(code){
    return ({
      unavailable: 'Live Claude is not available in this view. Open the page inside Claude (claude.ai or the Claude app) to run it.',
      not_granted: 'You did not allow this page to use Claude. Allow it from the page menu, then try again.',
      rate_limited: 'Claude is busy or you reached a usage limit. Wait a minute, then try again.',
      cancelled: 'Stopped.',
      refused: 'Claude declined that request. Change the wording and try again.',
      prompt_too_large: 'That is too much text. Shorten it and try again.',
      invalid_json: 'Claude did not answer in the expected shape. Try again.',
      tools_unavailable: 'This view cannot run page tools yet. Open the page inside Claude on the web or in the app.',
      sampling_disabled: 'Claude is not available for this account.',
      empty_completion: 'Claude returned nothing. Simplify the request and try again.',
      session_expired: 'Your Claude session expired. Sign in again, then retry.'
    })[code] || 'Something went wrong talking to Claude. Try again in a moment.';
  };
  /* Course.ask(input, options) -> Promise<{text, truncated}>; rejects {code, message, friendly, text?} */
  Course.ask = function(input, options){
    return Course.sampleReady().then(function(s){
      if (!s) return Promise.reject({code: 'unavailable', message: 'sample unavailable', friendly: Course.friendly('unavailable')});
      return s(input, options || {}).catch(function(e){ e = e || {}; e.friendly = Course.friendly(e.code); throw e; });
    });
  };
  Course.askJSON = function(input, options){
    return Course.sampleReady().then(function(s){
      if (!s) return Promise.reject({code: 'unavailable', message: 'sample unavailable', friendly: Course.friendly('unavailable')});
      return s.json(input, options || {}).catch(function(e){ e = e || {}; e.friendly = Course.friendly(e.code); throw e; });
    });
  };
  /* Convenience: run a prompt into an output element with busy state, streaming and a stop button. */
  Course.runLive = function(cfg){
    var out = cfg.out, btn = cfg.button, stop = cfg.stop, ctl = new AbortController();
    if (stop) { stop.hidden = false; stop.onclick = function(){ ctl.abort(); }; }
    if (btn) btn.disabled = true;
    out.textContent = 'Thinking…'; out.classList.add('is-busy');
    return Course.ask(cfg.input, Object.assign({signal: ctl.signal, onText: function(u){ out.classList.remove('is-busy'); out.textContent = u.text; }}, cfg.options || {}))
      .then(function(r){ out.classList.remove('is-busy'); out.textContent = r.text + (r.truncated ? '\n\n[cut short: ask for less at a time]' : ''); return r; })
      .catch(function(e){ out.classList.remove('is-busy'); out.textContent = (e.text ? e.text + '\n\n' : '') + e.friendly; if (e.code === 'not_granted' || e.code === 'sampling_disabled' || e.code === 'unavailable') Course.$$('[data-live-btn]').forEach(function(b){ b.disabled = true; }); throw e; })
      .finally(function(){ if (btn) btn.disabled = !Course.sample; if (stop) stop.hidden = true; });
  };

  document.addEventListener('DOMContentLoaded', function(){ Course.tabs(); });
})();
