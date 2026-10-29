"""Static checks for built course pages. Usage: python -I tools/check_pages.py [name ...]  (from the course folder)
Checks src/<name>.html and dist/<name>.html: title, day structure, unique ids and persist keys, quiz size, leftovers, script syntax (node).
"""
import os, re, sys, subprocess, collections

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
names = sys.argv[1:] or [n[:-5] for n in sorted(os.listdir(os.path.join(HERE, 'src'))) if n.endswith('.html') and not n.startswith('_')]
bad = 0
for name in names:
    src_p = os.path.join(HERE, 'src', name + '.html'); dist_p = os.path.join(HERE, 'dist', name + '.html')
    if not os.path.exists(dist_p):
        print(f'{name}: NOT BUILT'); bad += 1; continue
    s = open(src_p, encoding='utf-8').read(); d = open(dist_p, encoding='utf-8').read()
    issues = []
    m = re.search(r'<title>([^<]*)</title>', s)
    if not m or not m.group(1).strip(): issues.append('no title')
    elif len(m.group(1).split()) > 5 or ':' in m.group(1) or ' - ' in m.group(1): issues.append('title should be a short name: ' + m.group(1))
    if name not in ('hub', 'playground'):
        panels = re.findall(r'<section class="scene daypanel" id="day(\d)"', s)
        if panels != ['1', '2', '3', '4', '5']: issues.append(f'day panels {panels}')
        if s.count('Course.days();') != 1: issues.append('Course.days() call missing or duplicated')
        if len(re.findall(r'id="dayt\d"', s)) != 5: issues.append('day strip buttons != 5')
        if len(re.findall(r'class="rail__pill" href="#day\d"', s)) != 5: issues.append('rail pills != 5')
        for pid in ('lab', 'quiz', 'build'):
            if f'id="{pid}"' not in s: issues.append(f'missing #{pid}')
        if 'id="wrapup"' not in s: issues.append('missing #wrapup')
        qs = len(re.findall(r'\{q:\s*[\'"]', s))
        if qs < 8: issues.append(f'quiz questions found: {qs}')
        if 'dlog' not in s: issues.append('no design-log block')
        for i in range(1, 5):
            if f'data-persist="d{i}"' not in s: issues.append(f'no Do-today checklist d{i}')
        if 'data-persist="lab"' not in s: issues.append('no lab checklist')
    ids = re.findall(r'\bid="([A-Za-z][\w:-]*)"', s)
    dup = [k for k, v in collections.Counter(ids).items() if v > 1]
    if dup: issues.append('duplicate ids: ' + ', '.join(dup[:8]))
    keys = re.findall(r'data-persist="([^"]+)"', s)
    dupk = [k for k, v in collections.Counter(keys).items() if v > 1]
    if dupk: issues.append('duplicate persist keys: ' + ', '.join(dupk))
    if '{{' in d: issues.append('literal {{ in built page')
    for tag in ('<!doctype', '<html', '<head', '<body'):
        if tag in s.lower()[:3000]: issues.append('contains ' + tag)
    if s.count('<script') != s.count('</script>'): issues.append('unbalanced script tags')
    for banned in ("Let's dive in", 'leverage', 'seamless', 'game-changer', 'supercharge', '—'):
        if banned in s: issues.append(f'banned word/char: {banned!r}')
    if re.search(r'https://claude\.ai/artifact/', s): issues.append('hard-coded artifact URL')
    if name != 'playground' and name != 'w2' and re.search(r'Course\.(ask|askJSON|runLive)\(', s): issues.append('live Claude call on a page without the sample capability')
    # script syntax
    scripts = re.findall(r'<script>(.*?)</script>', d, re.S)
    js_p = os.path.join(HERE, 'dist', '_' + name + '.js')
    open(js_p, 'w', encoding='utf-8').write('\n'.join(scripts[-1:]))
    r = subprocess.run(['node', '--check', js_p], capture_output=True, text=True, shell=True)
    if r.returncode != 0: issues.append('script syntax: ' + (r.stderr or r.stdout).strip().splitlines()[-1][:160])
    words = len(re.sub(r'<[^>]+>', ' ', re.sub(r'<script>.*?</script>|<style>.*?</style>', ' ', s, flags=re.S)).split())
    print(f'{name}: {len(s.splitlines())} lines, ~{words} words of markup text, {len(panels) if name not in ("hub","playground") else "-"} days, {qs if name not in ("hub","playground") else "-"} quiz q' + ('' if not issues else '\n   ISSUES: ' + '; '.join(issues)))
    bad += bool(issues)
print('pages with issues:', bad)
