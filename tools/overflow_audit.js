/* Overflow audit: loads a course page into a same-origin iframe at a chosen width, un-throttles animation,
   walks every day tab, pokes every control inside the charts, and reports
   - canvas text that leaves the canvas (clip), overlaps other text (overlap), or spills out of the box it sits in (box)
   - DOM text that spills out of its boxed container (spill)
   - SVG text that leaves its svg or overlaps other svg text
   - page-level horizontal scroll */
window.__R = window.__R || {};
window.__audit = async function(page, width, days, opts){
  opts = opts || {};
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let fr = document.getElementById('__af'); if (fr) fr.remove();
  fr = document.createElement('iframe'); fr.id = '__af';
  fr.style.cssText = 'position:fixed;left:0;top:0;width:' + width + 'px;height:900px;border:0;z-index:99999;background:#fff';
  document.body.appendChild(fr);
  const html = await (await fetch(page + (page.indexOf('?') >= 0 ? '&' : '?') + 'a=' + Date.now(), {cache: 'no-store'})).text();
  const pre = '<script>(function(){function IO(cb){this.cb=cb;}IO.prototype.observe=function(el){var cb=this.cb,s=this;setTimeout(function(){cb([{isIntersecting:true,target:el,intersectionRatio:1}],s);},0);};IO.prototype.unobserve=function(){};IO.prototype.disconnect=function(){};IO.prototype.takeRecords=function(){return[];};window.IntersectionObserver=IO;window.requestAnimationFrame=function(cb){return setTimeout(function(){cb(performance.now());},16);};window.cancelAnimationFrame=function(i){clearTimeout(i);};})();<\/script>';
  const loaded = new Promise(r => { fr.onload = r; });
  fr.srcdoc = html.replace(/<head[^>]*>/i, m => m + pre);
  await loaded;
  const W = fr.contentWindow, D = W.document;
  try { await D.fonts.ready; } catch (e) {}
  await sleep(600);
  const recs = [], frameOf = new Map();
  const P = W.CanvasRenderingContext2D.prototype;
  const oFill = P.fillText, oStroke = P.strokeText, oClear = P.clearRect, oRR = P.roundRect, oRect = P.rect, oFR = P.fillRect, oSR = P.strokeRect;
  function scale(c){ const r = c.getBoundingClientRect(); return r.width ? c.width / r.width : 1; }
  function rot(m){ return Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6; }
  function recText(ctx, text, x, y, maxW){
    const c = ctx.canvas; if (!c || !c.isConnected) return;
    text = String(text); if (!text.trim()) return;
    const m = ctx.getTransform(); if (rot(m)) return;
    const mt = ctx.measureText(text); let w = mt.width; if (maxW !== undefined && maxW !== null && maxW < w) w = maxW;
    const al = ctx.textAlign;
    let x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x;
    /* leading and trailing spaces take width but draw nothing: measure only the visible glyphs */
    const lead = text.length - text.replace(/^\s+/, '').length, trail = text.length - text.replace(/\s+$/, '').length;
    if (lead) { const lw = ctx.measureText(text.slice(0, lead)).width; x0 += lw; w -= lw; }
    if (trail) w -= ctx.measureText(text.slice(text.length - trail)).width;
    const s = scale(c);
    const L = (m.a * x0 + m.e) / s, R = (m.a * (x0 + w) + m.e) / s, T = (m.d * (y - mt.actualBoundingBoxAscent) + m.f) / s, B = (m.d * (y + mt.actualBoundingBoxDescent) + m.f) / s;
    recs.push({c: c, f: frameOf.get(c) || 0, k: 't', text: text, L: Math.min(L, R), R: Math.max(L, R), T: Math.min(T, B), B: Math.max(T, B), a: ctx.globalAlpha});
  }
  function recRect(ctx, x, y, w, h){
    const c = ctx.canvas; if (!c) return; const m = ctx.getTransform(); if (rot(m)) return;
    const s = scale(c);
    const L = (m.a * x + m.e) / s, R = (m.a * (x + w) + m.e) / s, T = (m.d * y + m.f) / s, B = (m.d * (y + h) + m.f) / s;
    recs.push({c: c, f: frameOf.get(c) || 0, k: 'r', L: Math.min(L, R), R: Math.max(L, R), T: Math.min(T, B), B: Math.max(T, B)});
  }
  function boundary(ctx, w, h){ const c = ctx.canvas, m = ctx.getTransform(); if (Math.abs(w * m.a) >= c.width * 0.9 && Math.abs(h * m.d) >= c.height * 0.9) { frameOf.set(c, (frameOf.get(c) || 0) + 1); return true; } return false; }
  P.fillText = function(t, x, y, mw){ recText(this, t, x, y, mw); return oFill.apply(this, arguments); };
  P.strokeText = function(t, x, y, mw){ recText(this, t, x, y, mw); return oStroke.apply(this, arguments); };
  P.clearRect = function(x, y, w, h){ boundary(this, w, h); return oClear.apply(this, arguments); };
  if (oRR) P.roundRect = function(x, y, w, h){ recRect(this, x, y, w, h); return oRR.apply(this, arguments); };
  P.rect = function(x, y, w, h){ recRect(this, x, y, w, h); return oRect.apply(this, arguments); };
  P.fillRect = function(x, y, w, h){ if (!boundary(this, w, h)) recRect(this, x, y, w, h); return oFR.apply(this, arguments); };
  P.strokeRect = function(x, y, w, h){ recRect(this, x, y, w, h); return oSR.apply(this, arguments); };
  if (W.Course && W.Course.roundRect) { const oCR = W.Course.roundRect; W.Course.roundRect = function(ctx, x, y, w, h){ recRect(ctx, x, y, w, h); return oCR.apply(this, arguments); }; }

  const visible = el => !!(el && el.getClientRects().length && el.getBoundingClientRect().width > 0);
  function nameOf(el){ if (!el) return '?'; let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; else if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.'); return s; }
  function where(el){ const art = el.closest('article.concept, section.hero, .lab, #quiz, .practice, section'); const h = art && art.querySelector('h3, h2, h1'); return (h ? h.textContent.trim().slice(0, 40) : (art ? nameOf(art) : '')); }
  function canvasName(c){ return (c.id ? '#' + c.id : nameOf(c.parentElement) + '>canvas') + ' [' + where(c) + ']'; }
  function forceDraw(){ D.querySelectorAll('canvas').forEach(c => { if (visible(c) && c.__course) { try { c.__course.once(); } catch (e) {} } }); }
  async function sample(ms){ const t0 = performance.now(); while (performance.now() - t0 < ms) { forceDraw(); await sleep(110); } }

  const issues = new Map();
  function add(key, data){ key = key.replace(/\d/g, '#'); const o = issues.get(key); if (o) { o.n++; if (data.amt > o.amt) Object.assign(o, data, {n: o.n}); } else issues.set(key, Object.assign({n: 1}, data)); }

  function canvasCheck(day){
    const byC = new Map(), local = new Map();
    const addL = (key, data) => { const o = local.get(key); if (o) { o.cnt++; if (data.amt > o.amt) Object.assign(o, data, {cnt: o.cnt}); } else local.set(key, Object.assign({cnt: 1}, data)); };
    recs.forEach(r => { if (!r.c.isConnected || !visible(r.c)) return; let m = byC.get(r.c); if (!m) byC.set(r.c, m = new Map()); let fl = m.get(r.f); if (!fl) m.set(r.f, fl = {t: [], r: []}); fl[r.k].push(r); });
    byC.forEach((frames, c) => {
      const cr = c.getBoundingClientRect(), cw = cr.width, ch = cr.height, nm = canvasName(c), dk = c.closest('.hero') ? 'hero' : 'd' + day;
      const frameCount = frames.size;
      frames.forEach(fl => {
        const ts = fl.t.filter(t => t.a > 0.25);
        ts.forEach(t => {
          if (t.R < 0 || t.L > cw || t.B < 0 || t.T > ch) return;   /* wholly off-canvas: invisible, e.g. a card waiting to slide in */
          const over = Math.max(-t.L, t.R - cw), overY = Math.max(-t.T, t.B - ch);
          if (over > 1.5) addL(dk + '|' + nm + '|clip|' + t.text, {kind: 'canvas clip-x', where: nm, day: dk, text: t.text, amt: Math.round(over), info: 'canvas ' + Math.round(cw) + 'px, text ' + Math.round(t.L) + '..' + Math.round(t.R), frames: frameCount});
          else if (overY > 3) addL(dk + '|' + nm + '|clipy|' + t.text, {kind: 'canvas clip-y', where: nm, day: dk, text: t.text, amt: Math.round(overY), info: 'canvas h ' + Math.round(ch) + ', text ' + Math.round(t.T) + '..' + Math.round(t.B), frames: frameCount});
          const cx = (t.L + t.R) / 2, cy = (t.T + t.B) / 2;
          let best = null;
          fl.r.forEach(r => { const w = r.R - r.L, h = r.B - r.T; if (w < 10 || h < 10 || w * h > 0.45 * cw * ch) return; if (cx >= r.L && cx <= r.R && cy >= r.T && cy <= r.B) { if (!best || w * h < (best.R - best.L) * (best.B - best.T)) best = r; } });
          if (best) { const ov = Math.max(best.T - t.T, t.B - best.B); if (ov > 2.5) addL(dk + '|' + nm + '|boxv|' + t.text, {kind: 'canvas text leaves its box vertically', where: nm, day: dk, text: t.text, amt: Math.round(ov), info: 'box ' + Math.round(best.B - best.T) + 'px tall', frames: frameCount}); const o = Math.max(best.L - t.L, t.R - best.R); if (o > 0.6) addL(dk + '|' + nm + '|box|' + t.text, {kind: 'canvas text leaves its box', where: nm, day: dk, text: t.text, amt: Math.round(o), info: 'box ' + Math.round(best.R - best.L) + 'px wide, text ' + Math.round(t.R - t.L) + 'px', frames: frameCount}); }
        });
        for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
          const a = ts[i], b = ts[j];
          if (a.text === b.text && Math.abs(a.L - b.L) < 3 && Math.abs(a.T - b.T) < 3) continue;
          const iw = Math.min(a.R, b.R) - Math.max(a.L, b.L), ih = Math.min(a.B, b.B) - Math.max(a.T, b.T);
          if (iw <= 1 || ih <= 1) continue;
          const area = iw * ih, small = Math.min((a.R - a.L) * (a.B - a.T), (b.R - b.L) * (b.B - b.T));
          if (small > 0 && area > 0.2 * small) addL(dk + '|' + nm + '|ov|' + [a.text, b.text].sort().join(' ⟂ '), {kind: 'canvas text overlap', where: nm, day: dk, text: a.text + '  ⟂  ' + b.text, amt: Math.round(Math.min(iw, ih)), info: 'overlap ' + Math.round(iw) + 'x' + Math.round(ih) + 'px', frames: frameCount});
        }
      });
    });
    local.forEach((o, key0) => { const key = key0.replace(/\d/g, '#'); const frac = o.cnt / Math.max(1, o.frames); if (/clip/.test(o.kind) && frac < 0.35) return; const prev = issues.get(key); if (prev) { prev.n++; if (frac > prev.frac) prev.frac = frac; if (o.amt > prev.amt) { prev.amt = o.amt; prev.info = o.info; } } else issues.set(key, Object.assign({n: 1, frac: frac}, o)); });
    recs.length = 0;
  }

  function hasBox(cs){ const bg = cs.backgroundColor; const alpha = /rgba?\(([^)]+)\)/.exec(bg); const a = alpha ? (alpha[1].split(',')[3] === undefined ? 1 : parseFloat(alpha[1].split(',')[3])) : 0; return a > 0.05 || cs.backgroundImage !== 'none' || parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderRightWidth) > 0 || parseFloat(cs.borderTopWidth) > 0; }
  function domCheck(day){
    const walker = D.createTreeWalker(D.body, W.NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const pe = n.parentElement; if (!pe || /^(SCRIPT|STYLE|NOSCRIPT|OPTION|TEXTAREA|TITLE)$/.test(pe.tagName)) continue;
      if (pe.closest('svg')) continue;
      const closed = pe.closest('details:not([open])'); if (closed && !pe.closest('summary')) continue;   /* collapsed content is not shown */
      const rg = D.createRange(); rg.selectNodeContents(n); const rects = [...rg.getClientRects()].filter(r => r.width > 0.5);
      if (!rects.length) continue;
      let el = pe, box = null, scrolled = false, ellipsis = false;
      while (el && el !== D.body) {
        const cs = W.getComputedStyle(el);
        if (cs.textOverflow === 'ellipsis') ellipsis = true;
        if (/(auto|scroll)/.test(cs.overflowX)) { scrolled = true; break; }
        if (cs.display !== 'inline' && hasBox(cs)) { box = el; break; }
        el = el.parentElement;
      }
      if (scrolled || ellipsis || !box) continue;
      const cs = W.getComputedStyle(box), br = box.getBoundingClientRect();
      const L = br.left + parseFloat(cs.borderLeftWidth), R = br.right - parseFloat(cs.borderRightWidth), T = br.top + parseFloat(cs.borderTopWidth), B = br.bottom - parseFloat(cs.borderBottomWidth);
      let o = 0, oy = 0; rects.forEach(r => { o = Math.max(o, L - r.left, r.right - R); oy = Math.max(oy, T - r.top, r.bottom - B); });
      const dk = pe.closest('.hero') ? 'hero' : (pe.closest('[role=tabpanel]') ? 'd' + day : 'page');
      const txt = n.nodeValue.trim().slice(0, 60);
      if (o > 1.5) add(dk + '|dom|' + nameOf(pe) + '|' + txt, {kind: 'DOM text spills sideways', where: nameOf(pe) + ' in ' + nameOf(box) + ' [' + where(pe) + ']', day: dk, text: txt, amt: Math.round(o), info: 'box ' + Math.round(R - L) + 'px', frames: 1});
      else if (oy > 3) add(dk + '|domy|' + nameOf(pe) + '|' + txt, {kind: 'DOM text spills vertically', where: nameOf(pe) + ' in ' + nameOf(box) + ' [' + where(pe) + ']', day: dk, text: txt, amt: Math.round(oy), info: 'box h ' + Math.round(B - T) + 'px', frames: 1});
    }
    D.querySelectorAll('svg').forEach(svg => {
      if (!visible(svg)) return; const sr = svg.getBoundingClientRect(); const op = el => { let o = 1; for (let e = el; e && e !== svg.parentElement; e = e.parentElement) o *= parseFloat(W.getComputedStyle(e).opacity || '1'); return o; };
      const texts = [...svg.querySelectorAll('text')].filter(t => visible(t) && op(t) > 0.3).map(t => ({t: t, r: t.getBoundingClientRect(), s: t.textContent.trim()})).filter(x => x.s);
      texts.forEach(x => { const o = Math.max(sr.left - x.r.left, x.r.right - sr.right); if (o > 1.5) add('svg|' + where(svg) + '|' + x.s, {kind: 'SVG text clipped', where: nameOf(svg) + ' [' + where(svg) + ']', day: 'd' + day, text: x.s.slice(0, 60), amt: Math.round(o), info: '', frames: 1}); });
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) { const a = texts[i].r, b = texts[j].r; const iw = Math.min(a.right, b.right) - Math.max(a.left, b.left), ih = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (iw > 1 && ih > 1 && iw * ih > 0.2 * Math.min(a.width * a.height, b.width * b.height)) add('svgov|' + where(svg) + '|' + texts[i].s + texts[j].s, {kind: 'SVG text overlap', where: nameOf(svg) + ' [' + where(svg) + ']', day: 'd' + day, text: texts[i].s.slice(0, 30) + '  ⟂  ' + texts[j].s.slice(0, 30), amt: Math.round(Math.min(iw, ih)), info: '', frames: 1}); }
    });
    const sw = D.documentElement.scrollWidth - W.innerWidth; if (sw > 1) add('page|hscroll', {kind: 'page scrolls sideways', where: 'page', day: 'd' + day, text: '', amt: sw, info: '', frames: 1});
  }

  async function poke(){
    const scope = [...D.querySelectorAll('.concept__viz, .stage')].filter(visible);
    for (const s of scope) {
      const ranges = [...s.querySelectorAll('input[type=range]')].filter(visible);
      for (const r of ranges) { const v = r.value; for (const val of [r.max, r.min, v]) { r.value = val; r.dispatchEvent(new W.Event('input', {bubbles: true})); r.dispatchEvent(new W.Event('change', {bubbles: true})); forceDraw(); await sleep(140); domCheck(curDay); } }
      const sels = [...s.querySelectorAll('select')].filter(visible);
      for (const sel of sels) { const v = sel.value; for (const o of [...sel.options].slice(0, 6)) { sel.value = o.value; sel.dispatchEvent(new W.Event('change', {bubbles: true})); sel.dispatchEvent(new W.Event('input', {bubbles: true})); forceDraw(); await sleep(140); domCheck(curDay); } sel.value = v; sel.dispatchEvent(new W.Event('change', {bubbles: true})); }
      const btns = [...s.querySelectorAll('button')].filter(b => visible(b) && !b.disabled && !b.hasAttribute('data-go') && !b.hasAttribute('data-copy') && !/start over|reset|clear|undo/i.test(b.textContent)).slice(0, opts.maxButtons || 30);
      for (const b of btns) { try { b.click(); } catch (e) {} forceDraw(); await sleep(opts.clickWait || 260); domCheck(curDay); }
    }
    await sample(opts.settle || 3000);
  }

  let curDay = 0;
  const C = W.Course;
  const nDays = D.querySelectorAll('section[id^="day"][role="tabpanel"]').length;
  const list = days && days.length ? days : (nDays ? Array.from({length: nDays}, (_, i) => i + 1) : [0]);
  for (const d of list) {
    curDay = d;
    if (d && C && C.showDay) { C.showDay(d, false); }
    await sleep(350);
    D.querySelectorAll('canvas').forEach(c => { if (visible(c) && c.__course) { try { c.__course.resize(); } catch (e) {} } });
    await sample(opts.idle || 1200);
    domCheck(d); canvasCheck(d);
    if (!opts.noPoke) { await poke(); domCheck(d); canvasCheck(d); }
  }
  const out = [...issues.values()].sort((a, b) => (a.day + a.where).localeCompare(b.day + b.where));
  const key = page + '@' + width;
  window.__R[key] = out;
  fr.remove();
  return key + ': ' + out.length + ' issues\n' + out.map(o => '- ' + o.day + ' ' + o.kind + ' | ' + o.where + ' | "' + o.text + '" | ' + o.amt + 'px ' + o.info + (o.frac !== undefined ? ' | ' + Math.round(o.frac * 100) + '% of frames' : '')).join('\n');
};
'audit ready';
